import {
  ParsedUploadData,
  UploadedProductRow,
  ValidationIssue,
  ValidationResult,
} from "@/lib/schema"

function hasValue(value: string | number | null): boolean {
  if (value === null) return false
  if (typeof value === "number") return Number.isFinite(value)
  return value.trim().length > 0
}

function completionRate(rows: UploadedProductRow[]): number {
  if (!rows.length) return 0

  const requiredCells = rows.length * 7
  const filledCells = rows.reduce((count, row) => {
    const values = [
      row.productName,
      row.category,
      row.supplierName,
      row.sellingLocation,
      row.unitCost,
      row.sellingPrice,
      row.unitsSold,
    ]

    return count + values.filter((item) => hasValue(item)).length
  }, 0)

  return Math.round((filledCells / requiredCells) * 100)
}

function rowValidation(row: UploadedProductRow): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!row.productName.trim()) {
    issues.push({
      severity: "error",
      code: "MISSING_PRODUCT_NAME",
      rowNumber: row.rowNumber,
      field: "productName",
      message: "Product name is missing.",
      recommendation: "Add a product name so the row can be scored.",
    })
  }

  if (!row.supplierName.trim()) {
    issues.push({
      severity: "error",
      code: "MISSING_SUPPLIER",
      rowNumber: row.rowNumber,
      field: "supplierName",
      message: "Supplier is missing.",
      recommendation: "Map a supplier/vendor column or fill supplier names.",
    })
  }

  if (row.unitCost === null) {
    issues.push({
      severity: "error",
      code: "MISSING_UNIT_COST",
      rowNumber: row.rowNumber,
      field: "unitCost",
      message: "Unit cost is missing.",
      recommendation: "Add unit cost to calculate margin and profitability.",
    })
  }

  if (row.sellingPrice === null) {
    issues.push({
      severity: "error",
      code: "MISSING_SELLING_PRICE",
      rowNumber: row.rowNumber,
      field: "sellingPrice",
      message: "Selling price is missing.",
      recommendation: "Add selling price so revenue can be measured.",
    })
  }

  if (row.sellingPrice !== null && row.unitCost !== null && row.sellingPrice <= row.unitCost) {
    issues.push({
      severity: "warning",
      code: "LOW_OR_NEGATIVE_MARGIN",
      rowNumber: row.rowNumber,
      field: "sellingPrice",
      message: "Selling price is lower than or equal to unit cost.",
      recommendation: "Increase price or reduce cost to avoid loss-making sales.",
    })
  }

  if (row.stockUnits !== null && row.unitsSold !== null && row.unitsSold > 0 && row.stockUnits > row.unitsSold * 3) {
    issues.push({
      severity: "warning",
      code: "OVERSTOCK_RISK",
      rowNumber: row.rowNumber,
      field: "stockUnits",
      message: "Stock level is high compared to units sold.",
      recommendation: "Reduce purchase volume or run a bundle/clearance promotion.",
    })
  }

  return issues
}

function duplicateNameIssues(rows: UploadedProductRow[]): ValidationIssue[] {
  const countByName = rows.reduce<Record<string, number>>((acc, row) => {
    const key = row.productName.trim().toLowerCase()
    if (!key) return acc
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return rows
    .filter((row) => {
      const key = row.productName.trim().toLowerCase()
      return key && countByName[key] > 1
    })
    .map((row) => ({
      severity: "warning" as const,
      code: "DUPLICATE_PRODUCT_NAME",
      rowNumber: row.rowNumber,
      field: "productName" as const,
      message: `Product name "${row.productName}" appears multiple times.`,
      recommendation: "Merge duplicates or keep only one active version per SKU.",
    }))
}

export function validateUploadData(parsed: ParsedUploadData): ValidationResult {
  const rowIssues = parsed.rows.flatMap((row) => rowValidation(row))
  const duplicateIssues = duplicateNameIssues(parsed.rows)
  const allIssues = [...rowIssues, ...duplicateIssues]

  const errors = allIssues.filter((issue) => issue.severity === "error")
  const warnings = allIssues.filter((issue) => issue.severity === "warning")

  const completion = completionRate(parsed.rows)
  const penalty = errors.length * 8 + warnings.length * 3
  const dataQualityScore = Math.max(0, Math.min(100, completion - penalty + 25))

  return {
    errors,
    warnings,
    dataQualityScore,
    completionRate: completion,
  }
}
