import { mockSupplierBenchmarks, parseMockUploadData } from "@/lib/mock-data"
import { ParsedUploadData, UploadedProductRow, ValidationResult } from "@/lib/schema"
import { validateUploadData } from "@/lib/validation"

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))

export interface ProductScoreRow {
  productName: string
  category: string
  supplierName: string
  location: string
  unitCost: number
  sellingPrice: number
  unitsSold: number
  stockUnits: number
  marginPercent: number
  revenue: number
  profit: number
  score: number
  status: "Strong" | "Stable" | "Needs Attention"
}

export interface SupplierScoreRow {
  supplierName: string
  productsSupplied: number
  averageUnitCost: number
  averageMarginPercent: number
  leadTimeDays: number
  reliabilityRate: number
  score: number
  impact: "Positive" | "Neutral" | "Negative"
}

export interface CategoryComparisonRow {
  category: string
  revenue: number
  marginPercent: number
  healthScore: number
}

export interface BusinessReport {
  healthScore: number
  previousHealthScore: number
  delta: number
  averageMarginPercent: number
  dataQualityScore: number
  productRows: ProductScoreRow[]
  supplierRows: SupplierScoreRow[]
  categoryRows: CategoryComparisonRow[]
  improvingFactors: string[]
  harmingFactors: string[]
  increaseActions: string[]
  avoidActions: string[]
}

type ValidProductRow = {
  productName: string
  category: string
  supplierName: string
  sellingLocation: string
  unitCost: number
  sellingPrice: number
  unitsSold: number
  stockUnits: number
}

function toValidRows(rows: UploadedProductRow[]): ValidProductRow[] {
  return rows
    .filter(
      (row) =>
        !!row.productName &&
        !!row.category &&
        !!row.supplierName &&
        !!row.sellingLocation &&
        row.unitCost !== null &&
        row.sellingPrice !== null &&
        row.unitsSold !== null
    )
    .map((row) => ({
      productName: row.productName,
      category: row.category,
      supplierName: row.supplierName,
      sellingLocation: row.sellingLocation,
      unitCost: row.unitCost as number,
      sellingPrice: row.sellingPrice as number,
      unitsSold: row.unitsSold as number,
      stockUnits: row.stockUnits ?? 0,
    }))
}

function buildProductScores(rows: ValidProductRow[]): ProductScoreRow[] {
  return rows
    .map((row) => {
      const marginPercent = row.sellingPrice > 0
        ? ((row.sellingPrice - row.unitCost) / row.sellingPrice) * 100
        : 0
      const revenue = row.sellingPrice * row.unitsSold
      const profit = (row.sellingPrice - row.unitCost) * row.unitsSold
      const stockCoverage = row.stockUnits === 0 ? 100 : clamp((row.unitsSold / row.stockUnits) * 100)

      const score = clamp(
        marginPercent * 0.45 +
          clamp((row.unitsSold / 1200) * 100) * 0.3 +
          stockCoverage * 0.25
      )

      const status: ProductScoreRow["status"] =
        score >= 75 ? "Strong" : score >= 55 ? "Stable" : "Needs Attention"

      return {
        productName: row.productName,
        category: row.category,
        supplierName: row.supplierName,
        location: row.sellingLocation,
        unitCost: row.unitCost,
        sellingPrice: row.sellingPrice,
        unitsSold: row.unitsSold,
        stockUnits: row.stockUnits,
        marginPercent,
        revenue,
        profit,
        score,
        status,
      }
    })
    .sort((a, b) => b.score - a.score)
}

function buildSupplierScores(productRows: ProductScoreRow[]): SupplierScoreRow[] {
  const grouped = productRows.reduce<Record<string, ProductScoreRow[]>>((acc, row) => {
    acc[row.supplierName] = acc[row.supplierName] ? [...acc[row.supplierName], row] : [row]
    return acc
  }, {})

  return Object.entries(grouped)
    .map(([supplierName, rows]) => {
      const benchmark = mockSupplierBenchmarks.find((item) => item.supplierName === supplierName)
      const avgMargin = rows.reduce((sum, row) => sum + row.marginPercent, 0) / rows.length
      const avgCost = rows.reduce((sum, row) => sum + row.unitCost, 0) / rows.length

      const reliabilityRate = benchmark?.reliabilityRate ?? 78
      const leadTimeDays = benchmark?.leadTimeDays ?? 8

      const leadTimeScore = clamp(100 - (leadTimeDays - 2) * 8)
      const score = clamp(avgMargin * 0.4 + reliabilityRate * 0.35 + leadTimeScore * 0.25)

      const impact: SupplierScoreRow["impact"] =
        score >= 75 ? "Positive" : score >= 60 ? "Neutral" : "Negative"

      return {
        supplierName,
        productsSupplied: rows.length,
        averageUnitCost: avgCost,
        averageMarginPercent: avgMargin,
        leadTimeDays,
        reliabilityRate,
        score,
        impact,
      }
    })
    .sort((a, b) => b.score - a.score)
}

function buildCategoryComparison(productRows: ProductScoreRow[]): CategoryComparisonRow[] {
  const grouped = productRows.reduce<
    Record<string, { revenue: number; profit: number; scoreTotal: number; count: number }>
  >((acc, row) => {
    const existing = acc[row.category] ?? { revenue: 0, profit: 0, scoreTotal: 0, count: 0 }

    acc[row.category] = {
      revenue: existing.revenue + row.revenue,
      profit: existing.profit + row.profit,
      scoreTotal: existing.scoreTotal + row.score,
      count: existing.count + 1,
    }

    return acc
  }, {})

  return Object.entries(grouped)
    .map(([category, values]) => {
      const marginPercent = values.revenue > 0 ? (values.profit / values.revenue) * 100 : 0
      const healthScore = values.count > 0 ? values.scoreTotal / values.count : 0

      return {
        category,
        revenue: values.revenue,
        marginPercent,
        healthScore,
      }
    })
    .sort((a, b) => b.healthScore - a.healthScore)
}

export function buildBusinessReportFromParsed(
  parsedData: ParsedUploadData,
  validation: ValidationResult,
  previousHealthScore = 0
): BusinessReport {
  const usableRows = toValidRows(parsedData.rows)
  const productRows = buildProductScores(usableRows)
  const supplierRows = buildSupplierScores(productRows)
  const categoryRows = buildCategoryComparison(productRows)

  const averageMarginPercent =
    productRows.length > 0
      ? productRows.reduce((sum, row) => sum + row.marginPercent, 0) / productRows.length
      : 0

  const avgProductScore =
    productRows.length > 0
      ? productRows.reduce((sum, row) => sum + row.score, 0) / productRows.length
      : 0

  const avgSupplierScore =
    supplierRows.length > 0
      ? supplierRows.reduce((sum, row) => sum + row.score, 0) / supplierRows.length
      : 0

  const computedHealthScore = Math.round(
    clamp(avgProductScore * 0.45 + avgSupplierScore * 0.3 + validation.dataQualityScore * 0.25)
  )

  const resolvedPrevious = previousHealthScore > 0 ? previousHealthScore : Math.max(0, computedHealthScore - 4)

  const topCategory = categoryRows[0]
  const weakProducts = productRows.filter((row) => row.score < 55)

  return {
    healthScore: computedHealthScore,
    previousHealthScore: resolvedPrevious,
    delta: computedHealthScore - resolvedPrevious,
    averageMarginPercent,
    dataQualityScore: validation.dataQualityScore,
    productRows,
    supplierRows,
    categoryRows,
    improvingFactors: [
      topCategory
        ? `${topCategory.category} is leading with ${topCategory.marginPercent.toFixed(1)}% margin.`
        : "Your top category is trending up.",
      supplierRows[0]
        ? `${supplierRows[0].supplierName} is reliable with a supplier score of ${supplierRows[0].score.toFixed(0)}.`
        : "Top suppliers are stable.",
      "High-performing products are keeping revenue growth healthy.",
    ],
    harmingFactors: [
      validation.errors.length
        ? `${validation.errors.length} critical data errors are reducing score accuracy.`
        : "No critical data errors detected.",
      weakProducts.length
        ? `${weakProducts.length} products need attention due to weak margins or slow turnover.`
        : "Most products are in a stable range.",
      supplierRows.some((item) => item.impact === "Negative")
        ? "One supplier shows low reliability and longer lead times."
        : "Supplier network is stable.",
    ],
    increaseActions: [
      "Fix missing unit costs and supplier fields to improve data quality score.",
      "Prioritize reorder budget for strong-score products with high demand.",
      "Reduce overstocked low-margin products through bundles or discounts.",
    ],
    avoidActions: [
      "Do not scale ad spend on products scoring below 55.",
      "Do not restock items where margin is under 15% without repricing.",
      "Do not rely on a single low-reliability supplier for core products.",
    ],
  }
}

export function buildBusinessReport(): BusinessReport {
  const parsed = parseMockUploadData("excel")
  const validation = validateUploadData(parsed)
  return buildBusinessReportFromParsed(parsed, validation)
}
