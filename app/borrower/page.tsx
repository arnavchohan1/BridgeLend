"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #F7F6F2; }
  .field-input {
    border: 1.5px solid rgba(0,0,0,0.09); border-radius: 8px;
    padding: 10px 12px; font-size: 14px; color: #1a1a18;
    background: #F7F6F2; transition: border-color 0.15s, background 0.15s;
    width: 100%; outline: none; font-family: 'DM Sans', sans-serif;
  }
  .field-input:focus { border-color: #1D9E75; background: #fff; }
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
  .bank-connect {
    border: 2px dashed rgba(0,0,0,0.09); border-radius: 14px;
    padding: 2rem; text-align: center; transition: all 0.2s; cursor: pointer;
  }
  .bank-connect:hover { border-color: #1D9E75; background: #E1F5EE; }
  .bank-option {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border: 1.5px solid rgba(0,0,0,0.09);
    border-radius: 8px; cursor: pointer; transition: all 0.15s; font-size: 14px;
  }
  .bank-option:hover { border-color: #1D9E75; background: #E1F5EE; }
  .bank-option.selected { border-color: #1D9E75; background: #E1F5EE; }
  .offer-card {
    border-radius: 14px; border: 1.5px solid rgba(0,0,0,0.09);
    padding: 1.5rem; background: #fff; position: relative;
    transition: all 0.2s; cursor: pointer;
  }
  .offer-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
  .offer-card.best { border-color: #1D9E75; }
  .vstep-dot {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; flex-shrink: 0; margin-top: 2px;
  }
  .vstep-dot.idle { background: #F0EFE9; color: #A5A49F; }
  .vstep-dot.running { background: #FAEEDA; color: #412402; animation: spin 1s linear infinite; }
  .vstep-dot.done { background: #E1F5EE; color: #085041; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .typing span {
    width: 6px; height: 6px; border-radius: 50%;
    background: #1D9E75; display: inline-block;
    animation: bounce 1.2s infinite; margin: 0 2px;
  }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
`;

const BANKS = [
  { name: "Chase", abbr: "JPM", color: "#117ACA" },
  { name: "Bank of America", abbr: "BoA", color: "#E31837" },
  { name: "Wells Fargo", abbr: "WF", color: "#CC0000" },
  { name: "Citi", abbr: "Citi", color: "#003B70" },
  { name: "Capital One", abbr: "C1", color: "#D03027" },
];

const VERIFY_STEPS = [
  { label: "Identity verification", sub: "Confirming account holder matches application", result: "Identity confirmed ✓" },
  { label: "Income analysis", sub: "Analyzing 12 months of deposit history", result: "Avg income $72,000/yr ✓" },
  { label: "Debt & liability scan", sub: "Identifying recurring debt payments", result: "DTI ratio: 28% ✓" },
  { label: "Credit behavior signals", sub: "Analyzing balance trends and payment patterns", result: "Credit score: 710 — Good ✓" },
  { label: "Risk scoring & lender match", sub: "Calculating your personalized rate", result: "Pre-qualified up to $20,000 ✓" },
];

const OFFERS = [
  { type: "Standard", rate: 7.9, monthly: 312, total: 11232, term: 36, badge: null },
  { type: "Best Value", rate: 6.5, monthly: 274, total: 9864, term: 48, badge: "Best offer" },
  { type: "Low Monthly", rate: 8.4, monthly: 248, total: 14880, term: 60, badge: null },
];

type Step = "connect" | "verify" | "offers" | "request" | "aiResponse";

export default function BorrowerPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("connect");
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [oauthDone, setOauthDone] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verifyStates, setVerifyStates] = useState<("idle"|"running"|"done")[]>(["idle","idle","idle","idle","idle"]);
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [reqAmount, setReqAmount] = useState("15000");
  const [reqPurpose, setReqPurpose] = useState("Home renovation");
  const [reqTerm, setReqTerm] = useState("36");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [repayStats, setRepayStats] = useState<{monthly: number, interest: number, total: number} | null>(null);

  function simulateOAuth() {
    if (!selectedBank) return;
    setOauthLoading(true);
    setTimeout(() => {
      setOauthLoading(false);
      setOauthDone(true);
    }, 1400);
  }

  function startVerify() {
    setShowBankModal(false);
    setStep("verify");
    setVerifyProgress(0);
    setVerifyStates(["idle","idle","idle","idle","idle"]);

    const delays = [300, 2500, 5000, 7500, 10500];
    const dones =  [2200, 4500, 7000, 9500, 13000];

    delays.forEach((d, i) => {
      setTimeout(() => {
        setVerifyStates(prev => { const n = [...prev]; n[i] = "running"; return n; });
        setVerifyProgress(Math.round((i / 5) * 80));
      }, d);
      setTimeout(() => {
        setVerifyStates(prev => { const n = [...prev]; n[i] = "done"; return n; });
        if (i === 4) {
          setVerifyProgress(100);
          setTimeout(() => setStep("offers"), 800);
        }
      }, dones[i]);
    });
  }

  async function getLoan() {
    if (!selectedOffer === null) return;
    const offer = OFFERS[selectedOffer ?? 1];
    const amount = parseFloat(reqAmount) || 15000;
    const termMonths = parseInt(reqTerm);
    const rate = offer.rate / 100 / 12;
    const monthly = parseFloat(((amount * rate) / (1 - Math.pow(1 + rate, -termMonths))).toFixed(2));
    const total = parseFloat((monthly * termMonths).toFixed(2));
    const interest = parseFloat((total - amount).toFixed(2));
    setRepayStats({ monthly, interest, total });
    setStep("aiResponse");
    setAiLoading(true);
    setAiText("");

    try {
      // Also POST to /api/loans to create the application
      await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: reqPurpose,
          description: `Loan request for ${reqPurpose}`,
          amount,
          interest_rate: offer.rate,
          term_months: termMonths,
          purpose: reqPurpose.toLowerCase().replace(/ /g, "_"),
        }),
      });

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Give me a concise loan analysis for: $${amount} at ${offer.rate}% APR over ${termMonths} months for ${reqPurpose}. Monthly payment: $${monthly}. Total interest: $${interest}. Keep it to 3 short paragraphs covering: what this loan costs them, whether it's a good deal, and one tip to save money.`
          }],
          context: { amount, rate: offer.rate, term: termMonths, purpose: reqPurpose }
        }),
      });
      const data = await res.json();
      setAiText(data.response || "Analysis complete.");
    } catch {
      setAiText("Your loan application has been submitted. A lender will review it shortly.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F2", minHeight: "100vh" }}>
      <style>{STYLES}</style>

      {/* NAVBAR */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: "60px", background: "#fff",
        borderBottom: "1px solid rgba(0,0,0,0.09)", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#1a1a18" }}>
          bridge<span style={{ color: "#1D9E75" }}>lend</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {["Borrower", "Lender", "Become a Lender", "My Bank"].map((t, i) => (
            <button key={t}
              onClick={() => ["/borrower", "/lender", "/lender/signup", "/my-bank"][i] && router.push(["/borrower", "/lender", "/lender/signup", "/my-bank"][i])}
              style={{
                padding: "7px 16px", borderRadius: "99px", border: "none",
                background: i === 0 ? "#1D9E75" : "none",
                color: i === 0 ? "#fff" : "#6B6A66",
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                fontWeight: i === 0 ? 500 : 400, cursor: "pointer",
              }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#6B6A66" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "#E1F5EE", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#085041",
          }}>AC</div>
          <span>Arnav C.</span>
          <button className="btn-outline" style={{ padding: "5px 12px", fontSize: "12px" }}
            onClick={() => router.push("/login")}>Log out</button>
        </div>
      </nav>

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>

        {/* STEP 1: CONNECT BANK */}
        {step === "connect" && (
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", marginBottom: "0.25rem" }}>
              Find loans you qualify for
            </div>
            <div style={{ fontSize: "14px", color: "#6B6A66", marginBottom: "1.5rem" }}>
              Connect your bank to let us verify your financial profile — no credit score impact.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="bank-connect" onClick={() => setShowBankModal(true)}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>🏦</div>
                <div style={{ fontWeight: 500, fontSize: "15px", marginBottom: "6px" }}>Connect your bank</div>
                <div style={{ fontSize: "13px", color: "#6B6A66" }}>Securely link via bank-grade 256-bit encryption</div>
              </div>
              <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1rem" }}>
                <div style={{ fontSize: "12px", color: "#6B6A66", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>What we check</div>
                <div style={{ fontSize: "13px", lineHeight: 2, color: "#1a1a18" }}>
                  ✓ &nbsp;Identity & account ownership<br />
                  ✓ &nbsp;Income & deposit history<br />
                  ✓ &nbsp;Existing debt & recurring payments<br />
                  ✓ &nbsp;Average monthly balance<br />
                  ✓ &nbsp;Credit utilization signals
                </div>
              </div>
            </div>
            <div style={{
              background: "#fff", borderRadius: "14px", border: "1px dashed rgba(0,0,0,0.09)",
              padding: "1.5rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "13px", color: "#6B6A66" }}>
                🔒 &nbsp;Bank-level encryption &nbsp;·&nbsp; Read-only access &nbsp;·&nbsp; Never stored &nbsp;·&nbsp; FDIC partner verified
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: VERIFY */}
        {step === "verify" && (
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", marginBottom: "0.25rem" }}>
              Verifying your profile
            </div>
            <div style={{ fontSize: "14px", color: "#6B6A66", marginBottom: "1.5rem" }}>
              Our AI is securely pulling and analyzing your bank data. This takes about 15 seconds.
            </div>
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
              <div style={{ height: "4px", borderRadius: "2px", background: "#EEE", marginBottom: "1.5rem", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: "2px", background: "#1D9E75", width: `${verifyProgress}%`, transition: "width 1s ease" }} />
              </div>
              {VERIFY_STEPS.map((vs, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "16px 0", borderBottom: i < 4 ? "1px solid rgba(0,0,0,0.09)" : "none" }}>
                  <div className={`vstep-dot ${verifyStates[i]}`}>
                    {verifyStates[i] === "done" ? "✓" : i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>{vs.label}</div>
                    <div style={{ fontSize: "12px", color: "#6B6A66", marginTop: "3px" }}>{vs.sub}</div>
                    {verifyStates[i] === "done" && (
                      <div style={{ fontSize: "12px", color: "#085041", marginTop: "4px", fontWeight: 500 }}>{vs.result}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: OFFERS */}
        {step === "offers" && (
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", marginBottom: "0.25rem" }}>
              Your personalized loan offers
            </div>
            <div style={{ fontSize: "14px", color: "#6B6A66", marginBottom: "1rem" }}>
              Based on your verified profile — no impact to your credit score.
            </div>
            <div style={{ background: "#E1F5EE", border: "1px solid #5DCAA5", borderRadius: "14px", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#085041", textTransform: "uppercase", letterSpacing: ".06em" }}>✓ Verified Profile</div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "13px", color: "#085041" }}>
                  <span>Arnav C.</span><span>·</span>
                  <span>Income $72,000/yr</span><span>·</span>
                  <span>Credit 710</span><span>·</span>
                  <span>DTI 28%</span>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
              {OFFERS.map((offer, i) => (
                <div key={i} className={`offer-card ${offer.badge ? "best" : ""} ${selectedOffer === i ? "best" : ""}`}
                  onClick={() => setSelectedOffer(i)}>
                  {offer.badge && (
                    <div style={{
                      position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
                      background: "#1D9E75", color: "#fff", fontSize: "11px", fontWeight: 600,
                      padding: "3px 12px", borderRadius: "99px", whiteSpace: "nowrap",
                    }}>{offer.badge}</div>
                  )}
                  <div style={{ fontSize: "12px", color: "#6B6A66", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>{offer.type}</div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "36px", color: "#1a1a18" }}>
                    {offer.rate}%<span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "#6B6A66" }}> APR</span>
                  </div>
                  <div style={{ margin: "1rem 0", fontSize: "13px", color: "#6B6A66", lineHeight: 1.8 }}>
                    <strong style={{ color: "#1a1a18" }}>${offer.monthly}/mo</strong> · {offer.term} months<br />
                    Total repay: <strong style={{ color: "#1a1a18" }}>${offer.total.toLocaleString()}</strong>
                  </div>
                  <button className="btn-primary" style={{ width: "100%", padding: "8px" }}
                    onClick={e => { e.stopPropagation(); setSelectedOffer(i); setStep("request"); }}>
                    Select this offer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: REQUEST FORM */}
        {step === "request" && selectedOffer !== null && (
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", marginBottom: "0.25rem" }}>
              Request your loan
            </div>
            <div style={{ fontSize: "14px", color: "#6B6A66", marginBottom: "1.5rem" }}>
              Confirm your details and get a full AI breakdown.
            </div>
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", marginBottom: "1.25rem" }}>Loan details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Loan amount</label>
                  <input className="field-input" type="number" placeholder="e.g. 15000"
                    value={reqAmount} onChange={e => setReqAmount(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Loan purpose</label>
                  <select className="field-input" value={reqPurpose} onChange={e => setReqPurpose(e.target.value)}>
                    {["Home renovation","Debt consolidation","Medical expenses","Education","Business","Vehicle","Other"].map(p => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Repayment term</label>
                  <select className="field-input" value={reqTerm} onChange={e => setReqTerm(e.target.value)}>
                    {["12","24","36","48","60"].map(t => <option key={t} value={t}>{t} months</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Selected rate</label>
                  <input className="field-input" readOnly value={`${OFFERS[selectedOffer].rate}% APR`}
                    style={{ background: "#F0FAF6", color: "#085041", fontWeight: 600 }} />
                </div>
              </div>
              <button className="btn-primary" onClick={getLoan}>
                Get my loan &amp; full breakdown
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: AI RESPONSE */}
        {step === "aiResponse" && (
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", marginBottom: "0.25rem" }}>
              Your loan analysis
            </div>
            <div style={{ fontSize: "14px", color: "#6B6A66", marginBottom: "1.5rem" }}>
              Application submitted — here's your personalized breakdown.
            </div>
            <div style={{
              background: "linear-gradient(135deg, #F0FAF6 0%, #EBF5FF 100%)",
              border: "1px solid #5DCAA5", borderRadius: "14px", padding: "1.5rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#085041" }}>BridgeLend AI Agent</div>
                  <div style={{ fontSize: "11px", color: "#6B6A66" }}>Personalized loan analysis</div>
                </div>
              </div>
              {aiLoading ? (
                <div className="typing"><span /><span /><span /></div>
              ) : (
                <div style={{ fontSize: "14px", lineHeight: 1.75, color: "#1a1a18" }}>
                  {aiText.split("\n").map((p, i) => p && <p key={i} style={{ marginBottom: "0.75rem" }}>{p}</p>)}
                </div>
              )}
            </div>

            {repayStats && !aiLoading && (
              <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem", marginTop: "1rem" }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", marginBottom: "1.25rem" }}>Repayment breakdown</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
                  {[
                    { label: "Monthly", val: `$${repayStats.monthly.toLocaleString()}` },
                    { label: "Total interest", val: `$${repayStats.interest.toLocaleString()}` },
                    { label: "Total repay", val: `$${repayStats.total.toLocaleString()}` },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#F7F6F2", borderRadius: "8px", padding: "1rem", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "#6B6A66", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "4px" }}>{s.label}</div>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px" }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BANK MODAL */}
      {showBankModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
          zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setShowBankModal(false)}>
          <div style={{
            background: "#fff", borderRadius: "14px", padding: "2rem",
            width: "520px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", position: "relative",
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowBankModal(false)}
              style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6B6A66" }}>×</button>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", marginBottom: "0.5rem" }}>Connect your bank</div>
            <p style={{ fontSize: "13px", color: "#6B6A66", marginBottom: "1rem" }}>
              Select your bank to securely connect via read-only access.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1rem" }}>
              {BANKS.map(bank => (
                <div key={bank.name} className={`bank-option ${selectedBank === bank.name ? "selected" : ""}`}
                  onClick={() => { setSelectedBank(bank.name); setOauthDone(false); }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: bank.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", color: "#fff", flexShrink: 0 }}>
                    {bank.abbr}
                  </div>
                  <strong>{bank.name}</strong>
                </div>
              ))}
            </div>
            {selectedBank && !oauthDone && (
              <div style={{ background: "#F7F6F2", borderRadius: "8px", padding: "1.25rem", border: "1.5px solid rgba(0,0,0,0.09)", textAlign: "center", marginBottom: "1rem" }}>
                <div style={{ fontSize: "13px", color: "#6B6A66", marginBottom: "0.75rem" }}>
                  You'll be securely redirected to your bank's login page.<br />
                  BridgeLend never sees your username or password.
                </div>
                <div style={{ fontSize: "12px", color: "#A5A49F", marginBottom: "1rem" }}>🔒 OAuth 2.0 · Read-only token · Auto-expires in 15 min</div>
                <button className="btn-outline" onClick={simulateOAuth} disabled={oauthLoading}>
                  {oauthLoading ? "Redirecting…" : "Continue to bank login →"}
                </button>
              </div>
            )}
            {oauthDone && (
              <div>
                <div style={{ background: "#E1F5EE", borderRadius: "8px", padding: "0.75rem", fontSize: "13px", color: "#085041", marginBottom: "1rem", textAlign: "center" }}>
                  ↩ Bank connected successfully ✓
                </div>
                <button className="btn-primary" style={{ width: "100%" }} onClick={startVerify}>
                  Verify my profile →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}