import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase"
import type { BusinessReport } from "@/lib/scoring"
import type { ParsedUploadData, ValidationIssue, ValidationResult } from "@/lib/schema"

type SaveResult =
  | { ok: true; uploadId: string }
  | { ok: false; error: string }

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item))
}

export async function saveUploadAnalysis(params: {
  source: string
  fileName?: string | null
  parsedData: ParsedUploadData
  validation: ValidationResult
  report: BusinessReport
}): Promise<SaveResult> {
  const supabase = getSupabaseServerClient()

  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    }
  }

  const client: any = supabase

  const requiredFieldCount = params.parsedData.mappedFields.filter((field) => field.required).length
  const mappedRequiredCount = params.parsedData.mappedFields.filter(
    (field) => field.required && field.status === "mapped"
  ).length

  const { data: upload, error: uploadError } = await client
    .from("uploads")
    .insert({
      source: params.source,
      file_name: params.fileName ?? null,
      status: params.validation.errors.length > 0 ? "validated-with-errors" : "validated",
      row_count: params.parsedData.rows.length,
      mapped_required_fields: Math.min(mappedRequiredCount, requiredFieldCount),
      completion_rate: params.validation.completionRate,
    })
    .select("id")
    .single()

  if (uploadError || !upload) {
    return {
      ok: false,
      error: uploadError?.message ?? "Unable to create upload record.",
    }
  }

  const uploadId = upload.id as string

  const rowPayload = params.parsedData.rows.map((row) => ({
    upload_id: uploadId,
    row_number: row.rowNumber,
    product_name: row.productName,
    category: row.category,
    supplier_name: row.supplierName,
    selling_location: row.sellingLocation,
    unit_cost: row.unitCost,
    selling_price: row.sellingPrice,
    units_sold: row.unitsSold,
    stock_units: row.stockUnits,
  }))

  if (rowPayload.length > 0) {
    const { error } = await client.from("upload_rows").insert(rowPayload)
    if (error) {
      return { ok: false, error: error.message }
    }
  }

  const allIssues: ValidationIssue[] = [...params.validation.errors, ...params.validation.warnings]

  if (allIssues.length > 0) {
    const issuePayload = allIssues.map((issue) => ({
      upload_id: uploadId,
      row_number: issue.rowNumber ?? null,
      field_key: issue.field ?? null,
      severity: issue.severity,
      code: issue.code,
      message: issue.message,
      recommendation: issue.recommendation,
    }))

    const { error } = await client.from("validation_issues").insert(issuePayload)
    if (error) {
      return { ok: false, error: error.message }
    }
  }

  if (params.report.productRows.length > 0) {
    const { error } = await client.from("product_scores").insert(
      params.report.productRows.map((row) => ({
        upload_id: uploadId,
        product_name: row.productName,
        category: row.category,
        supplier_name: row.supplierName,
        location: row.location,
        unit_cost: row.unitCost,
        selling_price: row.sellingPrice,
        units_sold: row.unitsSold,
        stock_units: row.stockUnits,
        margin_percent: row.marginPercent,
        revenue: row.revenue,
        profit: row.profit,
        score: row.score,
        status: row.status,
      }))
    )

    if (error) {
      return { ok: false, error: error.message }
    }
  }

  if (params.report.supplierRows.length > 0) {
    const { error } = await client.from("supplier_scores").insert(
      params.report.supplierRows.map((row) => ({
        upload_id: uploadId,
        supplier_name: row.supplierName,
        products_supplied: row.productsSupplied,
        average_unit_cost: row.averageUnitCost,
        average_margin_percent: row.averageMarginPercent,
        lead_time_days: row.leadTimeDays,
        reliability_rate: row.reliabilityRate,
        score: row.score,
        impact: row.impact,
      }))
    )

    if (error) {
      return { ok: false, error: error.message }
    }
  }

  if (params.report.categoryRows.length > 0) {
    const { error } = await client.from("category_scores").insert(
      params.report.categoryRows.map((row) => ({
        upload_id: uploadId,
        category: row.category,
        revenue: row.revenue,
        margin_percent: row.marginPercent,
        health_score: row.healthScore,
      }))
    )

    if (error) {
      return { ok: false, error: error.message }
    }
  }

  const { error: reportError } = await client.from("business_reports").insert({
    upload_id: uploadId,
    health_score: params.report.healthScore,
    previous_health_score: params.report.previousHealthScore,
    delta: params.report.delta,
    average_margin_percent: params.report.averageMarginPercent,
    data_quality_score: params.report.dataQualityScore,
    improving_factors: params.report.improvingFactors,
    harming_factors: params.report.harmingFactors,
    increase_actions: params.report.increaseActions,
    avoid_actions: params.report.avoidActions,
  })

  if (reportError) {
    return { ok: false, error: reportError.message }
  }

  return { ok: true, uploadId }
}

export async function getLatestStoredReport(): Promise<BusinessReport | null> {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return null
  }

  const client: any = supabase

  const { data: reportRow, error } = await client
    .from("business_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !reportRow) {
    return null
  }

  const uploadId = reportRow.upload_id

  const [{ data: products }, { data: suppliers }, { data: categories }] = await Promise.all([
    client.from("product_scores").select("*").eq("upload_id", uploadId).order("score", { ascending: false }),
    client.from("supplier_scores").select("*").eq("upload_id", uploadId).order("score", { ascending: false }),
    client
      .from("category_scores")
      .select("*")
      .eq("upload_id", uploadId)
      .order("health_score", { ascending: false }),
  ])

  return {
    healthScore: reportRow.health_score,
    previousHealthScore: reportRow.previous_health_score,
    delta: reportRow.delta,
    averageMarginPercent: reportRow.average_margin_percent,
    dataQualityScore: reportRow.data_quality_score,
    productRows:
      products?.map((row: any) => ({
        productName: row.product_name,
        category: row.category,
        supplierName: row.supplier_name,
        location: row.location,
        unitCost: row.unit_cost,
        sellingPrice: row.selling_price,
        unitsSold: row.units_sold,
        stockUnits: row.stock_units,
        marginPercent: row.margin_percent,
        revenue: row.revenue,
        profit: row.profit,
        score: row.score,
        status: row.status as "Strong" | "Stable" | "Needs Attention",
      })) ?? [],
    supplierRows:
      suppliers?.map((row: any) => ({
        supplierName: row.supplier_name,
        productsSupplied: row.products_supplied,
        averageUnitCost: row.average_unit_cost,
        averageMarginPercent: row.average_margin_percent,
        leadTimeDays: row.lead_time_days,
        reliabilityRate: row.reliability_rate,
        score: row.score,
        impact: row.impact as "Positive" | "Neutral" | "Negative",
      })) ?? [],
    categoryRows:
      categories?.map((row: any) => ({
        category: row.category,
        revenue: row.revenue,
        marginPercent: row.margin_percent,
        healthScore: row.health_score,
      })) ?? [],
    improvingFactors: asStringArray(reportRow.improving_factors),
    harmingFactors: asStringArray(reportRow.harming_factors),
    increaseActions: asStringArray(reportRow.increase_actions),
    avoidActions: asStringArray(reportRow.avoid_actions),
  }
}

export async function getValidationForUpload(uploadId: string): Promise<ValidationResult | null> {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return null
  }

  const client: any = supabase

  const [{ data: issues, error: issuesError }, { data: reportRow }, { data: uploadRow }] = await Promise.all([
    client
      .from("validation_issues")
      .select("*")
      .eq("upload_id", uploadId)
      .order("severity", { ascending: true })
      .order("row_number", { ascending: true }),
    client
      .from("business_reports")
      .select("data_quality_score")
      .eq("upload_id", uploadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client.from("uploads").select("completion_rate").eq("id", uploadId).maybeSingle(),
  ])

  if (issuesError || !issues) {
    return null
  }

  const mappedIssues: ValidationIssue[] = issues.map((issue: any) => ({
    severity: issue.severity,
    code: issue.code,
    rowNumber: issue.row_number ?? undefined,
    field: issue.field_key ?? undefined,
    message: issue.message,
    recommendation: issue.recommendation,
  }))

  return {
    errors: mappedIssues.filter((issue) => issue.severity === "error"),
    warnings: mappedIssues.filter((issue) => issue.severity === "warning"),
    dataQualityScore: reportRow?.data_quality_score ?? 0,
    completionRate: uploadRow?.completion_rate ?? 0,
  }
}

export async function getLatestUploadId(): Promise<string | null> {
  const supabase = getSupabaseServerClient()
  if (!supabase) return null

  const client: any = supabase

  const { data, error } = await client
    .from("uploads")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data.id as string
}

export { isSupabaseConfigured }
