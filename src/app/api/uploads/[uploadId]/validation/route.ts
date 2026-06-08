import { NextResponse } from "next/server"
import { getValidationForUpload } from "@/lib/persistence"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  const { uploadId } = await params
  const result = await getValidationForUpload(uploadId)

  if (!result) {
    return NextResponse.json({ ok: false, error: "Validation result not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true, validation: result })
}
