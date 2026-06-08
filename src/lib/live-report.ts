import { parseMockUploadData } from "@/lib/mock-data"
import {
  getLatestStoredReport,
  getLatestUploadId,
  getValidationForUpload,
  isSupabaseConfigured,
} from "@/lib/persistence"
import { buildBusinessReport, buildBusinessReportFromParsed } from "@/lib/scoring"
import { ValidationResult } from "@/lib/schema"
import { validateUploadData } from "@/lib/validation"

export async function getReportForUI() {
  if (isSupabaseConfigured()) {
    const stored = await getLatestStoredReport()
    if (stored) {
      return { report: stored, source: "supabase" as const }
    }
  }

  return { report: buildBusinessReport(), source: "mock" as const }
}

export async function getValidationForUI(uploadId?: string | null): Promise<{
  validation: ValidationResult
  source: "supabase" | "mock"
  resolvedUploadId: string | null
}> {
  if (isSupabaseConfigured()) {
    const chosenUploadId = uploadId ?? (await getLatestUploadId())

    if (chosenUploadId) {
      const fromDb = await getValidationForUpload(chosenUploadId)
      if (fromDb) {
        return {
          validation: fromDb,
          source: "supabase",
          resolvedUploadId: chosenUploadId,
        }
      }
    }
  }

  const parsed = parseMockUploadData("excel")
  const validation = validateUploadData(parsed)
  const report = buildBusinessReportFromParsed(parsed, validation)

  return {
    validation: {
      ...validation,
      dataQualityScore: report.dataQualityScore,
    },
    source: "mock",
    resolvedUploadId: null,
  }
}
