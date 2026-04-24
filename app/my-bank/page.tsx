"use client";

import { useState } from "react";
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
  .btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-outline {
    padding: 9px 20px; border-radius: 99px;
    border: 1.5px solid rgba(0,0,0,0.09); background: none;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: #1a1a18; cursor: pointer; transition: all 0.15s;
  }
  .btn-outline:hover { border-color: #1D9E75; color: #1D9E75; }
  .btn-sm { padding: 6px 14px; font-size: 13px; }
  .field-input {
    border: 1.5px solid rgba(0,0,0,0.09); border-radius: 8px;
    padding: 10px 12px; font-size: 14px; color: #1a1a18;
    background: #F7F6F2; transition: border-color 0.15s, background 0.15s;
    width: 100%; outline: none; font-family: 'DM Sans', sans-serif;
  }
  .field-input:focus { border-color: #1D9E75; background: #fff; }
  .bank-option {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border: 1.5px solid rgba(0,0,0,0.09);
    border-radius: 8px; cursor: pointer; transition: all 0.15s; font-size: 14px;
  }
  .bank-option:hover { border-color: #1D9E75; background: #E1F5EE; }
  .bank-option.selected { border-color: #1D9E75; background: #E1F5EE; }
  .add-bank-tile {
    border: 2px dashed rgba(0,0,0,0.09); border-radius: 14px;
    padding: 1.5rem; display: flex; align-items: center; gap: 1rem;
    cursor: pointer; transition: all 0.2s; margin-top: 0.75rem;
  }
  .add-bank-tile:hover { border-color: #1D9E75; background: #E1F5EE; }
  .score-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.09); font-size: 13px;
  }
  .score-row:last-child { border-bottom: none; }
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 99px;
  }
  .badge::before { content:''; width:5px; height:5px; border-radius:50%; }
  .badge-green { background: #E1F5EE; color: #085041; }
  .badge-green::before { background: #1D9E75; }
`;

const ADD_BANKS = [
  { name: "Chase",           abbr: "JPM",  color: "#117ACA" },
  { name: "Bank of America", abbr: "BoA",  color: "#E31837" },
  { name: "Wells Fargo",     abbr: "WF",   color: "#CC0000" },
  { name: "Citi",            abbr: "Citi", color: "#003B70" },
  { name: "Capital One",     abbr: "C1",   color: "#D03027" },
  { name: "Ally Bank",       abbr: "Ally", color: "#7B3FA0" },
];

interface ConnectedBank {
  name: string;
  abbr: string;
  color: string;
  last4: string;
  connectedDate: string;
  usage: string;
}

export default function MyBankPage() {
  const router = useRouter();

  const [connectedBanks, setConnectedBanks] = useState<ConnectedBank[]>([
    { name: "Chase Checking", abbr: "JPM", color: "#117ACA", last4: "4821", connectedDate: "Apr 2025", usage: "Used for borrower verification" },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAddBank, setSelectedAddBank] = useState<typeof ADD_BANKS[0] | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthDone, setOauthDone] = useState(false);

  // Loan calculator state
  const [loanAmount, setLoanAmount] = useState(10000);
  const [loanTerm, setLoanTerm] = useState(36);
  const [loanPurpose, setLoanPurpose] = useState("Home renovation");
  const APR = 7.9;

  function calcMonthly(amount: number, term: number, rate: number) {
    const r = rate / 100 / 12;
    return (amount * r) / (1 - Math.pow(1 + r, -term));
  }

  const monthly = calcMonthly(loanAmount, loanTerm, APR);
  const totalRepay = monthly * loanTerm;
  const totalInterest = totalRepay - loanAmount;

  function fmt(n: number) {
    return "$" + Math.round(n).toLocaleString();
  }

  function simulateOAuth() {
    setOauthLoading(true);
    setTimeout(() => { setOauthLoading(false); setOauthDone(true); }, 1400);
  }

  function confirmAddBank() {
    if (!selectedAddBank) return;
    const newBank: ConnectedBank = {
      name: `${selectedAddBank.name} Checking`,
      abbr: selectedAddBank.abbr,
      color: selectedAddBank.color,
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      connectedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      usage: "Linked account",
    };
    setConnectedBanks(prev => [...prev, newBank]);
    setShowAddModal(false);
    setSelectedAddBank(null);
    setOauthDone(false);
  }

  function removeBank(index: number) {
    setConnectedBanks(prev => prev.filter((_, i) => i !== index));
  }

  function openAddModal() {
    setSelectedAddBank(null);
    setOauthDone(false);
    setOauthLoading(false);
    setShowAddModal(true);
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
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px" }}>
          bridge<span style={{ color: "#1D9E75" }}>lend</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {["Borrower","Lender","Become a Lender","My Bank"].map((t, i) => (
            <button key={t}
              onClick={() => router.push(["/borrower","/lender","/lender/signup","/my-bank"][i])}
              style={{
                padding: "7px 16px", borderRadius: "99px", border: "none",
                background: i === 3 ? "#1D9E75" : "none",
                color: i === 3 ? "#fff" : "#6B6A66",
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                fontWeight: i === 3 ? 500 : 400, cursor: "pointer",
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

        {/* HEADER */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "26px", marginBottom: "0.25rem" }}>My Bank Accounts</div>
          <div style={{ fontSize: "14px", color: "#6B6A66" }}>Manage the accounts you use to borrow and lend on BridgeLend.</div>
        </div>

        {/* CONNECTED ACCOUNTS */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#A5A49F", marginBottom: "0.75rem" }}>
            Connected accounts
          </div>

          {connectedBanks.length === 0 && (
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "2rem", textAlign: "center", color: "#A5A49F", fontSize: "14px" }}>
              No bank accounts connected yet.
            </div>
          )}

          {connectedBanks.map((bank, i) => (
            <div key={i} style={{
              background: "linear-gradient(135deg, #E1F5EE, #D4F0E8)",
              border: "1.5px solid #5DCAA5", borderRadius: "14px",
              padding: "1.25rem 1.5rem", display: "flex", alignItems: "center",
              justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
              marginBottom: "0.75rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: bank.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", color: "#fff", flexShrink: 0 }}>
                  {bank.abbr}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "15px" }}>{bank.name} ···{bank.last4}</div>
                  <div style={{ fontSize: "12px", color: "#6B6A66", marginTop: "2px" }}>
                    Connected {bank.connectedDate} · Read-only · {bank.usage}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="badge badge-green">Active</span>
                <button className="btn-outline btn-sm"
                  style={{ color: "#E24B4A", borderColor: "rgba(226,75,74,0.3)" }}
                  onClick={() => removeBank(i)}>
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Add bank tile */}
          <div className="add-bank-tile" onClick={openAddModal}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#F7F6F2", border: "1.5px solid rgba(0,0,0,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>+</div>
            <div>
              <strong style={{ fontSize: "14px", display: "block", marginBottom: "3px" }}>Add another bank account</strong>
              <span style={{ fontSize: "13px", color: "#6B6A66" }}>Link a checking or savings account via secure OAuth</span>
            </div>
          </div>
        </div>

        {/* CALCULATOR + SNAPSHOT */}
        <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#A5A49F", marginBottom: "0.75rem" }}>
          Estimate a loan from your account
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

          {/* LOAN CALCULATOR */}
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", marginBottom: "4px" }}>Loan calculator</div>
                <div style={{ fontSize: "13px", color: "#6B6A66" }}>Based on your verified profile</div>
              </div>
              <div style={{ background: "#E1F5EE", color: "#085041", padding: "4px 12px", borderRadius: "99px", fontSize: "13px", fontWeight: 600 }}>
                {APR}% APR
              </div>
            </div>

            {/* Amount slider */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6B6A66", marginBottom: "6px" }}>
                <span>Loan amount</span>
                <span style={{ fontWeight: 600, color: "#1a1a18", fontSize: "14px" }}>{fmt(loanAmount)}</span>
              </div>
              <input type="range" min="500" max="50000" step="500" value={loanAmount}
                onChange={e => setLoanAmount(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#1D9E75", cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#A5A49F", marginTop: "4px" }}>
                <span>$500</span><span>$50,000</span>
              </div>
            </div>

            {/* Term slider */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6B6A66", marginBottom: "6px" }}>
                <span>Repayment term</span>
                <span style={{ fontWeight: 600, color: "#1a1a18", fontSize: "14px" }}>{loanTerm} months</span>
              </div>
              <input type="range" min="6" max="60" step="6" value={loanTerm}
                onChange={e => setLoanTerm(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#1D9E75", cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#A5A49F", marginTop: "4px" }}>
                <span>6 mo</span><span>60 mo</span>
              </div>
            </div>

            {/* Purpose */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Loan purpose</label>
              <select className="field-input" value={loanPurpose} onChange={e => setLoanPurpose(e.target.value)}>
                {["Home renovation","Debt consolidation","Medical expenses","Education","Business","Vehicle","Other"].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Results */}
            <div style={{ background: "#F7F6F2", borderRadius: "8px", padding: "1rem", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {[
                { label: "Monthly",       val: fmt(monthly),       color: undefined },
                { label: "Total interest",val: fmt(totalInterest), color: "#B45309" },
                { label: "Total repay",   val: fmt(totalRepay),    color: undefined },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#6B6A66", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "4px" }}>{s.label}</div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>

            <button className="btn-primary" style={{ width: "100%" }}
              onClick={() => router.push("/borrower")}>
              Apply for this loan →
            </button>
          </div>

          {/* ACCOUNT SNAPSHOT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", marginBottom: "1.25rem" }}>Account snapshot</div>
              {[
                { label: "Verified income",    val: "$72,000 / yr",  color: undefined },
                { label: "Credit score",       val: "710 — Good",    color: "#1D9E75" },
                { label: "Debt-to-income ratio",val: "28%",          color: undefined },
                { label: "Avg monthly balance", val: "$8,400",       color: undefined },
                { label: "Pre-qualification",   val: "✓ Up to $20,000", color: "#1D9E75" },
              ].map(r => (
                <div key={r.label} className="score-row">
                  <span style={{ color: "#6B6A66" }}>{r.label}</span>
                  <strong style={{ color: r.color }}>{r.val}</strong>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.09)", padding: "1.5rem" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", marginBottom: "1.25rem" }}>Active loans</div>
              <div style={{ textAlign: "center", padding: "1.5rem", color: "#A5A49F", fontSize: "14px" }}>
                No active loans yet.<br />Apply above to get started.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD BANK MODAL */}
      {showAddModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
          zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            background: "#fff", borderRadius: "14px", padding: "2rem",
            width: "520px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", position: "relative",
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAddModal(false)}
              style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6B6A66" }}>×</button>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", marginBottom: "0.5rem" }}>Add a bank account</div>
            <p style={{ fontSize: "13px", color: "#6B6A66", marginBottom: "1rem" }}>
              Select your bank. You'll be redirected to authenticate on your bank's own secure page.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1rem" }}>
              {ADD_BANKS.map(bank => (
                <div key={bank.name}
                  className={`bank-option ${selectedAddBank?.name === bank.name ? "selected" : ""}`}
                  onClick={() => { setSelectedAddBank(bank); setOauthDone(false); setOauthLoading(false); }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: bank.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", color: "#fff", flexShrink: 0 }}>
                    {bank.abbr}
                  </div>
                  <strong>{bank.name}</strong>
                </div>
              ))}
            </div>

            {selectedAddBank && !oauthDone && (
              <div style={{ background: "#F7F6F2", borderRadius: "8px", padding: "1.25rem", border: "1.5px solid rgba(0,0,0,0.09)", textAlign: "center", marginBottom: "1rem" }}>
                <div style={{ fontSize: "13px", color: "#6B6A66", marginBottom: "0.75rem" }}>
                  You'll be securely redirected to <strong>{selectedAddBank.name}</strong>.<br />
                  BridgeLend never sees your username or password.
                </div>
                <div style={{ fontSize: "12px", color: "#A5A49F", marginBottom: "1rem" }}>🔒 OAuth 2.0 · Read-only access · Auto-expires in 15 min</div>
                <button className="btn-outline" onClick={simulateOAuth} disabled={oauthLoading}>
                  {oauthLoading ? "Redirecting…" : "Continue to bank login →"}
                </button>
              </div>
            )}

            {oauthDone && (
              <div>
                <div style={{ background: "#E1F5EE", borderRadius: "8px", padding: "0.75rem", fontSize: "13px", color: "#085041", marginBottom: "1rem", textAlign: "center" }}>
                  ↩ Account linked successfully ✓
                </div>
                <button className="btn-primary" style={{ width: "100%" }} onClick={confirmAddBank}>
                  Add this account →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}