import { NextResponse } from "next/server"
import {
  getLatestStoredReport,
  isSupabaseConfigured,
  saveUploadAnalysis,
} from "@/lib/persistence"
import { buildBusinessReportFromParsed } from "@/lib/scoring"
import { UploadSource, ParsedUploadData, UploadedProductRow } from "@/lib/schema"
import { validateUploadData } from "@/lib/validation"
import Papa from "papaparse"
import * as xlsx from "xlsx"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const sheetUrl = formData.get("sheetUrl") as string | null
    const source = (formData.get("source") as UploadSource) || "excel"

    let fileBuffer: ArrayBuffer
    let fileName = ""

    if (source === "google-sheets") {
      if (!sheetUrl) {
        return NextResponse.json({ ok: false, error: "No Google Sheet URL provided" }, { status: 400 })
      }
      
      const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
      if (!sheetIdMatch) {
        return NextResponse.json({ ok: false, error: "Invalid Google Sheet URL" }, { status: 400 })
      }
      
      const sheetId = sheetIdMatch[1]
      const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
      const res = await fetch(fetchUrl)
      
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: "Failed to fetch Google Sheet. Is it published to the web?" }, { status: 400 })
      }
      
      fileBuffer = await res.arrayBuffer()
      fileName = `Google Sheet (${sheetId}).csv`
    } else {
      if (!file) {
        return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 })
      }
      fileBuffer = await file.arrayBuffer()
      fileName = file.name
    }

    let rows: any[] = []

    if (source === "csv" || source === "google-sheets" || fileName.endsWith(".csv")) {
      const text = new TextDecoder().decode(fileBuffer)
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
      rows = parsed.data
    } else {
      const workbook = xlsx.read(fileBuffer, { type: "buffer" })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      rows = xlsx.utils.sheet_to_json(worksheet)
    }

    // Default mapping logic (assuming standard column names for MVP)
    const mapRow = (row: any, index: number): UploadedProductRow => {
      const getVal = (key: string) => {
        const found = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === key.toLowerCase().replace(/[^a-z0-9]/g, ''))
        return found ? row[found] : undefined
      }

      return {
        rowNumber: index + 2, // +1 for 0-index, +1 for header
        productName: getVal("productName") || getVal("product") || getVal("name"),
        category: getVal("category"),
        supplierName: getVal("supplierName") || getVal("supplier"),
        sellingLocation: getVal("sellingLocation") || getVal("location"),
        unitCost: parseFloat(getVal("unitCost") || getVal("cost")) || null,
        sellingPrice: parseFloat(getVal("sellingPrice") || getVal("price")) || null,
        unitsSold: parseInt(getVal("unitsSold") || getVal("sold")) || null,
        stockUnits: parseInt(getVal("stockUnits") || getVal("stock")) || null,
      }
    }

    const mappedRows = rows.map(mapRow)

    const parsedData: ParsedUploadData = {
      source,
      detectedColumns: Object.keys(rows[0] || {}),
      rows: mappedRows,
      mappedFields: [
        { key: "productName", label: "Product Name", required: true, status: "mapped", matchedColumn: "Product Name" },
        { key: "category", label: "Category", required: true, status: "mapped", matchedColumn: "Category" },
        { key: "supplierName", label: "Supplier", required: true, status: "mapped", matchedColumn: "Supplier" },
        { key: "sellingLocation", label: "Location", required: true, status: "mapped", matchedColumn: "Location" },
        { key: "unitCost", label: "Unit Cost", required: true, status: "mapped", matchedColumn: "Unit Cost" },
        { key: "sellingPrice", label: "Selling Price", required: true, status: "mapped", matchedColumn: "Selling Price" },
        { key: "unitsSold", label: "Units Sold", required: true, status: "mapped", matchedColumn: "Units Sold" },
        { key: "stockUnits", label: "Stock Units", required: true, status: "mapped", matchedColumn: "Stock Units" },
      ]
    }

    const validation = validateUploadData(parsedData)
    const latestReport = await getLatestStoredReport()

    const report = buildBusinessReportFromParsed(
      parsedData,
      validation,
      latestReport?.healthScore ?? 0
    )

    const saveResult = await saveUploadAnalysis({
      source,
      fileName: fileName,
      parsedData,
      validation,
      report,
    })

    if (!saveResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: saveResult.error,
          hint: isSupabaseConfigured()
            ? "Supabase responded with an error. Check table schema and RLS/service role settings."
            : "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to persist data.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      uploadId: saveResult.uploadId,
      totalRows: rows.length,
      summary: {
        healthScore: report.healthScore,
        dataQualityScore: report.dataQualityScore,
        errors: validation.errors.length,
        warnings: validation.warnings.length,
      },
    })
  } catch (error: any) {
    console.error("Ingest error:", error)
    return NextResponse.json({ ok: false, error: "Failed to process file" }, { status: 500 })
  }
}
