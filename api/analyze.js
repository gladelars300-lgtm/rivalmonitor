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

  const prompt = `You are a senior competitive intelligence analyst. Produce a structured analysis of the company: "${competitor}".

Use these exact section headers (markdown ##):
## Summary
One paragraph overview of the company.

## News & Recent Highlights
- 3-5 bullet points of recent news, announcements, or events

## Products & Solutions
- Key products or services they offer

## Financial Signals
- Revenue indicators, growth signals, funding, or financial news

## Markets (Growth & Challenges)
- Markets they are growing in
- Markets where they face challenges

## Hiring & Recruitment Signals
- Current hiring trends, job profile changes, key roles posted

## Strengths
- 3-4 key competitive strengths

## Weaknesses
- 3-4 areas of weakness or vulnerability

## Opportunities
- 3-4 market opportunities they could exploit

## Threats
- 3-4 external threats they face

## Threat Score
Rate their competitive threat level as a number 1-99 (e.g. "Threat Score: 72").

Keep each bullet to 1-2 sentences. Be analytical and specific.`;

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
