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

  const prompt = `Search the web for current information about "${competitor}" and return a structured competitive analysis. Use specific names, numbers, and dates in every section. If data is unavailable, say so explicitly.

## Summary
2-paragraph overview: what they do, strategic focus, competitive positioning, founding year, HQ, employee count.

## News & Recent Highlights
5+ recent news items. Format: **[Month Year]** — description. Cover launches, exec changes, partnerships, acquisitions, legal/regulatory events.

## Products & Solutions
Each named product/service: name, function, launch/update date, pricing model. Note anything discontinued or in beta.

## Financial Signals
Revenue (with period), YoY growth %, total funding + latest round (amount, type, date, lead investor), valuation, headcount, layoffs/hiring surges, profitability status.

## Markets (Growth & Challenges)
Growing regions/verticals (with share % if available), markets they're retreating from and why, new expansions in past 12 months, regulatory/competitive barriers.

## Hiring & Recruitment Signals
Specific open job titles, volume by department, strategic hiring patterns, notable exec hires/departures (name, title, prior company), top hiring locations.

## Strengths
4–5 bullets. Cite specific metrics, partnerships, or market positions — no generic claims.

## Weaknesses
4–5 bullets. Specific product gaps, customer complaints (G2/Gartner if findable), operational problems, strategic vulnerabilities.

## Opportunities
4–5 bullets. Specific untapped markets, trends, M&A/partnership targets, regulatory tailwinds — explain why the opportunity is real now.

## Threats
4–5 bullets. Named competitors encroaching on their market, regulatory risks by jurisdiction, technology disruption, churn vectors.

## Threat Score
Single number 1–99 (e.g. "Threat Score: 72") followed by 2–3 sentences on momentum, differentiation, and resource strength.`;

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
        max_tokens: 8192,
        system: "Du er en AI-baseret Competitor Intelligence Engine. Dit formål er ikke at beskrive, hvad konkurrenter gør – men at analysere, hvordan deres handlinger flytter økonomisk værdi, og hvad det betyder for vores næste beslutninger. Du arbejder ud fra 4 værdidrivere: Traffic, Conversion, ARPU, Retention. For hver konkurrent skal du returnere disse sektioner med markdown headers: ## Summary, ## News & Recent Highlights, ## Financial Signals, ## Markets, ## Hiring, ## Products, ## Strengths, ## Weaknesses, ## Opportunities, ## Threats, ## Threat Score (et tal 1-99). Under hver sektion: kobl observationer til Traffic/Conversion/ARPU/Retention, vurder impact på CAC/LTV/pricing power/win rate, giv konkrete handlingsanbefalinger. Vær specifik med tal og estimater. Undgå fluffy sprog.",
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
