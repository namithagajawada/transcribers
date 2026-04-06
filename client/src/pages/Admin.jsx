import { useState, useEffect } from "react";
import axios from "axios";

const ADMIN_PIN = "scribe2026admin"; // change this to whatever you want

export default function Admin() {
  const [pin,          setPin]          = useState("");
  const [authed,       setAuthed]       = useState(false);
  const [pinError,     setPinError]     = useState("");
  const [transcribers, setTranscribers] = useState([]);
  const [filter,       setFilter]       = useState("pending"); // pending | all
  const [loading,      setLoading]      = useState(false);
  const [acting,       setActing]       = useState(null);

  const login = () => {
    if (pin === ADMIN_PIN) { setAuthed(true); setPinError(""); }
    else setPinError("Incorrect PIN");
  };

  const fetchTranscribers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/admin/transcribers?adminPin=${ADMIN_PIN}`);
      setTranscribers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchTranscribers();
  }, [authed]);

  const decide = async (userId, approve) => {
    setActing(userId);
    try {
      await axios.patch(`http://localhost:5000/users/${userId}/verify`, {
        approve,
        adminPin: ADMIN_PIN,
      });
      // Update local state immediately
      setTranscribers(prev =>
        prev.map(t =>
          t._id === userId
            ? { ...t, isVerified: approve, verificationStatus: approve ? "verified" : "rejected" }
            : t
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || "Action failed");
    } finally {
      setActing(null);
    }
  };

  const filtered = filter === "pending"
    ? transcribers.filter(t => t.verificationStatus === "pending")
    : transcribers;

  const counts = {
    pending:  transcribers.filter(t => t.verificationStatus === "pending").length,
    verified: transcribers.filter(t => t.verificationStatus === "verified").length,
    rejected: transcribers.filter(t => t.verificationStatus === "rejected").length,
    unverified: transcribers.filter(t => t.verificationStatus === "unverified").length,
  };

  const statusStyle = {
    verified:   { bg: "rgba(78,205,196,0.15)",  color: "#4ECDC4" },
    pending:    { bg: "rgba(255,230,109,0.15)", color: "#FFE66D" },
    rejected:   { bg: "rgba(255,107,107,0.15)", color: "#FF6B6B" },
    unverified: { bg: "rgba(255,255,255,0.08)", color: "#7A9BB5" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--bg:#06101E;--bg2:#0C1A2E;--teal:#4ECDC4;--coral:#FF6B6B;--sun:#FFE66D;--text:#E8F6FF;--muted:#7A9BB5;--border:rgba(78,205,196,0.18);}
        body{background:var(--bg);color:var(--text);font-family:'Nunito',sans-serif;}

        /* PIN SCREEN */
        .adm-pin-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);}
        .adm-pin-box{width:100%;max-width:380px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:24px;padding:40px 32px;text-align:center;}
        .adm-pin-icon{font-size:2.5rem;margin-bottom:16px;}
        .adm-pin-title{font-family:'Sora',sans-serif;font-weight:800;font-size:1.5rem;margin-bottom:6px;}
        .adm-pin-sub{color:var(--muted);font-size:0.88rem;margin-bottom:24px;}
        .adm-pin-input{width:100%;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.12);border-radius:12px;padding:13px 16px;color:var(--text);font-family:'Nunito',sans-serif;font-size:1rem;outline:none;text-align:center;letter-spacing:0.1em;transition:border-color 0.2s;}
        .adm-pin-input:focus{border-color:var(--teal);}
        .adm-pin-error{color:var(--coral);font-size:0.82rem;margin-top:8px;}
        .adm-pin-btn{width:100%;margin-top:16px;padding:13px;background:linear-gradient(135deg,var(--teal),#2cb5ae);color:#06101E;border:none;border-radius:12px;font-family:'Sora',sans-serif;font-weight:800;font-size:0.95rem;cursor:pointer;transition:transform 0.2s;}
        .adm-pin-btn:hover{transform:translateY(-2px);}

        /* DASHBOARD */
        .adm-root{min-height:100vh;background:var(--bg);}
        .adm-nav{display:flex;justify-content:space-between;align-items:center;padding:16px 36px;background:rgba(12,26,46,0.92);border-bottom:1px solid var(--border);backdrop-filter:blur(12px);position:sticky;top:0;z-index:10;}
        .adm-logo{font-family:'Sora',sans-serif;font-weight:800;font-size:1.2rem;background:linear-gradient(135deg,var(--teal),var(--sun));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .adm-logo span{font-weight:300;}
        .adm-logo-tag{font-size:0.7rem;font-weight:700;color:var(--coral);letter-spacing:0.08em;margin-left:8px;}
        .adm-content{padding:36px;max-width:960px;margin:0 auto;}
        .adm-title{font-family:'Sora',sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:-0.02em;margin-bottom:6px;}
        .adm-sub{color:var(--muted);font-size:0.88rem;margin-bottom:28px;}

        /* STATS */
        .adm-stats{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px;}
        .adm-stat{flex:1;min-width:120px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center;}
        .adm-stat-num{font-family:'Sora',sans-serif;font-weight:800;font-size:1.8rem;}
        .adm-stat-label{font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;margin-top:3px;}

        /* FILTER */
        .adm-filter-row{display:flex;gap:8px;margin-bottom:20px;}
        .adm-filter-btn{padding:8px 18px;border-radius:10px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600;font-size:0.82rem;border:1.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:var(--muted);transition:all 0.2s;}
        .adm-filter-btn.active{border-color:var(--teal);background:rgba(78,205,196,0.12);color:var(--teal);}

        /* TRANSCRIBER CARD */
        .adm-card{background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:18px;padding:22px;margin-bottom:14px;transition:border-color 0.2s;}
        .adm-card:hover{border-color:rgba(78,205,196,0.28);}
        .adm-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:12px;}
        .adm-card-left{flex:1;min-width:0;}
        .adm-name{font-family:'Sora',sans-serif;font-weight:700;font-size:1rem;margin-bottom:4px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
        .adm-meta{font-size:0.78rem;color:var(--muted);display:flex;gap:14px;flex-wrap:wrap;margin-bottom:6px;}
        .adm-bio{font-size:0.82rem;color:var(--text);line-height:1.55;}
        .adm-status-badge{padding:4px 12px;border-radius:100px;font-size:0.72rem;font-weight:700;white-space:nowrap;}
        .adm-skills{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;}
        .adm-chip{padding:3px 10px;border-radius:100px;background:rgba(78,205,196,0.1);border:1px solid rgba(78,205,196,0.2);color:var(--teal);font-size:0.68rem;font-weight:700;}
        .adm-chip-lang{background:rgba(255,107,107,0.08);border-color:rgba(255,107,107,0.18);color:var(--coral);}

        /* DOCS */
        .adm-docs{margin:14px 0;padding:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;}
        .adm-docs-title{font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--muted);margin-bottom:10px;}
        .adm-doc-link{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:7px 14px;color:var(--text);text-decoration:none;font-size:0.8rem;margin:4px 4px 4px 0;transition:background 0.2s;}
        .adm-doc-link:hover{background:rgba(255,255,255,0.1);color:var(--teal);}
        .adm-no-docs{font-size:0.82rem;color:var(--muted);font-style:italic;}

        /* ACTIONS */
        .adm-actions{display:flex;gap:10px;flex-wrap:wrap;}
        .adm-approve-btn{background:linear-gradient(135deg,var(--teal),#2cb5ae);color:#06101E;border:none;border-radius:10px;padding:10px 22px;font-family:'Sora',sans-serif;font-weight:700;font-size:0.85rem;cursor:pointer;transition:transform 0.15s,opacity 0.2s;box-shadow:0 4px 16px rgba(78,205,196,0.25);}
        .adm-approve-btn:hover:not(:disabled){transform:scale(1.03);}
        .adm-approve-btn:disabled{opacity:0.55;cursor:not-allowed;}
        .adm-reject-btn{background:rgba(255,107,107,0.12);border:1px solid rgba(255,107,107,0.3);color:var(--coral);border-radius:10px;padding:10px 22px;font-family:'Sora',sans-serif;font-weight:700;font-size:0.85rem;cursor:pointer;transition:background 0.2s,opacity 0.2s;}
        .adm-reject-btn:hover:not(:disabled){background:rgba(255,107,107,0.22);}
        .adm-reject-btn:disabled{opacity:0.55;cursor:not-allowed;}
        .adm-already{font-size:0.82rem;font-weight:700;padding:8px 0;}

        .adm-empty{text-align:center;padding:56px 0;color:var(--muted);font-size:0.9rem;}
        .adm-loading{text-align:center;padding:56px 0;color:var(--teal);font-size:0.9rem;}
        .adm-refresh-btn{background:rgba(78,205,196,0.1);border:1px solid var(--border);color:var(--teal);border-radius:9px;padding:8px 18px;cursor:pointer;font-weight:700;font-size:0.8rem;transition:background 0.2s;}
        .adm-refresh-btn:hover{background:rgba(78,205,196,0.18);}
      `}</style>

      {/* ── PIN GATE ── */}
      {!authed ? (
        <div className="adm-pin-wrap">
          <div className="adm-pin-box">
            <div className="adm-pin-icon">🛡️</div>
            <div className="adm-pin-title">Admin Access</div>
            <div className="adm-pin-sub">Enter your admin PIN to continue</div>
            <input
              className="adm-pin-input"
              type="password"
              placeholder="••••••••••••"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
            />
            {pinError && <div className="adm-pin-error">⚠️ {pinError}</div>}
            <button className="adm-pin-btn" onClick={login}>Enter Dashboard →</button>
          </div>
        </div>
      ) : (

        /* ── DASHBOARD ── */
        <div className="adm-root">
          <nav className="adm-nav">
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="adm-logo">Scribe<span>Connect</span></div>
              <span className="adm-logo-tag">ADMIN</span>
            </div>
            <button className="adm-refresh-btn" onClick={fetchTranscribers}>🔄 Refresh</button>
          </nav>

          <div className="adm-content">
            <div className="adm-title">Verification Requests</div>
            <div className="adm-sub">Review uploaded documents and approve or reject transcriber verification</div>

            {/* Stats */}
            <div className="adm-stats">
              {[
                { label: "Pending",    num: counts.pending,    color: "#FFE66D" },
                { label: "Verified",   num: counts.verified,   color: "#4ECDC4" },
                { label: "Rejected",   num: counts.rejected,   color: "#FF6B6B" },
                { label: "Unverified", num: counts.unverified, color: "#7A9BB5" },
              ].map(s => (
                <div key={s.label} className="adm-stat">
                  <div className="adm-stat-num" style={{ color: s.color }}>{s.num}</div>
                  <div className="adm-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="adm-filter-row">
              {[
                { key: "pending", label: `⏳ Pending (${counts.pending})` },
                { key: "all",     label: "📋 All Transcribers"            },
              ].map(f => (
                <div key={f.key} className={`adm-filter-btn ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
                  {f.label}
                </div>
              ))}
            </div>

            {/* List */}
            {loading
              ? <div className="adm-loading">Loading transcribers…</div>
              : filtered.length === 0
                ? <div className="adm-empty">{filter === "pending" ? "No pending verification requests 🎉" : "No transcribers found"}</div>
                : filtered.map(t => {
                    const ss = statusStyle[t.verificationStatus] || statusStyle.unverified;
                    return (
                      <div key={t._id} className="adm-card">
                        <div className="adm-card-top">
                          <div className="adm-card-left">
                            <div className="adm-name">
                              {t.name}
                              <span className="adm-status-badge" style={{ background: ss.bg, color: ss.color }}>
                                {t.verificationStatus === "verified"   ? "✓ Verified"    :
                                 t.verificationStatus === "pending"    ? "⏳ Pending"    :
                                 t.verificationStatus === "rejected"   ? "✕ Rejected"   : "○ Unverified"}
                              </span>
                            </div>
                            <div className="adm-meta">
                              <span>✉️ {t.email}</span>
                              {t.age    && <span>🎂 {t.age} yrs</span>}
                              {t.gender && <span>👤 {t.gender}</span>}
                              <span>💼 {t.workExperience || 0} yrs exp</span>
                              <span>✅ {t.completedTasks || 0} tasks</span>
                              <span>⭐ {t.rating?.toFixed(1) || "0.0"} ({t.reviewCount || 0} reviews)</span>
                            </div>
                            {t.bio && <div className="adm-bio">{t.bio}</div>}
                            {(t.skills?.length > 0 || t.languages?.length > 0) && (
                              <div className="adm-skills">
                                {t.skills?.map(s   => <span key={s} className="adm-chip">{s}</span>)}
                                {t.languages?.map(l => <span key={l} className="adm-chip adm-chip-lang">{l}</span>)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="adm-docs">
                          <div className="adm-docs-title">📎 Uploaded Documents</div>
                          {t.verificationDocs?.length > 0
                            ? t.verificationDocs.map((doc, i) => (
                                <a
                                  key={i}
                                  className="adm-doc-link"
                                  href={`http://localhost:5000${doc}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  📄 Document {i + 1} — {doc.split("-").pop()}
                                </a>
                              ))
                            : <div className="adm-no-docs">No documents uploaded yet</div>
                          }
                        </div>

                        {/* Actions */}
                        <div className="adm-actions">
                          {t.verificationStatus === "verified" ? (
                            <>
                              <span className="adm-already" style={{ color: "#4ECDC4" }}>✓ Already Verified</span>
                              <button className="adm-reject-btn" disabled={acting === t._id} onClick={() => decide(t._id, false)}>
                                {acting === t._id ? "…" : "Revoke Verification"}
                              </button>
                            </>
                          ) : t.verificationStatus === "rejected" ? (
                            <>
                              <span className="adm-already" style={{ color: "#FF6B6B" }}>✕ Rejected</span>
                              <button className="adm-approve-btn" disabled={acting === t._id} onClick={() => decide(t._id, true)}>
                                {acting === t._id ? "…" : "✓ Approve Instead"}
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="adm-approve-btn" disabled={acting === t._id || !t.verificationDocs?.length} onClick={() => decide(t._id, true)}>
                                {acting === t._id ? "Processing…" : "✓ Approve & Verify"}
                              </button>
                              <button className="adm-reject-btn" disabled={acting === t._id} onClick={() => decide(t._id, false)}>
                                {acting === t._id ? "…" : "✕ Reject"}
                              </button>
                            </>
                          )}
                        </div>

                        {t.verificationStatus === "pending" && !t.verificationDocs?.length && (
                          <div style={{ fontSize: "0.75rem", color: "var(--coral)", marginTop: "8px" }}>
                            ⚠️ Approve button disabled — no documents uploaded yet
                          </div>
                        )}
                      </div>
                    );
                  })
            }
          </div>
        </div>
      )}
    </>
  );
}