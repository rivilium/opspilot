"use client";
import { useState } from "react";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬛" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "operations", label: "Operations", icon: "⚙️" },
  { id: "people", label: "People", icon: "👥" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "ai", label: "AI Tools", icon: "✦" },
];

const COLORS = {
  bg: "#0A0B0F",
  surface: "#111318",
  border: "#1E2028",
  accent: "#6366F1",
  accentSoft: "#6366F115",
  accentMid: "#6366F140",
  text: "#F1F2F5",
  muted: "#6B7280",
  green: "#10B981",
  red: "#EF4444",
  yellow: "#F59E0B",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'Inter', sans-serif; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }
  textarea { resize: vertical; }
`;

// ─── Shared Components ────────────────────────────────────────────────
function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 12, padding: "20px 24px",
      cursor: onClick ? "pointer" : "default",
      transition: "border-color 0.15s",
      ...style,
    }}
    onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = COLORS.accentMid)}
    onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = COLORS.border)}
    >{children}</div>
  );
}

function Badge({ label, color = COLORS.accent }) {
  return <span style={{ background: color + "20", color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.04em" }}>{label}</span>;
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled }) {
  const base = {
    padding: "9px 18px", borderRadius: 8, fontWeight: 600, fontSize: 13,
    border: "none", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", ...style
  };
  const variants = {
    primary: { background: COLORS.accent, color: "#fff" },
    ghost: { background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}` },
    danger: { background: COLORS.red + "20", color: COLORS.red, border: `1px solid ${COLORS.red}30` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], opacity: disabled ? 0.5 : 1 }}>{children}</button>;
}

function Label({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{children}</div>;
}

function Input({ value, onChange, placeholder, type = "text", style = {} }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "9px 14px", color: COLORS.text, fontSize: 13, width: "100%", outline: "none", ...style }} />;
}

function Textarea({ value, onChange, placeholder, rows = 5 }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 13, width: "100%", outline: "none", fontFamily: "Inter, sans-serif" }} />;
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }}>{title}</h2>
      {sub && <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

// ─── AI Generator Modal ───────────────────────────────────────────────
function AIModal({ title, systemPrompt, userPrefix, fields, onClose }) {
  const [values, setValues] = useState({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true); setResult("");
    const userMsg = userPrefix + "\n" + fields.map(f => `${f.label}: ${values[f.key] || ""}`).join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      setResult(data.content?.[0]?.text || "Error generating content.");
    } catch { setResult("Network error. Please try again."); }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000AA", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {fields.map(f => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              {f.type === "textarea"
                ? <Textarea value={values[f.key] || ""} onChange={v => setValues(p => ({ ...p, [f.key]: v }))} placeholder={f.placeholder} rows={3} />
                : <Input value={values[f.key] || ""} onChange={v => setValues(p => ({ ...p, [f.key]: v }))} placeholder={f.placeholder} />}
            </div>
          ))}
          <Btn onClick={generate} disabled={loading}>{loading ? "Generating…" : "✦ Generate"}</Btn>
          {result && (
            <div style={{ marginTop: 8 }}>
              <Label>Result</Label>
              <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "14px 16px", fontSize: 13, lineHeight: 1.7, color: COLORS.text, whiteSpace: "pre-wrap" }}>
                {result}
              </div>
              <Btn variant="ghost" style={{ marginTop: 10 }} onClick={() => navigator.clipboard.writeText(result)}>Copy to clipboard</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────
function Dashboard({ setPage }) {
  const kpis = [
    { label: "Monthly Revenue", value: "$48,200", delta: "+6%", up: true },
    { label: "Labour %", value: "31%", delta: "+2%", up: false },
    { label: "Open Tasks", value: "12", delta: "3 overdue", up: false },
    { label: "Productivity Score", value: "74/100", delta: "+4pts", up: true },
    { label: "Cost Savings ID'd", value: "$3,100", delta: "this month", up: true },
    { label: "Active Staff", value: "18", delta: "2 on leave", up: true },
  ];
  const insights = [
    { text: "Labour costs increased 12% this month vs last month.", severity: "red" },
    { text: "Revenue up 6% but expenses up 15% — review supplier costs.", severity: "yellow" },
    { text: "Team productivity dropped 8% in week 3. Consider schedule review.", severity: "yellow" },
    { text: "3 SOPs have not been reviewed in 90+ days.", severity: "red" },
    { text: "Onboarding checklist completion rate is 91% — above benchmark.", severity: "green" },
  ];
  const actions = [
    { label: "Generate SOP", page: "operations" },
    { label: "Create Job Description", page: "people" },
    { label: "Review Expenses", page: "finance" },
    { label: "Run SWOT Analysis", page: "ai" },
    { label: "Build KPI Plan", page: "ai" },
    { label: "Improve a Process", page: "ai" },
  ];
  const sevColor = { red: COLORS.red, yellow: COLORS.yellow, green: COLORS.green };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700 }}>Good morning ✦</h1>
        <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 4 }}>Here's what's happening in your business today.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {kpis.map(k => (
          <Card key={k.label}>
            <Label>{k.label}</Label>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: "6px 0" }}>{k.value}</div>
            <span style={{ fontSize: 12, color: k.up ? COLORS.green : COLORS.red }}>{k.delta}</span>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* AI Insights */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ color: COLORS.accent, fontSize: 16 }}>✦</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>AI Insights</span>
            <Badge label="Live" color={COLORS.green} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: sevColor[ins.severity], marginTop: 5, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>{ins.text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {actions.map(a => (
              <button key={a.label} onClick={() => setPage(a.page)}
                style={{ background: COLORS.accentSoft, border: `1px solid ${COLORS.accentMid}`, color: COLORS.text, borderRadius: 8, padding: "10px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "left" }}>
                {a.label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────
function Analytics() {
  const [data, setData] = useState({ revenue: "", expenses: "", labour: "", staff: "", customers: "", transactions: "" });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true); setReport(null);
    const prompt = `You are a business analytics AI. Given these metrics, produce a structured analysis with: 1) Key observations (bullet points), 2) Profitability analysis, 3) Operational health score out of 100 with explanation, 4) Three specific AI recommendations. Be direct and actionable. Use numbers from the data.

Revenue: $${data.revenue} | Expenses: $${data.expenses} | Labour costs: $${data.labour} | Staff count: ${data.staff} | Customer count: ${data.customers} | Transactions: ${data.transactions}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const d = await res.json();
      setReport(d.content?.[0]?.text || "Error.");
    } catch { setReport("Network error."); }
    setLoading(false);
  }

  const fields = [
    { key: "revenue", label: "Monthly Revenue ($)" },
    { key: "expenses", label: "Total Expenses ($)" },
    { key: "labour", label: "Labour Costs ($)" },
    { key: "staff", label: "Staff Count" },
    { key: "customers", label: "Customer Count" },
    { key: "transactions", label: "Transactions" },
  ];

  return (
    <div>
      <SectionHeader title="Analytics" sub="Enter your numbers and get AI-powered recommendations." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {fields.map(f => (
          <Card key={f.key}>
            <Label>{f.label}</Label>
            <Input value={data[f.key]} onChange={v => setData(p => ({ ...p, [f.key]: v }))} placeholder="0" type="number" />
          </Card>
        ))}
      </div>
      <Btn onClick={analyze} disabled={loading}>{loading ? "Analyzing…" : "✦ Analyze My Business"}</Btn>
      {report && (
        <Card style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ color: COLORS.accent }}>✦</span>
            <span style={{ fontWeight: 600 }}>AI Business Report</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", color: COLORS.text }}>{report}</div>
        </Card>
      )}
    </div>
  );
}

// ─── Operations ───────────────────────────────────────────────────────
function Operations() {
  const [modal, setModal] = useState(null);
  const tools = [
    {
      id: "sop", label: "SOP Generator", desc: "Create step-by-step standard operating procedures for any process.",
      system: "You are an operations expert. Generate a detailed, professional Standard Operating Procedure (SOP) document with numbered steps, responsible parties, and key checkpoints. Format clearly with sections.",
      userPrefix: "Generate an SOP for the following:",
      fields: [
        { key: "process", label: "Process Name", placeholder: "e.g. Opening Procedure, Customer Complaint Handling" },
        { key: "industry", label: "Industry", placeholder: "e.g. Retail, Hospitality, Healthcare" },
        { key: "details", label: "Key Details", placeholder: "Any specific steps, tools, or requirements…", type: "textarea" },
      ]
    },
    {
      id: "checklist", label: "Process Checklist", desc: "Build actionable checklists for recurring tasks.",
      system: "You are an operations expert. Create a practical, numbered checklist for the given process. Group items into logical phases. Be specific and actionable.",
      userPrefix: "Create a process checklist for:",
      fields: [
        { key: "process", label: "Process", placeholder: "e.g. New client onboarding, Weekly stock take" },
        { key: "team", label: "Who completes it", placeholder: "e.g. Store manager, Front desk staff" },
        { key: "frequency", label: "Frequency", placeholder: "e.g. Daily, Weekly, Per new hire" },
      ]
    },
    {
      id: "risk", label: "Risk Register", desc: "Identify operational risks and corrective actions.",
      system: "You are a risk management expert. Create a structured risk register with: Risk ID, Description, Likelihood (H/M/L), Impact (H/M/L), Risk Rating, and Mitigation Action. Format as a clear table.",
      userPrefix: "Create a risk register for:",
      fields: [
        { key: "business", label: "Business Type", placeholder: "e.g. Café, Construction company, Law firm" },
        { key: "area", label: "Area of Focus", placeholder: "e.g. Operations, Finance, HR, Safety" },
      ]
    },
    {
      id: "incident", label: "Incident Report", desc: "Document and manage workplace incidents formally.",
      system: "You are an operations manager. Create a formal incident report template and a completed draft based on the details provided. Include: incident summary, root cause analysis, immediate actions, and corrective measures.",
      userPrefix: "Create an incident report for:",
      fields: [
        { key: "incident", label: "What happened", placeholder: "Describe the incident…", type: "textarea" },
        { key: "date", label: "Date & Location", placeholder: "e.g. 12 June 2026, Warehouse B" },
        { key: "people", label: "People involved", placeholder: "Roles only, not names" },
      ]
    },
  ];

  return (
    <div>
      <SectionHeader title="Operations" sub="Build SOPs, checklists, and risk management tools instantly." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {tools.map(t => (
          <Card key={t.id} onClick={() => setModal(t)} style={{ cursor: "pointer" }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{t.label}</div>
            <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5 }}>{t.desc}</p>
            <div style={{ marginTop: 14, color: COLORS.accent, fontSize: 12, fontWeight: 600 }}>Open →</div>
          </Card>
        ))}
      </div>
      {modal && <AIModal {...modal} title={modal.label} onClose={() => setModal(null)} />}
    </div>
  );
}

// ─── People ───────────────────────────────────────────────────────────
function People() {
  const [modal, setModal] = useState(null);
  const tools = [
    {
      id: "jd", label: "Job Description Generator", desc: "Write compelling, complete job descriptions.",
      system: "You are an HR expert. Write a professional, engaging job description that attracts quality candidates. Include: Overview, Key Responsibilities (bullet points), Requirements, and What We Offer.",
      userPrefix: "Generate a job description for:",
      fields: [
        { key: "role", label: "Job Title", placeholder: "e.g. Operations Manager, Barista, Sales Rep" },
        { key: "industry", label: "Industry & Company Type", placeholder: "e.g. Fast casual restaurant, SaaS startup" },
        { key: "key", label: "Key Requirements", placeholder: "Experience, skills, qualifications…", type: "textarea" },
      ]
    },
    {
      id: "interview", label: "Interview Questions", desc: "Generate role-specific interview question sets.",
      system: "You are an HR specialist. Create a structured interview question set with: 5 behavioural questions, 5 technical/role-specific questions, 3 culture-fit questions, and 2 scenario-based questions. Include what to listen for in each answer.",
      userPrefix: "Create interview questions for:",
      fields: [
        { key: "role", label: "Role", placeholder: "e.g. Customer service manager" },
        { key: "values", label: "Company Values / Culture", placeholder: "e.g. Fast-paced, customer-first, collaborative" },
      ]
    },
    {
      id: "onboard", label: "Onboarding Plan", desc: "Build a 30/60/90 day plan for new starters.",
      system: "You are an HR and operations expert. Create a structured 30/60/90-day onboarding plan with clear milestones, tasks, and success criteria for each phase. Include who is responsible for each step.",
      userPrefix: "Create an onboarding plan for:",
      fields: [
        { key: "role", label: "Role", placeholder: "e.g. Retail team leader" },
        { key: "team", label: "Team Size & Structure", placeholder: "e.g. 8-person team, reports to Store Manager" },
        { key: "priorities", label: "Key Priorities in First 90 Days", placeholder: "What must they achieve?", type: "textarea" },
      ]
    },
    {
      id: "review", label: "Performance Review", desc: "Structure fair, productive performance conversations.",
      system: "You are an HR expert. Create a structured performance review template with: self-assessment section, manager assessment, achievement highlights, areas for development, SMART goals for next period, and overall rating criteria.",
      userPrefix: "Create a performance review template for:",
      fields: [
        { key: "role", label: "Role Being Reviewed", placeholder: "e.g. Sales Associate" },
        { key: "period", label: "Review Period", placeholder: "e.g. Annual, 6-month probation" },
        { key: "focus", label: "Key Focus Areas", placeholder: "e.g. Customer service, targets, attendance" },
      ]
    },
  ];

  return (
    <div>
      <SectionHeader title="People" sub="Hire better, onboard faster, and develop your team." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {tools.map(t => (
          <Card key={t.id} onClick={() => setModal(t)} style={{ cursor: "pointer" }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{t.label}</div>
            <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5 }}>{t.desc}</p>
            <div style={{ marginTop: 14, color: COLORS.accent, fontSize: 12, fontWeight: 600 }}>Open →</div>
          </Card>
        ))}
      </div>
      {modal && <AIModal {...modal} title={modal.label} onClose={() => setModal(null)} />}
    </div>
  );
}

// ─── Finance ─────────────────────────────────────────────────────────
function Finance() {
  const [modal, setModal] = useState(null);
  const tools = [
    {
      id: "cost", label: "Cost Reduction Advisor", desc: "Identify where your business is leaking money.",
      system: "You are a financial advisor for SMBs. Analyze the expenses provided and identify: top 3 areas of potential cost reduction, specific actionable steps for each, estimated savings potential, and quick wins vs longer-term changes. Be specific and direct.",
      userPrefix: "Analyze these business expenses and identify cost reduction opportunities:",
      fields: [
        { key: "expenses", label: "Current Expenses Breakdown", placeholder: "e.g. Rent $4,000, Staff $12,000, Inventory $6,000, Software $800…", type: "textarea" },
        { key: "revenue", label: "Monthly Revenue", placeholder: "e.g. $35,000" },
        { key: "challenge", label: "Biggest Cost Challenge", placeholder: "What's hurting your margins most?" },
      ]
    },
    {
      id: "budget", label: "Budget Template Builder", desc: "Create a custom monthly budget framework.",
      system: "You are a business finance expert. Create a detailed monthly budget template for the business described. Include all relevant cost categories, suggested allocation percentages, and guidance notes for each line item.",
      userPrefix: "Build a monthly budget template for:",
      fields: [
        { key: "type", label: "Business Type", placeholder: "e.g. Café with 6 staff, Online retail store" },
        { key: "revenue", label: "Expected Monthly Revenue", placeholder: "e.g. $25,000" },
        { key: "goals", label: "Financial Goals", placeholder: "e.g. Reduce labour to 28%, increase profit margin to 15%" },
      ]
    },
    {
      id: "forecast", label: "Revenue Forecast", desc: "Project revenue and identify growth levers.",
      system: "You are a business growth strategist. Based on current performance, create a 6-month revenue forecast with: conservative, realistic, and optimistic scenarios. Identify the key assumptions and growth levers for each scenario.",
      userPrefix: "Create a 6-month revenue forecast:",
      fields: [
        { key: "current", label: "Current Monthly Revenue", placeholder: "e.g. $42,000" },
        { key: "growth", label: "Recent Growth Trend", placeholder: "e.g. +5% per month for past 3 months" },
        { key: "plans", label: "Planned Changes", placeholder: "New product, extra staff, marketing spend…", type: "textarea" },
      ]
    },
  ];

  return (
    <div>
      <SectionHeader title="Finance" sub="Control costs, build budgets, and grow profitably." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {tools.map(t => (
          <Card key={t.id} onClick={() => setModal(t)} style={{ cursor: "pointer" }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{t.label}</div>
            <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5 }}>{t.desc}</p>
            <div style={{ marginTop: 14, color: COLORS.accent, fontSize: 12, fontWeight: 600 }}>Open →</div>
          </Card>
        ))}
      </div>
      {modal && <AIModal {...modal} title={modal.label} onClose={() => setModal(null)} />}
    </div>
  );
}

// ─── AI Tools ─────────────────────────────────────────────────────────
function AITools() {
  const [modal, setModal] = useState(null);
  const tools = [
    {
      id: "swot", label: "SWOT Analysis", desc: "Get a structured strengths, weaknesses, opportunities, and threats breakdown.",
      system: "You are a business strategist. Produce a thorough SWOT analysis with 4-5 points per quadrant. For each point, include a brief explanation and one strategic implication. End with a 3-point strategic priority list.",
      userPrefix: "Conduct a SWOT analysis for:",
      fields: [
        { key: "business", label: "Business Description", placeholder: "What do you do, who for, and where?", type: "textarea" },
        { key: "challenge", label: "Current Challenge or Goal", placeholder: "e.g. Trying to scale, losing to competitors, launching new product" },
      ]
    },
    {
      id: "kpi", label: "KPI Recommendation Engine", desc: "Get the right KPIs for your business type and goals.",
      system: "You are a business performance expert. Recommend 10-15 specific, measurable KPIs for the business. For each KPI: provide the name, formula/how to measure it, target benchmark, and why it matters. Group by category: Financial, Operational, People, Customer.",
      userPrefix: "Recommend KPIs for this business:",
      fields: [
        { key: "type", label: "Business Type", placeholder: "e.g. Retail store, Digital agency, Trade business" },
        { key: "stage", label: "Business Stage & Goals", placeholder: "e.g. 3 years old, trying to improve margins and reduce churn" },
        { key: "staff", label: "Staff Count", placeholder: "e.g. 12 full-time, 4 casual" },
      ]
    },
    {
      id: "process", label: "Process Improvement Analyzer", desc: "Find inefficiencies and get a redesign plan.",
      system: "You are an operations improvement consultant. Analyze the process described and identify: the top 3 bottlenecks, root causes, redesign recommendations with steps, technology or tools that could help, and expected improvement outcomes.",
      userPrefix: "Analyze and improve this process:",
      fields: [
        { key: "process", label: "Current Process Description", placeholder: "Walk me through the process step by step…", type: "textarea" },
        { key: "problem", label: "Main Problem", placeholder: "e.g. Too slow, too many errors, staff find it confusing" },
      ]
    },
    {
      id: "bizplan", label: "Business Plan Generator", desc: "Build a structured business plan section by section.",
      system: "You are a business plan expert. Write a concise, investor-ready business plan section including: Executive Summary, Problem & Solution, Target Market, Value Proposition, Revenue Model, Key Milestones, and a brief Competitive Landscape. Be specific and credible.",
      userPrefix: "Generate a business plan for:",
      fields: [
        { key: "idea", label: "Business Idea", placeholder: "Describe your product or service", type: "textarea" },
        { key: "market", label: "Target Market", placeholder: "Who are your customers?" },
        { key: "revenue", label: "Revenue Model", placeholder: "How do you make money?" },
      ]
    },
    {
      id: "meeting", label: "Meeting Summary Generator", desc: "Turn rough meeting notes into structured summaries.",
      system: "You are an executive assistant. Convert the meeting notes into a professional summary with: Meeting Overview, Key Decisions Made, Action Items (with owner and deadline), Discussion Points, and Next Steps. Format cleanly.",
      userPrefix: "Summarize these meeting notes:",
      fields: [
        { key: "notes", label: "Raw Meeting Notes", placeholder: "Paste your notes here — even messy ones work…", type: "textarea" },
        { key: "attendees", label: "Attendees / Roles", placeholder: "e.g. CEO, Operations Manager, 2x Team Leads" },
      ]
    },
    {
      id: "policy", label: "Policy Generator", desc: "Create professional workplace policies instantly.",
      system: "You are an HR and compliance expert. Write a clear, professional workplace policy document with: Policy Title, Purpose, Scope, Policy Statement, Procedures/Guidelines (numbered), Responsibilities, and Review Date. Use plain language.",
      userPrefix: "Create a workplace policy for:",
      fields: [
        { key: "policy", label: "Policy Topic", placeholder: "e.g. Social media use, Remote work, Leave management, Code of conduct" },
        { key: "industry", label: "Industry", placeholder: "e.g. Healthcare, Hospitality, Construction" },
        { key: "size", label: "Team Size", placeholder: "e.g. 15 employees" },
      ]
    },
  ];

  return (
    <div>
      <SectionHeader title="AI Tools" sub="Instant value. Pick a tool and get results in seconds." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {tools.map(t => (
          <Card key={t.id} onClick={() => setModal(t)} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t.label}</div>
              <span style={{ color: COLORS.accent, fontSize: 14 }}>✦</span>
            </div>
            <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5 }}>{t.desc}</p>
            <div style={{ marginTop: 14, color: COLORS.accent, fontSize: 12, fontWeight: 600 }}>Launch →</div>
          </Card>
        ))}
      </div>
      {modal && <AIModal {...modal} title={modal.label} onClose={() => setModal(null)} />}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────
export default function OpsPilot() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pages = { dashboard: <Dashboard setPage={setPage} />, analytics: <Analytics />, operations: <Operations />, people: <People />, finance: <Finance />, ai: <AITools /> };

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg }}>

        {/* Sidebar */}
        <div style={{ width: sidebarOpen ? 220 : 60, flexShrink: 0, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", transition: "width 0.2s", overflow: "hidden" }}>
          {/* Logo */}
          <div style={{ padding: sidebarOpen ? "24px 20px 20px" : "24px 14px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, background: COLORS.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>✦</div>
              {sidebarOpen && <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15 }}>OpsPilot AI</span>}
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 10px" }}>
            {NAV.map(n => {
              const active = page === n.id;
              return (
                <button key={n.id} onClick={() => setPage(n.id)} style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: active ? COLORS.accentSoft : "transparent",
                  color: active ? COLORS.accent : COLORS.muted,
                  fontWeight: active ? 600 : 400, fontSize: 13, marginBottom: 2,
                  transition: "all 0.15s", textAlign: "left",
                }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{n.icon}</span>
                  {sidebarOpen && <span>{n.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Collapse toggle */}
          <button onClick={() => setSidebarOpen(o => !o)} style={{ margin: "12px 10px", padding: "8px 10px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.muted, cursor: "pointer", fontSize: 12 }}>
            {sidebarOpen ? "← Collapse" : "→"}
          </button>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto", maxWidth: 960 }}>
          {pages[page]}
        </div>
      </div>
    </>
  );
}
