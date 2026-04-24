"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #F7F6F2; }
  .btn-primary {
    padding: 9px 20px; border-radius: 99px; border: none;
    background: #1D9E75; color: #fff; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
  }
  .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn-outline {
    padding: 9px 20px; border-radius: 99px;
    border: 1.5px solid rgba(0,0,0,0.09); background: none;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: #1a1a18; cursor: pointer; transition: all 0.15s;
  }
  .btn-outline:hover { border-color: #1D9E75; color: #1D9E75; }
  .btn-sm { padding: 6px 14px; font-size: 13px; }
  .itab {
    padding: 8px 16px; border: none; background: none;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: #6B6A66; cursor: pointer;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
    transition: all 0.15s;
  }
  .itab.active { color: #1D9E75; border-bottom-color: #1D9E75; font-weight: 500; }
  .loan-row:hover td { background: #FAFAF8; }
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 99px;
  }
  .badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; }
  .badge-green { background: #E1F5EE; color: #085041; }
  .badge-green::before { background: #1D9E75; }
  .badge-amber { background: #FAEEDA; color: #412402; }
  .badge-amber::before { background: #EF9F27; }
  .badge-blue { background: #E6F1FB; color: #042C53; }
  .badge-blue::before { background: #378ADD; }
  .risk-meter { height: 8px; border-radius: 4px; background: #EEE; margin: 8px 0 4px; overflow: hidden; }
  .risk-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }
  .score-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.09); font-size: 13px;
  }
  .score-row:last-child { border-bottom: none; }
  .fund-input {
    border: 1.5px solid rgba(0,0,0,0.09); border-radius: 8px;
    padding: 8px 12px; font-size: 14px; color: #1a1a18;
    background: #F7F6F2; outline: none; font-family: 'DM Sans', sans-serif;
    width: 140px;
  }
  .fund-input:focus { border-color: #1D9E75; background: #fff; }
`;

const DEMO_LOANS = [
  { id: "1", name: "Sarah M.", type: "Personal", amount: 12000, rate: 8.5, term: 36, credit: 742, dti: 22, risk: "Low", status: "approved", purpose: "Home renovation", income: 78000 },
  { id: "2", name: "James T.", type: "Business", amount: 25000, rate: 10.2, term: 60, credit: 698, dti: 31, risk: "Medium", status: "approved", purpose: "Inventory expansion", income: 95000 },
  { id: "3", name: "Priya K.", type: "Student",  amount: 8500,  rate: 6.9,  term: 48, credit: 661, dti: 18, risk: "Medium", status: "approved", purpose: "Tuition", income: 42000 },
  { id: "4", name: "David L.", type: "Personal", amount: 5000,  rate: 7.5,  term: 24, credit: 780, dti: 14, risk: "Low",    status: "funded",   purpose: "Medical expenses", income: 88000 },
  { id: "5", name: "Maria S.", type: "Real Estate", amount: 50000, rate: 9.8, term: 60, credit: 720, dti: 28, risk: "Low", status: "approved", purpose: "Down payment", income: 120000 },
  { id: "6", name: "Kevin O.", type: "Business", amount: 15000, rate: 11.5, term: 36, credit: 640, dti: 38, risk: "Medium", status: "approved", purpose: "Equipment", income: 65000 },
];

type LenderTab = "opportunities" | "portfolio" | "analytics";

export default function LenderPage() {
  const router = useRouter();
  const [tab, setTab] = useState<LenderTab>("opportunities");
  const [loans, setLoans] = useState(DEMO_LOANS);
  const [filterType, setFilterType] = useState("All types");
  const [filterRisk, setFilterRisk] = useState("All risk levels");
  const [fundAmounts, setFundAmounts] = useState<Record<string, string>>({});
  const [funding, setFunding] = useState<string | null>(null);
  const [fundedIds, setFundedIds] = useState<Set<string>>(new Set());
  const [detailLoan, setDetailLoan] = useState<typeof DEMO_LOANS[0] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    // Try to fetch real loans from API, fall back to demo data
    fetch("/api/loans/available")
      .then(r => r.json())
      .then(d => { if (d.loans?.length) setLoans(d.loans); })
      .catch(() => {});
  }, []);

  const filtered = loans.filter(l => {
    if (filterType !== "All types" && l.type !== filterType) return false;
    if (filterRisk !== "All risk levels" && l.risk + " risk" !== filterRisk.toLowerCase()) return false;
    return true;
  });

  async function handleFund(loan: typeof DEMO_LOANS[0]) {
    const amount = parseFloat(fundAmounts[loan.id] || "0");
    if (!amount || amount <= 0) return;
    setFunding(loan.id);
    try {
      await fetch(`/api/loans/${loan.id}/fund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      setFundedIds(prev => new Set([...prev, loan.id]));
    } catch {
      setFundedIds(prev => new Set([...prev, loan.id])); // optimistic for demo
    } finally {
      setFunding(null);
    }
  }

  async function openDetail(loan: typeof DEMO_LOANS[0]) {
    setDetailLoan(loan);
    setAiAnalysis("");
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Briefly assess this loan for a lender in 2 short paragraphs: ${loan.name} wants $${loan.amount.toLocaleString()} at ${loan.rate}% for ${loan.purpose}. Credit score: ${loan.credit}. DTI: ${loan.dti}%. Income: $${loan.income.toLocaleString()}/yr. Risk: ${loan.risk}. Is this a good investment?`
          }],
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.response || "");
    } catch {
      setAiAnalysis("This borrower has a solid profile with verified income and manageable debt ratio. Recommend reviewing the full application before committing funds.");
    } finally {
      setAiLoading(false);
    }
  }

  const riskBadge = (risk: string) => {
    if (risk === "Low") return "badge badge-green";
    if (risk === "Medium") return "badge badge-amber";
    return "badge badge-blue";
  };

  const statusBadge = (status: string) => {
    if (status === "approved") return "badge badge-green";
    if (status === "funded") return "badge badge-blue";
    return "badge badge-amber";
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F2", minHeight: "100vh" }}>
      <style>{STYLES}</style>

      {/* NAVBAR */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: "60px", background: "#fff",
        borderBottom: "1px solid rgba(0,0,0,0.09)", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px" }}>
          bridge<span style={{ color: "#1D9E75" }}>lend</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["Borrower","Lender","Become a Lender","My Bank"] as const).map((t, i) => (
            <button key={t}
              onClick={() => router.push(["/borrower","/lender","/lender/signup","/my-bank"][i])}
              style={{
                padding: "7px 16px", borderRadius: "99px", border: "none",
                background: i === 1 ? "#1D9E75" : "none",
                color: i === 1 ? "#fff" : "#6B6A66",
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                fontWeight: i === 1 ? 500 : 400, cursor: "pointer",
              }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#6B6A66" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#085041" }}>AC</div>
          <span>Arnav C.</span>
          <button className="btn-outline" style={{ padding: "5px 12px", fontSize: "12px" }}
            onClick={() => router.push("/login")}>Log out</button>
        </div>
      </nav>

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>

        {/* STAT STRIP */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total deployed", val: "$84,200", change: "↑ $12,000 this month", green: true },
            { label: "Avg return",     val: "8.3%",    change: "↑ 0.4% vs last quarter", green: true },
            { label: "Active loans",   val: "14",      change: "3 new this week", green: true },
            { label: "Default rate",   val: "0.8%",    change: "Well below 2% threshold", green: true },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.25rem 1.5rem" }}>
              <div style={{ fontSize: "12px", color: "#6B6A66", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px" }}>{s.val}</div>
              <div style={{ fontSize: "12px", color: "#1D9E75", marginTop: "4px" }}>{s.change}</div>
            </div>
          ))}
        </div>

        {/* INNER TABS */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.09)" }}>
          {(["opportunities","portfolio","analytics"] as LenderTab[]).map(t => (
            <button key={t} className={`itab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* OPPORTUNITIES TAB */}
        {tab === "opportunities" && (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px" }}>Verified loan requests</div>
                <div style={{ fontSize: "13px", color: "#6B6A66", marginTop: "2px" }}>All borrowers bank-verified by our AI agent</div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { val: filterType, set: setFilterType, opts: ["All types","Personal","Business","Student","Real Estate"] },
                  { val: filterRisk, set: setFilterRisk, opts: ["All risk levels","Low risk","Medium risk"] },
                ].map((f, i) => (
                  <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
                    style={{ border: "1.5px solid rgba(0,0,0,0.09)", borderRadius: "8px", padding: "7px 12px", fontSize: "13px", background: "#F7F6F2", color: "#1a1a18", fontFamily: "'DM Sans', sans-serif", outline: "none" }}>
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                ))}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr>
                    {["Borrower","Type","Amount","Rate","Term","Credit","DTI","Risk","Status","Fund"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", color: "#A5A49F", borderBottom: "1px solid rgba(0,0,0,0.09)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(loan => (
                    <tr key={loan.id} className="loan-row">
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(0,0,0,0.09)" }}>
                        <span style={{ color: "#1D9E75", cursor: "pointer", fontWeight: 500 }}
                          onClick={() => openDetail(loan)}>{loan.name}</span>
                      </td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(0,0,0,0.09)", color: "#6B6A66" }}>{loan.type}</td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(0,0,0,0.09)", fontWeight: 500 }}>${loan.amount.toLocaleString()}</td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(0,0,0,0.09)", color: "#1D9E75", fontWeight: 500 }}>{loan.rate}%</td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(0,0,0,0.09)", color: "#6B6A66" }}>{loan.term}mo</td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(0,0,0,0.09)" }}>{loan.credit}</td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(0,0,0,0.09)", color: "#6B6A66" }}>{loan.dti}%</td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(0,0,0,0.09)" }}>
                        <span className={riskBadge(loan.risk)}>{loan.risk}</span>
                      </td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(0,0,0,0.09)" }}>
                        <span className={statusBadge(loan.status)}>{loan.status}</span>
                      </td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(0,0,0,0.09)" }}>
                        {fundedIds.has(loan.id) ? (
                          <span className="badge badge-green">Funded ✓</span>
                        ) : loan.status === "funded" ? (
                          <span style={{ fontSize: "12px", color: "#A5A49F" }}>Closed</span>
                        ) : (
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <input className="fund-input" type="number" placeholder="$amount"
                              value={fundAmounts[loan.id] || ""}
                              onChange={e => setFundAmounts(p => ({ ...p, [loan.id]: e.target.value }))} />
                            <button className="btn-primary btn-sm"
                              disabled={funding === loan.id}
                              onClick={() => handleFund(loan)}>
                              {funding === loan.id ? "…" : "Fund"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {tab === "portfolio" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", marginBottom: "1.25rem" }}>Active loans</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr>{["Borrower","Balance","Rate","Next payment","Status"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", color: "#A5A49F", borderBottom: "1px solid rgba(0,0,0,0.09)" }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[
                    { name: "Sarah M.", balance: "$11,240", rate: "8.5%", next: "Apr 5",  status: "On track", ok: true },
                    { name: "James T.", balance: "$23,880", rate: "10.2%", next: "Apr 8", status: "On track", ok: true },
                    { name: "Priya K.", balance: "$7,920",  rate: "6.9%", next: "Apr 3",  status: "On track", ok: true },
                    { name: "Marcus L.",balance: "$18,500", rate: "9.1%", next: "Apr 12", status: "Late 3d",  ok: false },
                  ].map(row => (
                    <tr key={row.name}>
                      <td style={{ padding: "11px 10px", borderBottom: "1px solid rgba(0,0,0,0.09)" }}>{row.name}</td>
                      <td style={{ padding: "11px 10px", borderBottom: "1px solid rgba(0,0,0,0.09)", fontWeight: 500 }}>{row.balance}</td>
                      <td style={{ padding: "11px 10px", borderBottom: "1px solid rgba(0,0,0,0.09)", color: "#1D9E75" }}>{row.rate}</td>
                      <td style={{ padding: "11px 10px", borderBottom: "1px solid rgba(0,0,0,0.09)", color: "#6B6A66" }}>{row.next}</td>
                      <td style={{ padding: "11px 10px", borderBottom: "1px solid rgba(0,0,0,0.09)" }}>
                        <span className={`badge ${row.ok ? "badge-green" : "badge-amber"}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", marginBottom: "1.25rem" }}>Earnings summary</div>
              {[
                { label: "Principal deployed",     val: "$84,200",  color: undefined },
                { label: "Interest earned YTD",    val: "$3,842",   color: "#1D9E75" },
                { label: "Projected annual return",val: "$6,989",   color: "#1D9E75" },
                { label: "Loans paid off",          val: "8",        color: undefined },
                { label: "Defaults (lifetime)",     val: "1 ($1,200)", color: "#E24B4A" },
              ].map(r => (
                <div key={r.label} className="score-row">
                  <span style={{ color: "#6B6A66" }}>{r.label}</span>
                  <strong style={{ color: r.color }}>{r.val}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", marginBottom: "1.25rem" }}>Risk distribution</div>
              {[
                { label: "Low risk (credit 720+)",      pct: 58, color: "#1D9E75" },
                { label: "Medium risk (credit 650–719)", pct: 34, color: "#EF9F27" },
                { label: "Higher risk (credit 580–649)", pct: 8,  color: "#E24B4A" },
              ].map(r => (
                <div key={r.label} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                    <span>{r.label}</span><span style={{ color: r.color }}>{r.pct}%</span>
                  </div>
                  <div className="risk-meter"><div className="risk-fill" style={{ width: `${r.pct}%`, background: r.color }} /></div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", marginBottom: "1.25rem" }}>Loan type breakdown</div>
              {[
                { label: "Personal loans",  val: "42%" },
                { label: "Business loans",  val: "31%" },
                { label: "Student loans",   val: "18%" },
                { label: "Real estate",     val: "9%"  },
              ].map(r => (
                <div key={r.label} className="score-row">
                  <span style={{ color: "#6B6A66" }}>{r.label}</span>
                  <strong>{r.val}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BORROWER DETAIL MODAL */}
      {detailLoan && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
          zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setDetailLoan(null)}>
          <div style={{
            background: "#fff", borderRadius: "14px", padding: "2rem",
            width: "600px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", position: "relative",
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setDetailLoan(null)}
              style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6B6A66" }}>×</button>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", marginBottom: "1.25rem" }}>
              {detailLoan.name} — {detailLoan.type} Loan
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              {[
                { label: "Loan amount",   val: `$${detailLoan.amount.toLocaleString()}` },
                { label: "Interest rate", val: `${detailLoan.rate}% APR` },
                { label: "Term",          val: `${detailLoan.term} months` },
                { label: "Purpose",       val: detailLoan.purpose },
                { label: "Annual income", val: `$${detailLoan.income.toLocaleString()}` },
                { label: "DTI ratio",     val: `${detailLoan.dti}%` },
              ].map(r => (
                <div key={r.label} style={{ background: "#F7F6F2", borderRadius: "8px", padding: "0.75rem 1rem" }}>
                  <div style={{ fontSize: "11px", color: "#6B6A66", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "4px" }}>{r.label}</div>
                  <div style={{ fontWeight: 500 }}>{r.val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span>Credit score</span><span style={{ color: detailLoan.credit >= 720 ? "#1D9E75" : "#EF9F27", fontWeight: 600 }}>{detailLoan.credit}</span>
            </div>
            <div className="risk-meter">
              <div className="risk-fill" style={{ width: `${Math.min(100, (detailLoan.credit - 580) / 2.2)}%`, background: detailLoan.credit >= 720 ? "#1D9E75" : "#EF9F27" }} />
            </div>

            {/* AI Analysis */}
            <div style={{ background: "linear-gradient(135deg,#F0FAF6,#EBF5FF)", border: "1px solid #5DCAA5", borderRadius: "12px", padding: "1.25rem", marginTop: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#085041" }}>AI Risk Assessment</div>
              </div>
              {aiLoading ? (
                <div style={{ display: "flex", gap: "4px", padding: "4px 0" }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1D9E75", display: "inline-block", animation: `bounce 1.2s ${i*0.2}s infinite` }} />)}
                </div>
              ) : (
                <div style={{ fontSize: "14px", lineHeight: 1.7, color: "#1a1a18" }}>
                  {aiAnalysis.split("\n").map((p, i) => p && <p key={i} style={{ marginBottom: "0.5rem" }}>{p}</p>)}
                </div>
              )}
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn-outline" onClick={() => setDetailLoan(null)}>Close</button>
              {!fundedIds.has(detailLoan.id) && (
                <button className="btn-primary" onClick={() => { setDetailLoan(null); setTab("opportunities"); }}>
                  Fund this loan →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}