// src/app/api/crunchbase/route.ts
import { NextResponse } from "next/server";

// GET /api/crunchbase?sector=B2B%20SaaS&limit=20
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sector = searchParams.get("sector") || "B2B SaaS";
    const limit = Number(searchParams.get("limit") || 20);

    const apiKey = process.env.CRUNCHBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing CRUNCHBASE_API_KEY" }, { status: 500 });
    }

    // Very simple example query (adjust to the endpoint/filters you have access to)
    const url =
      `https://api.crunchbase.com/api/v4/data/entities/organizations?` +
      `query=${encodeURIComponent(sector)}&limit=${limit}&user_key=${apiKey}`;

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Crunchbase request failed (${res.status})`, details: text.slice(0, 400) },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Map → your app's Company shape (keep fields you use in the UI)
    const companies = (data.entities ?? []).map((e: any) => ({
      id: e.uuid,
      name: e.properties?.name ?? "Unknown",
      sector,
      employees: e.properties?.num_employees_min ?? null,
      growth_rate: null,          // TODO: derive when you have a signal
      recent_funding: !!e.properties?.funding_total_usd,
      stale_design: false,        // TODO
      clarity_score: null,        // TODO
      churn_indicators: null,     // TODO
      created_at: new Date().toISOString(),
    }));

    return NextResponse.json({ companies });
  } catch (err: any) {
    console.error("Crunchbase route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
