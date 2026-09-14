import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, parseAuthSession } from "@/lib/auth-session";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdminClient();

    const cookieHeader = req.headers.get("cookie") || "";
    const cookieValue = cookieHeader
      .split(";")
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith(`${AUTH_COOKIE_NAME}=`))
      ?.split("=")
      .slice(1)
      .join("=");

    const session = parseAuthSession(cookieValue ?? null);
    if (!session || !session.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("plan_status")
      .eq("email", session.email)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ plan_status: profile.plan_status });
  } catch (error: any) {
    const message =
      error?.message === "Database not configured"
        ? "Database not configured"
        : error?.message || "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}