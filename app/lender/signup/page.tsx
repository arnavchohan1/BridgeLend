"use client";

import { useState } from "react";
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
    padding: 10px 24px; border-radius: 99px; border: none;
    background: #1D9E75; color: #fff; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
  }
  .btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn-outline {
    padding: 10px 24px; border-radius: 99px;
    border: 1.5px solid rgba(0,0,0,0.09); background: none;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: #1a1a18; cursor: pointer; transition: all 0.15s;
  }
  .btn-outline:hover { border-color: #1D9E75; color: #1D9E75; }
  .risk-opt {
    border: 1.5px solid rgba(0,0,0,0.09); border-radius: 8px;
    padding: 1rem; cursor: pointer; transition: all 0.15s; text-align: center;
  }
  .risk-opt:hover { border-color: #1D9E75; background: #E1F5EE; }
  .risk-opt.selected { border-color: #1D9E75; background: #E1F5EE; }
  .bank-option {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border: 1.5px solid rgba(0,0,0,0.09);
    border-radius: 8px; cursor: pointer; transition: all 0.15s; font-size: 14px;
  }
  .bank-option:hover { border-color: #1D9E75; background: #E1F5EE; }
  .bank-option.selected { border-color: #1D9E75; background: #E1F5EE; }
  .checkbox-row {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.09); font-size: 14px;
  }
  .checkbox-row:last-of-type { border-bottom: none; }
  .checkbox-custom { width: 15px; height: 15px; accent-color: #1D9E75; cursor: pointer; flex-shrink: 0; margin-top: 2px; }
  .sp-dot { width: 8px; height: 8px; border-radius: 50%; background: #DDD; }
  .sp-step { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #A5A49F; }
  .sp-step.active { color: #085041; font-weight: 600; }
  .sp-step.active .sp-dot { background: #1D9E75; }
  .sp-step.done { color: #1D9E75; }
  .sp-step.done .sp-dot { background: #1D9E75; }
`;

const BANKS = [
  { name: "Chase",           abbr: "JPM",  color: "#117ACA" },
  { name: "Bank of America", abbr: "BoA",  color: "#E31837" },
  { name: "Wells Fargo",     abbr: "WF",   color: "#CC0000" },
  { name: "Citi",            abbr: "Citi", color: "#003B70" },
  { name: "Other bank",      abbr: "+",    color: "#6B6A66" },
];

const US_STATES = ["CA","TX","NY","FL","WA","IL","PA","OH","GA","NC","MI","NJ","VA","AZ","CO","Other"];

export default function LenderSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Step 1 fields
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [ssn, setSsn] = useState("");
  const [addr, setAddr] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [acc1, setAcc1] = useState(false);
  const [acc2, setAcc2] = useState(false);
  const [acc3, setAcc3] = useState(false);

  // Step 2 fields
  const [risk, setRisk] = useState("balanced");
  const [loanTypes, setLoanTypes] = useState({ personal: true, business: true, student: false, realestate: false });
  const [budget, setBudget] = useState("$1,000 – $5,000");
  const [minAmount, setMinAmount] = useState("500");
  const [maxAmount, setMaxAmount] = useState("10000");
  const [minRate, setMinRate] = useState("5.0");
  const [autoDeploy, setAutoDeploy] = useState("No — I'll manually select each loan");

  // Step 3 fields
  const [selectedBank, setSelectedBank] = useState("");
  const [bankConnected, setBankConnected] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [deposit, setDeposit] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function goStep(n: number) {
    setStep(n);
    setError("");
    window.scrollTo(0, 0);
  }

  function validateStep1() {
    if (!fname || !lname) { setError("Please enter your full name."); return false; }
    if (!email || !email.includes("@")) { setError("Please enter a valid email address."); return false; }
    if (!acc2 || !acc3) { setError("Please accept the risk disclosure and lender agreement."); return false; }
    return true;
  }

  function validateStep2() {
    const anyType = Object.values(loanTypes).some(Boolean);
    if (!anyType) { setError("Please select at least one loan type."); return false; }
    return true;
  }

  function simulateOAuth() {
    setOauthLoading(true);
    setTimeout(() => { setOauthLoading(false); setBankConnected(true); }, 1400);
  }

  async function handleFinish() {
    if (!bankConnected) { setError("Please connect a funding bank account first."); return; }
    const dep = parseFloat(deposit);
    if (!dep || dep < 100) { setError("Minimum deposit is $100."); return; }
    setSubmitting(true);
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          email,
          password: "TempPass123!",
          full_name: `${fname} ${lname}`,
          role: "lender",
        }),
      });
    } catch { /* best effort */ }
    setSubmitting(false);
    goStep(4);
  }

  const stepLabels = ["About you", "Lending preferences", "Fund your account", "Done"];

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
          {(["Borrower","Lender","Become a Lender","My Bank"]).map((t, i) => (
            <button key={t}
              onClick={() => router.push(["/borrower","/lender","/lender/signup","/my-bank"][i])}
              style={{
                padding: "7px 16px", borderRadius: "99px", border: "none",
                background: i === 2 ? "#1D9E75" : "none",
                color: i === 2 ? "#fff" : "#6B6A66",
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                fontWeight: i === 2 ? 500 : 400, cursor: "pointer",
              }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#6B6A66" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#085041" }}>AC</div>
          <span>Arnav C.</span>
          <button onClick={() => router.push("/login")}
            style={{ padding: "5px 12px", borderRadius: "99px", border: "1.5px solid rgba(0,0,0,0.09)", background: "none", fontSize: "12px", cursor: "pointer" }}>Log out</button>
        </div>
      </nav>

      <div style={{ padding: "2rem", maxWidth: "680px", margin: "0 auto" }}>

        {/* PROGRESS BAR */}
        {step < 4 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2rem" }}>
            {stepLabels.slice(0, 4).map((label, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", flex: i < 3 ? "1" : "0" }}>
                <div className={`sp-step ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}>
                  <div className="sp-dot" />
                  {label}
                </div>
                {i < 3 && <div style={{ flex: 1, height: "1px", background: "#DDD" }} />}
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={{ background: "#FCEBEB", border: "1px solid rgba(226,75,74,0.25)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#501313", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* ── STEP 1: ABOUT YOU ── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "32px", lineHeight: 1.2, marginBottom: "0.75rem" }}>
                Start earning as a lender
              </div>
              <p style={{ fontSize: "15px", color: "#6B6A66", lineHeight: 1.6 }}>
                Join thousands of everyday investors earning 6–12% returns by funding verified personal and business loans.
              </p>
            </div>

            {/* How it works */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
              {[
                { num: "1", title: "Verify your identity", sub: "Quick KYC check — takes under 2 minutes" },
                { num: "2", title: "Set your preferences", sub: "Choose risk tolerance and loan types" },
                { num: "3", title: "Fund & start earning", sub: "Deposit and begin funding borrowers today" },
              ].map(s => (
                <div key={s.num} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.09)", borderRadius: "14px", padding: "1.5rem", textAlign: "center" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#E1F5EE", color: "#085041", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>{s.num}</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>{s.title}</div>
                  <div style={{ fontSize: "13px", color: "#6B6A66" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", marginBottom: "1.25rem" }}>Personal details</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[
                  { label: "First name", val: fname, set: setFname, placeholder: "Jane", type: "text" },
                  { label: "Last name",  val: lname, set: setLname, placeholder: "Smith", type: "text" },
                  { label: "Email address", val: email, set: setEmail, placeholder: "jane@example.com", type: "email" },
                  { label: "Phone number", val: phone, set: setPhone, placeholder: "+1 (555) 000-0000", type: "tel" },
                  { label: "Date of birth", val: dob, set: setDob, placeholder: "", type: "date" },
                  { label: "SSN (last 4 digits)", val: ssn, set: setSsn, placeholder: "••••", type: "text" },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>{f.label}</label>
                    <input className="field-input" type={f.type} placeholder={f.placeholder}
                      value={f.val} onChange={e => f.set(e.target.value)}
                      maxLength={f.label.includes("SSN") ? 4 : undefined} />
                  </div>
                ))}
              </div>

              <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#A5A49F", margin: "1.5rem 0 0.75rem" }}>
                Residential address
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Street address</label>
                  <input className="field-input" type="text" placeholder="123 Main St" value={addr} onChange={e => setAddr(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>City</label>
                  <input className="field-input" type="text" placeholder="San Francisco" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>State</label>
                  <select className="field-input" value={state} onChange={e => setState(e.target.value)}>
                    <option value="">Select state…</option>
                    {US_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>ZIP code</label>
                  <input className="field-input" type="text" placeholder="94105" value={zip} onChange={e => setZip(e.target.value)} maxLength={10} />
                </div>
              </div>

              <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#A5A49F", margin: "1.5rem 0 0.75rem" }}>
                Investor accreditation
              </div>
              <div>
                {[
                  { id: "acc1", val: acc1, set: setAcc1, label: "I am an accredited investor", sub: "Annual income exceeding $200K, or net worth over $1M excluding primary residence" },
                  { id: "acc2", val: acc2, set: setAcc2, label: "I understand peer-to-peer lending involves risk of capital loss", sub: "Returns are not guaranteed and borrowers may default" },
                  { id: "acc3", val: acc3, set: setAcc3, label: "I agree to the BridgeLend Lender Agreement and Terms of Service", sub: "" },
                ].map(c => (
                  <div key={c.id} className="checkbox-row">
                    <input type="checkbox" className="checkbox-custom" checked={c.val} onChange={e => c.set(e.target.checked)} />
                    <label style={{ cursor: "pointer", lineHeight: 1.5 }}>
                      {c.label}
                      {c.sub && <span style={{ fontSize: "12px", color: "#6B6A66", display: "block", marginTop: "2px" }}>{c.sub}</span>}
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                <button className="btn-primary" onClick={() => { if (validateStep1()) goStep(2); }}>
                  Continue to preferences →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: PREFERENCES ── */}
        {step === 2 && (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", marginBottom: "0.5rem" }}>Lending preferences</div>
            <p style={{ fontSize: "14px", color: "#6B6A66", marginBottom: "1.5rem" }}>
              Tell us what kinds of loans you want to fund. You can always change these later.
            </p>

            <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#A5A49F", marginBottom: "0.75rem" }}>Risk tolerance</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "1.5rem" }}>
              {[
                { id: "conservative", icon: "🛡️", label: "Conservative", sub: "Credit 720+ · 6–8% returns · Lowest default risk" },
                { id: "balanced",     icon: "⚖️", label: "Balanced",     sub: "Credit 650+ · 8–10% returns · Moderate risk" },
                { id: "growth",       icon: "📈", label: "Growth",       sub: "Credit 580+ · 10–13% returns · Higher risk" },
              ].map(r => (
                <div key={r.id} className={`risk-opt ${risk === r.id ? "selected" : ""}`} onClick={() => setRisk(r.id)}>
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>{r.icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: "11px", color: "#6B6A66", marginTop: "3px" }}>{r.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#A5A49F", marginBottom: "0.75rem" }}>Loan types to fund</div>
            <div style={{ marginBottom: "1.5rem" }}>
              {[
                { id: "personal",   label: "Personal loans",  sub: "Home renovation, medical, major purchases" },
                { id: "business",   label: "Business loans",  sub: "Inventory, equipment, expansion capital" },
                { id: "student",    label: "Student loans",   sub: "Tuition and education costs" },
                { id: "realestate", label: "Real estate",     sub: "Down payment support and property improvements" },
              ].map(t => (
                <div key={t.id} className="checkbox-row">
                  <input type="checkbox" className="checkbox-custom"
                    checked={loanTypes[t.id as keyof typeof loanTypes]}
                    onChange={e => setLoanTypes(p => ({ ...p, [t.id]: e.target.checked }))} />
                  <label style={{ cursor: "pointer", lineHeight: 1.5 }}>
                    {t.label}
                    <span style={{ fontSize: "12px", color: "#6B6A66", display: "block", marginTop: "2px" }}>{t.sub}</span>
                  </label>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#A5A49F", marginBottom: "0.75rem" }}>Monthly investment budget</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>I plan to invest per month</label>
                <select className="field-input" value={budget} onChange={e => setBudget(e.target.value)}>
                  {["$100 – $500","$500 – $1,000","$1,000 – $5,000","$5,000 – $25,000","$25,000+"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Min loan amount</label>
                <input className="field-input" type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Max loan amount</label>
                <input className="field-input" type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Min interest rate (%)</label>
                <input className="field-input" type="number" value={minRate} onChange={e => setMinRate(e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Auto-deploy funds</label>
                <select className="field-input" value={autoDeploy} onChange={e => setAutoDeploy(e.target.value)}>
                  <option>Yes — auto-match me with qualifying borrowers</option>
                  <option>No — I'll manually select each loan</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button className="btn-outline" onClick={() => goStep(1)}>← Back</button>
              <button className="btn-primary" onClick={() => { if (validateStep2()) goStep(3); }}>
                Continue to funding →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: FUND ACCOUNT ── */}
        {step === 3 && (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", marginBottom: "0.5rem" }}>Fund your lender account</div>
            <p style={{ fontSize: "14px", color: "#6B6A66", marginBottom: "1.5rem" }}>
              Connect a bank account to deposit your initial investment. You can withdraw any uninvested balance at any time.
            </p>

            <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#A5A49F", marginBottom: "0.75rem" }}>Link your funding bank</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1rem" }}>
              {BANKS.map(bank => (
                <div key={bank.name} className={`bank-option ${selectedBank === bank.name ? "selected" : ""}`}
                  onClick={() => { setSelectedBank(bank.name); setBankConnected(false); }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: bank.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", color: "#fff", flexShrink: 0 }}>
                    {bank.abbr}
                  </div>
                  <strong>{bank.name}</strong>
                </div>
              ))}
            </div>

            {selectedBank && !bankConnected && (
              <div style={{ background: "#F7F6F2", borderRadius: "8px", padding: "1.25rem", border: "1.5px solid rgba(0,0,0,0.09)", textAlign: "center", marginBottom: "1rem" }}>
                <div style={{ fontSize: "13px", color: "#6B6A66", marginBottom: "0.75rem" }}>
                  You'll be redirected to your bank to authorise a one-time ACH link.<br />
                  BridgeLend never stores your login credentials.
                </div>
                <div style={{ fontSize: "12px", color: "#A5A49F", marginBottom: "1rem" }}>🔒 OAuth 2.0 · ACH debit only · Revocable at any time</div>
                <button className="btn-outline" onClick={simulateOAuth} disabled={oauthLoading}>
                  {oauthLoading ? "Redirecting…" : "Connect via bank login →"}
                </button>
              </div>
            )}

            {bankConnected && (
              <div>
                <div style={{ background: "#E1F5EE", borderRadius: "8px", padding: "0.75rem", fontSize: "13px", color: "#085041", marginBottom: "1rem", textAlign: "center" }}>
                  ↩ Bank connected successfully ✓
                </div>
                <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#A5A49F", marginBottom: "0.75rem" }}>Initial deposit amount</div>
                <div style={{ maxWidth: "280px", marginBottom: "1rem" }}>
                  <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Amount to deposit (min. $100)</label>
                  <input className="field-input" type="number" placeholder="e.g. 2500" min="100"
                    value={deposit} onChange={e => setDeposit(e.target.value)} />
                </div>
                <div style={{ background: "#E1F5EE", borderRadius: "8px", padding: "1rem", fontSize: "13px", color: "#085041", marginBottom: "1rem" }}>
                  💡 Deposits are held in an FDIC-insured escrow account and only deployed when you fund a loan.
                </div>
              </div>
            )}

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between" }}>
              <button className="btn-outline" onClick={() => goStep(2)}>← Back</button>
              <button className="btn-primary" disabled={submitting} onClick={handleFinish}>
                {submitting ? "Creating account…" : "Create my lender account →"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: SUCCESS ── */}
        {step === 4 && (
          <div style={{
            background: "linear-gradient(135deg, #E1F5EE, #D4F0E8)",
            border: "1px solid #5DCAA5", borderRadius: "14px",
            padding: "3rem 2rem", textAlign: "center",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🎉</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "26px", color: "#085041", marginBottom: "0.5rem" }}>
              Welcome to BridgeLend, {fname || "Lender"}!
            </div>
            <p style={{ fontSize: "14px", color: "#6B6A66", marginTop: "0.5rem" }}>
              Your account is live. Start browsing verified loan requests and put your capital to work.
            </p>
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => router.push("/lender")}>
                Browse loan opportunities →
              </button>
              <button className="btn-outline" onClick={() => router.push("/my-bank")}>
                Manage my bank accounts
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}