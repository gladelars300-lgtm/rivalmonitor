module.exports = async function handler(req, res) {
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

  const prompt = `You are a senior competitive intelligence analyst with access to web search. Search for the most recent, specific, and detailed information available about the company: "${competitor}". Use web search extensively to find current data — prioritize sources from the last 6-12 months. Do not generalize; cite specific numbers, dates, product names, and facts wherever possible.

Produce a structured analysis using these exact section headers (markdown ##):

## Summary
Two-paragraph overview: what the company does, their current strategic focus, and their primary competitive positioning. Include founding year, HQ location, and employee count if known.

## News & Recent Highlights
Search for the latest news about this company. List AT LEAST 5 recent news items, each with a specific date (month and year minimum). Cover product launches, executive changes, partnerships, acquisitions, legal/regulatory events, and strategic shifts. Format each bullet as: **[Month Year]** — description.

## Products & Solutions
List each named product or service individually. For each, include: the product name, what it does, when it launched or was last updated, and pricing tier or model if publicly available. Flag any products recently discontinued or in beta.

## Financial Signals
Be as specific as possible with numbers. Include:
- Annual or quarterly revenue figures with the time period (e.g., "$2.1B ARR as of Q3 2025")
- YoY or QoQ growth rate as a percentage
- Total funding raised and most recent funding round (amount, round type, date, lead investor)
- Valuation if known (public market cap or last private valuation)
- Headcount / employee count and any recent layoffs or hiring surges with numbers
- Burn rate, profitability status, or margin commentary if available

## Markets (Growth & Challenges)
Identify specific geographies and verticals. For each, note:
- Which regions or industries are growing for them (with any market share % or penetration data)
- Which markets they are struggling or retreating from, and why
- Any new market entries or announced expansions in the past 12 months
- Regulatory or competitive barriers in specific markets

## Hiring & Recruitment Signals
Search recent job postings and hiring news. Include:
- Specific job titles currently being recruited (e.g., "Senior ML Engineer — Inference", "VP of Enterprise Sales — EMEA")
- Approximate volume of open roles by department or function
- Strategic patterns in hiring (e.g., doubling down on AI, building out federal/gov sales, expanding support in APAC)
- Any notable recent executive hires or departures (name, title, previous company)
- Locations where they are hiring most aggressively

## Strengths
4-5 detailed bullet points. Each should reference a specific capability, metric, partnership, or market position — not generic statements. Example: not "strong brand" but "brand recognition in Fortune 500 security teams, evidenced by 60%+ enterprise renewal rates per their 2024 annual report."

## Weaknesses
4-5 detailed bullet points. Identify specific product gaps, customer complaints (cite review platforms like G2/Gartner if findable), operational problems, or strategic vulnerabilities with supporting evidence.

## Opportunities
4-5 detailed bullet points. Identify specific untapped markets, emerging trends they are positioned to capture, M&A targets or partnership opportunities, and regulatory tailwinds. Be concrete about why the opportunity is real now.

## Threats
4-5 detailed bullet points. Name specific competitors encroaching on their market, regulatory risks by jurisdiction, technology disruption risks, and customer churn vectors. Include any recent competitive losses or win/loss data if available.

## Threat Score
Rate their competitive threat level as a number 1-99 (e.g. "Threat Score: 72"). Follow with 2-3 sentences explaining the score based on the evidence above — momentum, differentiation, and resource strength.

Critical instructions:
- Use web search before answering to retrieve the most current data available.
- Every section must contain specific names, numbers, and dates — avoid vague language like "recently" or "significant growth."
- If a data point is unavailable after searching, say so explicitly rather than fabricating or generalizing.
- Flag any information that may be outdated with "(unconfirmed / as of [date])".`;

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
        tools: [{ type: "web_search_20260209", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (e) {
    return res.status(502).json({ error: "Failed to reach Anthropic API" });
  }

  const data = await anthropicRes.json();
  return res.status(anthropicRes.status).json(data);
};
