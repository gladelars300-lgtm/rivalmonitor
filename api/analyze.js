export const maxDuration = 60;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { competitor } = req.body || {};
  if (!competitor || typeof competitor !== "string") {
    return res.status(400).json({ error: "competitor name required" });
  }

  const prompt = `Search the web for current information about "${competitor}" and return a competitive analysis with these exact sections. Use specific numbers, names, and dates — no generic claims.

## Summary
What they do, founding year, HQ, headcount, strategic focus.

## News & Recent Highlights
3–5 recent items with dates: launches, exec changes, partnerships, acquisitions.

## Products & Solutions
Named products/services with pricing model and recent updates.

## Financial Signals
Revenue, YoY growth %, funding (amount, date, lead investor), valuation, profitability.

## Markets
Growing regions/verticals with share %, new expansions, competitive barriers.

## Hiring & Recruitment Signals
Key open roles by department, notable exec hires/departures, hiring locations.

## Strengths
3–4 bullets with specific metrics or market positions.

## Weaknesses
3–4 bullets citing product gaps, complaints, or operational problems.

## Opportunities
3–4 bullets: untapped markets, trends, regulatory tailwinds.

## Threats
3–4 bullets: named competitors, regulatory risks, technology disruption.

## Threat Score
"Threat Score: [1–99]" — then 2 sentences on momentum and resource strength.`;

  let anthropicRes;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: "Du er en Competitor Intelligence Engine. Analysér hvordan konkurrentens handlinger påvirker Traffic, Conversion, ARPU og Retention — og hvad det betyder for næste beslutning. Regler: brug specifikke tal, datoer og navne i alle sektioner; kobl observationer til Traffic/Conversion/ARPU/Retention; vurder impact på CAC, LTV, pricing power og win rate; undgå generiske påstande. Returner altid disse sektioner med præcise markdown headers: ## Summary, ## News & Recent Highlights, ## Products & Solutions, ## Financial Signals, ## Markets, ## Hiring & Recruitment Signals, ## Strengths, ## Weaknesses, ## Opportunities, ## Threats, ## Threat Score (ét tal 1–99 plus 2 sætninger om momentum og ressourcer).",
        tools: [{ type: "web_search_20260209", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (e) {
    return res.status(502).json({ error: "Failed to reach Anthropic API" });
  }

  const data = await anthropicRes.json();
  return res.status(anthropicRes.status).json(data);
}
