import { NextResponse } from "next/server"
import { getLatestStoredReport } from "@/lib/persistence"

export async function GET() {
  const report = await getLatestStoredReport()

  if (!report) {
    return NextResponse.json({ ok: false, error: "No persisted report found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true, report })
}
