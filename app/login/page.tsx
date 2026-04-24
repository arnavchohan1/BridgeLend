"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState("borrower");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");

  function checkStrength(val: string) {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    setPasswordStrength(score);
  }

  const strengthColors = ["", "#ef4444", "#eab308", "#3b82f6", "#1D9E75"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  async function handleLogin() {
    setError("");
    if (!loginEmail) { setError("Please enter your email address."); return; }
    if (!loginPassword) { setError("Please enter your password."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); return; }
      router.push("/borrower");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup() {
    setError("");
    if (!firstName || !lastName) { setError("Please enter your full name."); return; }
    if (!signupEmail || !signupEmail.includes("@")) { setError("Please enter a valid email address."); return; }
    if (signupPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!termsAccepted) { setError("Please accept the Terms of Service to continue."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          email: signupEmail,
          password: signupPassword,
          full_name: `${firstName} ${lastName}`,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed."); return; }
      router.push(role === "lender" ? "/lender/signup" : "/borrower");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    setError("");
    if (!forgotEmail || !forgotEmail.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setForgotSent(true);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "#F7F6F2",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1.5rem",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        input, select { font-family: 'DM Sans', sans-serif; }
        .field-input {
          border: 1.5px solid rgba(0,0,0,0.09);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          color: #1a1a18;
          background: #F7F6F2;
          transition: border-color 0.15s, background 0.15s;
          width: 100%;
          outline: none;
        }
        .field-input:focus { border-color: #1D9E75; background: #fff; }
        .btn-primary {
          width: 100%; padding: 11px; border-radius: 99px; border: none;
          background: #1D9E75; color: #fff; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .social-btn {
          width: 100%; padding: 10px; border-radius: 8px;
          border: 1.5px solid rgba(0,0,0,0.09); background: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: #1a1a18; cursor: pointer; display: flex;
          align-items: center; justify-content: center; gap: 10px;
          margin-bottom: 8px; transition: all 0.15s;
        }
        .social-btn:hover { border-color: #1D9E75; background: #E1F5EE; }
        .auth-tab {
          flex: 1; padding: 9px; border: none; background: none;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          font-weight: 500; color: #6B6A66; cursor: pointer;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          transition: all 0.15s;
        }
        .auth-tab.active { color: #1D9E75; border-bottom-color: #1D9E75; }
        .checkbox-custom {
          width: 15px; height: 15px; accent-color: #1D9E75;
          cursor: pointer; flex-shrink: 0; margin-top: 2px;
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{
          fontFamily: "'DM Serif Display', serif", fontSize: "28px",
          textAlign: "center", marginBottom: "0.4rem", color: "#1a1a18",
        }}>
          bridge<span style={{ color: "#1D9E75" }}>lend</span>
        </div>
        <div style={{
          textAlign: "center", fontSize: "14px", color: "#6B6A66",
          marginBottom: "2rem",
        }}>
          AI-powered lending for borrowers and investors
        </div>

        <div style={{
          background: "#fff", borderRadius: "14px",
          border: "1px solid rgba(0,0,0,0.09)", padding: "2rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}>
          {mode !== "forgot" && (
            <div style={{
              display: "flex", borderBottom: "1px solid rgba(0,0,0,0.09)",
              marginBottom: "1.5rem",
            }}>
              <button className={`auth-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => { setMode("login"); setError(""); }}>Log in</button>
              <button className={`auth-tab ${mode === "signup" ? "active" : ""}`}
                onClick={() => { setMode("signup"); setError(""); }}>Create account</button>
            </div>
          )}

          {error && (
            <div style={{
              background: "#FCEBEB", border: "1px solid rgba(226,75,74,0.25)",
              borderRadius: "8px", padding: "10px 12px",
              fontSize: "13px", color: "#501313", marginBottom: "1rem",
            }}>
              {error}
            </div>
          )}

          {mode === "login" && (
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>
                  Email address
                </label>
                <input className="field-input" type="email" placeholder="you@example.com"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input className="field-input" type={showPassword ? "text" : "password"}
                    placeholder="••••••••" style={{ paddingRight: "40px" }}
                    value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()} />
                  <button onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#A5A49F" }}>
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "right", marginBottom: "1.25rem" }}>
                <span onClick={() => { setMode("forgot"); setError(""); }}
                  style={{ fontSize: "12px", color: "#1D9E75", cursor: "pointer" }}>
                  Forgot password?
                </span>
              </div>
              <button className="btn-primary" onClick={handleLogin} disabled={loading}>
                {loading ? "Logging in…" : "Log in"}
              </button>
              <Divider />
              <SocialButtons />
            </div>
          )}

          {mode === "signup" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>First name</label>
                  <input className="field-input" type="text" placeholder="Jane"
                    value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Last name</label>
                  <input className="field-input" type="text" placeholder="Smith"
                    value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Email address</label>
                <input className="field-input" type="email" placeholder="you@example.com"
                  value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input className="field-input" type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters" style={{ paddingRight: "40px" }}
                    value={signupPassword}
                    onChange={e => { setSignupPassword(e.target.value); checkStrength(e.target.value); }} />
                  <button onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#A5A49F" }}>
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                {signupPassword.length > 0 && (
                  <div>
                    <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{
                          flex: 1, height: "3px", borderRadius: "2px",
                          background: i < passwordStrength ? strengthColors[passwordStrength] : "#E5E4DF",
                          transition: "background 0.3s",
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: "11px", color: strengthColors[passwordStrength], marginTop: "4px" }}>
                      {strengthLabels[passwordStrength]}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>I want to</label>
                <select className="field-input" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="borrower">Borrow money</option>
                  <option value="lender">Lend &amp; invest</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "1rem" }}>
                <input type="checkbox" className="checkbox-custom"
                  checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} />
                <label style={{ fontSize: "13px", color: "#1a1a18", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <span style={{ color: "#1D9E75", cursor: "pointer" }}>Terms of Service</span>{" "}
                  and{" "}
                  <span style={{ color: "#1D9E75", cursor: "pointer" }}>Privacy Policy</span>
                </label>
              </div>
              <button className="btn-primary" onClick={handleSignup} disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </button>
              <Divider />
              <SocialButtons />
            </div>
          )}

          {mode === "forgot" && (
            <div>
              {forgotSent ? (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div style={{ fontSize: "36px", marginBottom: "0.75rem" }}>📬</div>
                  <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Check your inbox</div>
                  <div style={{ fontSize: "13px", color: "#6B6A66" }}>
                    A reset link has been sent to <strong>{forgotEmail}</strong>
                  </div>
                  <div style={{ marginTop: "1.25rem" }}>
                    <span onClick={() => { setMode("login"); setForgotSent(false); setError(""); }}
                      style={{ fontSize: "13px", color: "#1D9E75", cursor: "pointer" }}>
                      ← Back to log in
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: "14px", color: "#6B6A66", marginBottom: "1.25rem" }}>
                    Enter your email and we'll send a reset link.
                  </p>
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ fontSize: "12px", color: "#6B6A66", fontWeight: 500, display: "block", marginBottom: "5px" }}>
                      Email address
                    </label>
                    <input className="field-input" type="email" placeholder="you@example.com"
                      value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                  </div>
                  <button className="btn-primary" onClick={handleForgot} disabled={loading}>
                    {loading ? "Sending…" : "Send reset link"}
                  </button>
                  <div style={{ textAlign: "center", marginTop: "1rem" }}>
                    <span onClick={() => { setMode("login"); setError(""); }}
                      style={{ fontSize: "13px", color: "#1D9E75", cursor: "pointer" }}>
                      ← Back to log in
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", fontSize: "12px", color: "#A5A49F", marginTop: "1.25rem" }}>
          🔒 256-bit encryption &nbsp;·&nbsp; SOC 2 compliant &nbsp;·&nbsp; FDIC partner verified
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      margin: "1.25rem 0", fontSize: "12px", color: "#A5A49F",
    }}>
      <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.09)" }} />
      or
      <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.09)" }} />
    </div>
  );
}

function SocialButtons() {
  return (
    <>
      <button className="social-btn">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>
      <button className="social-btn">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <path d="M14.26 9.55c-.02-2.17 1.77-3.22 1.85-3.27-1.01-1.48-2.58-1.68-3.14-1.7-1.34-.14-2.61.79-3.29.79-.68 0-1.73-.77-2.85-.75-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.25 2.74 2.21 1.1-.05 1.52-.71 2.85-.71 1.33 0 1.71.71 2.87.69 1.18-.02 1.93-1.07 2.65-2.14.84-1.22 1.18-2.42 1.2-2.48-.03-.01-2.38-.92-2.39-3.58z"/>
          <path d="M12.1 3.18c.61-.74 1.02-1.76.91-2.78-.88.04-1.95.59-2.58 1.32-.57.65-1.06 1.7-.93 2.7.99.08 2-.5 2.6-1.24z"/>
        </svg>
        Continue with Apple
      </button>
    </>
  );
}