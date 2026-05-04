import { useState, useEffect } from "react";

// ── Palette & typography ──────────────────────────────────────────────────────
const COLORS = {
  bg: "#0a0a0f",
  surface: "#12121a",
  card: "#1a1a26",
  border: "#252535",
  accent: "#6c63ff",
  accentGlow: "rgba(108,99,255,0.18)",
  accentLight: "#a89bff",
  gold: "#f0c040",
  red: "#ff4f6a",
  green: "#3dffa0",
  text: "#e8e6f0",
  muted: "#7070a0",
};

const FONT_DISPLAY = "'DM Serif Display', Georgia, serif";
const FONT_BODY = "'IBM Plex Sans', 'Helvetica Neue', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";

// ── Inject Google Fonts ───────────────────────────────────────────────────────
const injectFonts = () => {
  if (document.getElementById("ci-fonts")) return;
  const l = document.createElement("link");
  l.id = "ci-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";
  document.head.appendChild(l);
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const G = {
  page: {
    minHeight: "100vh",
    background: COLORS.bg,
    color: COLORS.text,
    fontFamily: FONT_BODY,
    overflowX: "hidden",
  },
  card: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 28,
  },
  badge: (color = COLORS.accent) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.5,
    background: color + "22",
    color: color,
    border: `1px solid ${color}44`,
    fontFamily: FONT_MONO,
  }),
  btn: (variant = "primary") => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 24px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontFamily: FONT_BODY,
    fontWeight: 600,
    fontSize: 14,
    transition: "all 0.2s",
    ...(variant === "primary"
      ? {
          background: `linear-gradient(135deg, ${COLORS.accent}, #8b5cf6)`,
          color: "#fff",
          boxShadow: `0 4px 20px ${COLORS.accentGlow}`,
        }
      : variant === "ghost"
      ? {
          background: "transparent",
          color: COLORS.muted,
          border: `1px solid ${COLORS.border}`,
        }
      : {
          background: COLORS.surface,
          color: COLORS.text,
          border: `1px solid ${COLORS.border}`,
        }),
  }),
  input: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: "12px 16px",
    color: COLORS.text,
    fontFamily: FONT_BODY,
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
};

// ── Pulse dot ─────────────────────────────────────────────────────────────────
function PulseDot({ color = COLORS.green }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animation: "pulse 2s infinite",
      }}
    />
  );
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 64 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? COLORS.green : score >= 40 ? COLORS.gold : COLORS.red;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.border} strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill={color}
        fontSize={size * 0.22}
        fontWeight={700}
        fontFamily={FONT_MONO}
        style={{ transform: "rotate(90deg)", transformOrigin: "50% 50%" }}
      >
        {score}
      </text>
    </svg>
  );
}

// ── Mini spark bar ────────────────────────────────────────────────────────────
function SparkBar({ values = [], color = COLORS.accent }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            background: i === values.length - 1 ? color : color + "55",
            borderRadius: 2,
            minHeight: 2,
          }}
        />
      ))}
    </div>
  );
}

// ── SWOT block ────────────────────────────────────────────────────────────────
function SwotBlock({ label, items = [], color }) {
  return (
    <div
      style={{
        background: color + "0d",
        border: `1px solid ${color}33`,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          color,
          fontFamily: FONT_MONO,
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
        {items.map((it, i) => (
          <li key={i} style={{ fontSize: 12, color: COLORS.text, marginBottom: 4, lineHeight: 1.5 }}>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Parse AI text → sections ──────────────────────────────────────────────────
function parseAnalysis(raw) {
  const section = (key) => {
    const re = new RegExp(`##?\\s*${key}[\\s\\S]*?(?=##|$)`, "i");
    const m = raw.match(re);
    if (!m) return [];
    return m[0]
      .replace(/##?\s*\w+[^\n]*/i, "")
      .split("\n")
      .map((l) => l.replace(/^[-*•]\s*/, "").trim())
      .filter((l) => l.length > 12);
  };
  const num = (key, fallback) => {
    const re = new RegExp(`${key}[^0-9]*(\\d+)`, "i");
    const m = raw.match(re);
    return m ? parseInt(m[1]) : fallback;
  };
  return {
    strengths: section("strength"),
    weaknesses: section("weakness"),
    opportunities: section("opportunit"),
    threats: section("threat"),
    news: section("news|recent|highlight"),
    hiring: section("hiring|recruitment|talent"),
    products: section("product|solution|offer"),
    markets: section("market|growth|expand"),
    score: Math.min(99, Math.max(10, num("threat score|competitive score|score", 55))),
    summary: raw.split("\n").find((l) => l.length > 40 && !l.startsWith("#")) || "",
    revenue: section("revenue|financial|regnskab"),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════════
function LandingPage({ onSignup, onLogin }) {
  const features = [
    { icon: "🔍", title: "Live Intelligence", desc: "Real-time news, filings, product launches scanned continuously" },
    { icon: "📊", title: "Financial Signals", desc: "Revenue trends, headcount shifts, market expansion markers" },
    { icon: "🧠", title: "AI SWOT Engine", desc: "Automated strengths, weaknesses, opportunities, threats per competitor" },
    { icon: "👥", title: "Hiring Radar", desc: "Track job postings to detect strategic pivots before they're public" },
    { icon: "🏆", title: "Win/Loss Intel", desc: "Pattern-match tender language and procurement signals" },
    { icon: "📱", title: "Mobile-first", desc: "Full insight access on any device, anywhere" },
  ];

  const plans = [
    { name: "Starter", price: "€49", mo: "/mo", desc: "3 competitors, weekly scans", cta: "Start free trial", highlight: false },
    { name: "Pro", price: "€149", mo: "/mo", desc: "15 competitors, daily scans + alerts", cta: "Start free trial", highlight: true },
    { name: "Enterprise", price: "Custom", mo: "", desc: "Unlimited, API access, SSO", cta: "Contact sales", highlight: false },
  ];

  return (
    <div style={G.page}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(108,99,255,0.4) !important; }
        .feat-card:hover { border-color: ${COLORS.accent}55 !important; transform: translateY(-3px); }
        .plan-card:hover { transform: translateY(-4px); }
        * { box-sizing: border-box; }
      `}</style>

      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: `1px solid ${COLORS.border}`,
          position: "sticky",
          top: 0,
          background: COLORS.bg + "ee",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: COLORS.text }}>
          <span style={{ color: COLORS.accent }}>rival</span>scope
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={G.btn("ghost")} onClick={onLogin}>Log in</button>
          <button style={G.btn("primary")} className="hero-cta" onClick={onSignup}>
            Start free trial →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div
        style={{
          textAlign: "center",
          padding: "100px 24px 80px",
          animation: "fadeUp 0.8s ease both",
        }}
      >
        <div style={{ ...G.badge(COLORS.accentLight), marginBottom: 24 }}>
          <PulseDot color={COLORS.accentLight} /> &nbsp; AI-powered · Live data · 6 months free
        </div>
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(38px, 7vw, 72px)",
            lineHeight: 1.1,
            margin: "0 0 24px",
            background: `linear-gradient(135deg, ${COLORS.text} 40%, ${COLORS.accentLight})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Know your rivals<br />before they move.
        </h1>
        <p
          style={{
            fontSize: 18,
            color: COLORS.muted,
            maxWidth: 520,
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          Enter any competitor name. Get instant AI analysis — news, financials, hiring signals, product moves, and a full SWOT. Updated continuously.
        </p>
        <button
          style={{ ...G.btn("primary"), fontSize: 16, padding: "16px 36px" }}
          className="hero-cta"
          onClick={onSignup}
        >
          Start 6-month free trial →
        </button>
        <div style={{ marginTop: 16, fontSize: 13, color: COLORS.muted }}>
          No credit card required · Cancel anytime
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="feat-card"
              style={{
                ...G.card,
                transition: "all 0.25s",
                cursor: "default",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 100px", textAlign: "center" }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 36, marginBottom: 8 }}>Simple pricing</h2>
        <p style={{ color: COLORS.muted, marginBottom: 48 }}>All plans include 6 months free. No lock-in.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {plans.map((p, i) => (
            <div
              key={i}
              className="plan-card"
              style={{
                ...G.card,
                transition: "all 0.25s",
                border: p.highlight ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {p.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    ...G.badge(COLORS.gold),
                  }}
                >
                  POPULAR
                </div>
              )}
              <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>
                {p.name.toUpperCase()}
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, color: COLORS.text }}>
                {p.price}
                <span style={{ fontSize: 16, color: COLORS.muted }}>{p.mo}</span>
              </div>
              <div style={{ fontSize: 13, color: COLORS.muted, margin: "12px 0 24px" }}>{p.desc}</div>
              <button
                style={{ ...G.btn(p.highlight ? "primary" : "secondary"), width: "100%", justifyContent: "center" }}
                onClick={onSignup}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "24px",
          borderTop: `1px solid ${COLORS.border}`,
          fontSize: 12,
          color: COLORS.muted,
        }}
      >
        © 2026 RivalScope · Built with Claude AI
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SIGN UP
// ══════════════════════════════════════════════════════════════════════════════
function SignupPage({ onBack, onSuccess }) {
  const [step, setStep] = useState(1); // 1=account, 2=plan, 3=done
  const [form, setForm] = useState({ name: "", email: "", company: "", password: "", plan: "pro" });
  const [loading, setLoading] = useState(false);

  const plans = [
    { id: "starter", label: "Starter", price: "€49/mo", note: "3 competitors" },
    { id: "pro", label: "Pro", price: "€149/mo", note: "15 competitors" },
    { id: "enterprise", label: "Enterprise", price: "Custom", note: "Unlimited" },
  ];

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1200);
  };

  return (
    <div style={{ ...G.page, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box}`}</style>
      <div style={{ width: "100%", maxWidth: 480, animation: "fadeUp 0.5s ease both" }}>
        <button style={{ ...G.btn("ghost"), marginBottom: 32, fontSize: 13 }} onClick={onBack}>
          ← Back
        </button>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, marginBottom: 8 }}>
          {step === 3 ? "You're in. 🎉" : "Create your account"}
        </div>
        <div style={{ color: COLORS.muted, fontSize: 14, marginBottom: 32 }}>
          {step === 3
            ? "Your 6-month free trial starts now. No charge until month 7."
            : "6 months free · No credit card needed"}
        </div>

        {/* Progress */}
        {step < 3 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            {[1, 2].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: s <= step ? COLORS.accent : COLORS.border,
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { key: "name", label: "Full name", type: "text", ph: "Lars Glade" },
              { key: "company", label: "Company", type: "text", ph: "Acme Corp" },
              { key: "email", label: "Work email", type: "email", ph: "you@company.com" },
              { key: "password", label: "Password", type: "password", ph: "min. 8 characters" },
            ].map((f) => (
              <div key={f.key}>
                <label style={{ fontSize: 12, color: COLORS.muted, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>
                  {f.label.toUpperCase()}
                </label>
                <input
                  type={f.type}
                  placeholder={f.ph}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ ...G.input, marginTop: 6 }}
                />
              </div>
            ))}
            <button
              style={{ ...G.btn("primary"), justifyContent: "center", marginTop: 8 }}
              onClick={() => setStep(2)}
              disabled={!form.email || !form.name}
            >
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20 }}>
              Choose a plan — all free for 6 months
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setForm({ ...form, plan: p.id })}
                  style={{
                    ...G.card,
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    border: form.plan === p.id ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                    transition: "all 0.2s",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>{p.note}</div>
                  </div>
                  <div style={{ fontFamily: FONT_MONO, color: COLORS.accentLight }}>{p.price}</div>
                </div>
              ))}
            </div>
            <button
              style={{ ...G.btn("primary"), justifyContent: "center", width: "100%" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating account…" : "Start free trial →"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🚀</div>
            <div style={{ color: COLORS.muted, fontSize: 14, marginBottom: 32, lineHeight: 1.8 }}>
              Welcome, {form.name || "there"}!<br />
              Your {form.plan} plan is active. Start adding competitors below.
            </div>
            <button style={{ ...G.btn("primary"), justifyContent: "center" }} onClick={onSuccess}>
              Open dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ onLogout }) {
  const [competitors, setCompetitors] = useState([]);
  const [inputName, setInputName] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState({});
  const [error, setError] = useState("");
  const [tab, setTab] = useState("swot");

  const runAnalysis = async (name) => {
    if (analysis[name]) return; // cached
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitor: name }),
      });

      const data = await res.json();
      const fullText = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");

      setAnalysis((prev) => ({ ...prev, [name]: parseAnalysis(fullText) }));
    } catch (e) {
      setError("Analysis failed. Check your connection and try again.");
    }
    setLoading(false);
  };

  const addCompetitor = () => {
    const name = inputName.trim();
    if (!name || competitors.includes(name)) return;
    setCompetitors((c) => [...c, name]);
    setInputName("");
    setSelected(name);
    runAnalysis(name);
  };

  const selectCompetitor = (name) => {
    setSelected(name);
    setTab("swot");
    runAnalysis(name);
  };

  const removeCompetitor = (name) => {
    setCompetitors((c) => c.filter((x) => x !== name));
    if (selected === name) setSelected(competitors.find((x) => x !== name) || null);
  };

  const a = selected ? analysis[selected] : null;
  const tabs = ["swot", "news", "financials", "hiring", "markets", "products"];

  return (
    <div style={{ ...G.page, display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .tab-btn:hover{color:${COLORS.text} !important}
        .comp-item:hover{background:${COLORS.card} !important}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:${COLORS.border};border-radius:2px}
      `}</style>

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: `1px solid ${COLORS.border}`,
          background: COLORS.surface,
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20 }}>
          <span style={{ color: COLORS.accent }}>rival</span>scope
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={G.badge(COLORS.green)}>
            <PulseDot /> &nbsp;Live
          </div>
          <button style={G.btn("ghost")} onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Sidebar */}
        <div
          style={{
            width: 240,
            minWidth: 240,
            borderRight: `1px solid ${COLORS.border}`,
            background: COLORS.surface,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: COLORS.muted, letterSpacing: 1, marginBottom: 10 }}>
              COMPETITORS
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
                placeholder="Add company…"
                style={{ ...G.input, fontSize: 13, padding: "10px 12px" }}
              />
              <button
                style={{
                  ...G.btn("primary"),
                  padding: "10px 14px",
                  flexShrink: 0,
                  fontSize: 18,
                  lineHeight: 1,
                }}
                onClick={addCompetitor}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
            {competitors.length === 0 && (
              <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: COLORS.muted }}>
                Add a competitor to begin
              </div>
            )}
            {competitors.map((name) => {
              const a = analysis[name];
              return (
                <div
                  key={name}
                  className="comp-item"
                  onClick={() => selectCompetitor(name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: selected === name ? COLORS.card : "transparent",
                    border: selected === name ? `1px solid ${COLORS.border}` : "1px solid transparent",
                    marginBottom: 4,
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${COLORS.accent}44, #8b5cf644)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: COLORS.accentLight,
                      flexShrink: 0,
                    }}
                  >
                    {name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {name}
                    </div>
                    {a && (
                      <div style={{ fontSize: 10, color: COLORS.muted, fontFamily: FONT_MONO }}>
                        Score: {a.score}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCompetitor(name); }}
                    style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {!selected && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 48 }}>🔭</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24 }}>Add your first competitor</div>
              <div style={{ color: COLORS.muted, fontSize: 14 }}>Type a company name in the sidebar and press Enter</div>
            </div>
          )}

          {selected && loading && !a && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, flexDirection: "column", gap: 20 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `3px solid ${COLORS.border}`,
                  borderTopColor: COLORS.accent,
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <div style={{ color: COLORS.muted, fontSize: 14 }}>Scanning {selected}…</div>
            </div>
          )}

          {error && (
            <div style={{ ...G.card, border: `1px solid ${COLORS.red}44`, background: COLORS.red + "0d", marginBottom: 20, color: COLORS.red, fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {selected && a && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${COLORS.accent}55, #8b5cf655)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 700,
                    color: COLORS.accentLight,
                    flexShrink: 0,
                  }}
                >
                  {selected[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ margin: "0 0 6px", fontFamily: FONT_DISPLAY, fontSize: 28 }}>{selected}</h2>
                  {a.summary && (
                    <p style={{ margin: 0, fontSize: 14, color: COLORS.muted, lineHeight: 1.7, maxWidth: 600 }}>
                      {a.summary}
                    </p>
                  )}
                </div>
                <ScoreRing score={a.score} size={72} />
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 0 }}>
                {tabs.map((t) => (
                  <button
                    key={t}
                    className="tab-btn"
                    onClick={() => setTab(t)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "10px 16px",
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: FONT_BODY,
                      fontWeight: 500,
                      color: tab === t ? COLORS.accentLight : COLORS.muted,
                      borderBottom: tab === t ? `2px solid ${COLORS.accent}` : "2px solid transparent",
                      transition: "all 0.15s",
                      textTransform: "capitalize",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* SWOT */}
              {tab === "swot" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <SwotBlock label="STRENGTHS" items={a.strengths} color={COLORS.green} />
                  <SwotBlock label="WEAKNESSES" items={a.weaknesses} color={COLORS.red} />
                  <SwotBlock label="OPPORTUNITIES" items={a.opportunities} color={COLORS.accent} />
                  <SwotBlock label="THREATS" items={a.threats} color={COLORS.gold} />
                </div>
              )}

              {/* News */}
              {tab === "news" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(a.news.length ? a.news : ["No recent news found."]).map((item, i) => (
                    <div key={i} style={{ ...G.card, display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ ...G.badge(COLORS.accentLight), flexShrink: 0 }}>#{i + 1}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.7 }}>{item}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Financials */}
              {tab === "financials" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ ...G.card, display: "flex", alignItems: "center", gap: 24 }}>
                    <div>
                      <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: COLORS.muted, letterSpacing: 1 }}>THREAT SCORE</div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, color: a.score >= 70 ? COLORS.green : a.score >= 40 ? COLORS.gold : COLORS.red }}>
                        {a.score}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <SparkBar values={[42, 55, 61, 58, 70, a.score]} color={COLORS.accent} />
                      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, fontFamily: FONT_MONO }}>estimated trend</div>
                    </div>
                  </div>
                  {(a.revenue.length ? a.revenue : a.news.slice(0, 3)).map((item, i) => (
                    <div key={i} style={{ ...G.card, fontSize: 14, lineHeight: 1.7 }}>
                      💰 {item}
                    </div>
                  ))}
                </div>
              )}

              {/* Hiring */}
              {tab === "hiring" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(a.hiring.length ? a.hiring : ["No significant hiring signals detected."]).map((item, i) => (
                    <div key={i} style={{ ...G.card, display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 18 }}>👤</span>
                      <div style={{ fontSize: 14, lineHeight: 1.7 }}>{item}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Markets */}
              {tab === "markets" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(a.markets.length ? a.markets : ["No market data found."]).map((item, i) => (
                    <div key={i} style={{ ...G.card, display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 18 }}>{i % 2 === 0 ? "📈" : "📉"}</span>
                      <div style={{ fontSize: 14, lineHeight: 1.7 }}>{item}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Products */}
              {tab === "products" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(a.products.length ? a.products : ["No product data found."]).map((item, i) => (
                    <div key={i} style={{ ...G.card, display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 18 }}>🛠</span>
                      <div style={{ fontSize: 14, lineHeight: 1.7 }}>{item}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("landing"); // landing | signup | dashboard

  useEffect(() => { injectFonts(); }, []);

  if (page === "landing") return <LandingPage onSignup={() => setPage("signup")} onLogin={() => setPage("dashboard")} />;
  if (page === "signup") return <SignupPage onBack={() => setPage("landing")} onSuccess={() => setPage("dashboard")} />;
  return <Dashboard onLogout={() => setPage("landing")} />;
}
