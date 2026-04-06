import { useState } from "react";
import axios from "axios";

const LABEL_STYLE = {
  "Perfect Match": { bg: "rgba(78,205,196,0.18)",  color: "#4ECDC4", dot: "#4ECDC4" },
  "Strong Match":  { bg: "rgba(255,230,109,0.15)", color: "#FFE66D", dot: "#FFE66D" },
  "Good Match":    { bg: "rgba(255,107,107,0.13)", color: "#FF9F9F", dot: "#FF9F9F" },
};

function ScoreRing({ score }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#4ECDC4" : score >= 60 ? "#FFE66D" : "#FF9F9F";
  return (
    <svg width="56" height="56" style={{ flexShrink: 0 }}>
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 28 28)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="28" y="33" textAnchor="middle" fontSize="12" fontWeight="800"
        fill={color} fontFamily="Sora, sans-serif">{score}</text>
    </svg>
  );
}

export default function AIMatchPanel({ taskDescription, taskType, language, onSelectTranscriber }) {
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [ran,      setRan]      = useState(false);

  const runMatch = async () => {
    if (!taskDescription?.trim()) return setError("Please describe your request first");
    setLoading(true); setError(""); setRan(true);
    try {
      const res = await axios.post("http://localhost:5000/ai-match/transcribers", {
        taskDescription, taskType, language,
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "AI matching failed. Make sure ANTHROPIC_API_KEY is set.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .amp-wrap { margin-top: 24px; }
        .amp-trigger {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #7B2FBE, #4ECDC4);
          border: none; border-radius: 13px; cursor: pointer;
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.95rem;
          color: #fff; letter-spacing: 0.01em;
          box-shadow: 0 6px 24px rgba(123,47,190,0.35);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .amp-trigger:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(123,47,190,0.45); }
        .amp-trigger:disabled { opacity: 0.7; cursor: not-allowed; }
        .amp-spinner {
          width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .amp-header {
          display: flex; align-items: center; gap: 10px;
          margin: 22px 0 16px;
        }
        .amp-header-title {
          font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1rem;
          background: linear-gradient(135deg, #a78bfa, #4ECDC4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .amp-header-line { flex: 1; height: 1px; background: rgba(167,139,250,0.2); }

        .amp-error { color: #FF6B6B; font-size: 0.82rem; margin-top: 10px; }

        .amp-card {
          background: rgba(123,47,190,0.06);
          border: 1px solid rgba(123,47,190,0.22);
          border-radius: 18px; padding: 20px;
          margin-bottom: 12px;
          transition: border-color 0.2s, transform 0.2s;
          animation: ampIn 0.4s ease both;
        }
        .amp-card:nth-child(2) { animation-delay: 0.08s; }
        .amp-card:nth-child(3) { animation-delay: 0.16s; }
        @keyframes ampIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .amp-card:hover { border-color: rgba(167,139,250,0.45); transform: translateY(-2px); }

        .amp-card-top { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 12px; }
        .amp-card-info { flex: 1; min-width: 0; }
        .amp-card-name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .amp-label { padding: 3px 10px; border-radius: 100px; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.04em; }
        .amp-verified { background: rgba(78,205,196,0.15); color: #4ECDC4; border: 1px solid rgba(78,205,196,0.3); padding: 2px 8px; border-radius: 100px; font-size: 0.65rem; font-weight: 700; }
        .amp-card-meta { font-size: 0.75rem; color: #7A9BB5; }

        .amp-reason { font-size: 0.83rem; color: #C4D8E8; line-height: 1.6; margin-bottom: 12px; padding: 10px 13px; background: rgba(255,255,255,0.04); border-radius: 10px; border-left: 3px solid rgba(167,139,250,0.5); }

        .amp-strengths { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .amp-strength { padding: 4px 11px; border-radius: 100px; background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.25); color: #c4b5fd; font-size: 0.7rem; font-weight: 700; }

        .amp-select-btn {
          width: 100%; padding: 10px;
          background: linear-gradient(135deg, #7B2FBE, #5a21a0);
          border: none; border-radius: 10px; cursor: pointer;
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.82rem;
          color: #fff; transition: transform 0.15s, opacity 0.2s;
        }
        .amp-select-btn:hover { transform: scale(1.02); }

        .amp-empty { text-align: center; padding: 32px; color: #7A9BB5; font-size: 0.88rem; }
      `}</style>

      <div className="amp-wrap">
        <button className="amp-trigger" onClick={runMatch} disabled={loading}>
          {loading
            ? <><div className="amp-spinner" /> AI is finding your best matches…</>
            : <>✨ Get AI-Powered Recommendations</>
          }
        </button>

        {error && <div className="amp-error">⚠️ {error}</div>}

        {ran && !loading && results.length > 0 && (
          <>
            <div className="amp-header">
              <div className="amp-header-title">✨ AI Recommended Transcribers</div>
              <div className="amp-header-line" />
            </div>

            {results.map((t, i) => {
              const ls = LABEL_STYLE[t.matchLabel] || LABEL_STYLE["Good Match"];
              return (
                <div key={i} className="amp-card">
                  <div className="amp-card-top">
                    <ScoreRing score={t.matchScore} />
                    <div className="amp-card-info">
                      <div className="amp-card-name">
                        {t.name}
                        <span className="amp-label" style={{ background: ls.bg, color: ls.color }}>
                          {t.matchLabel}
                        </span>
                        {t.isVerified && <span className="amp-verified">✓ Verified</span>}
                      </div>
                      <div className="amp-card-meta">
                        ⭐ {t.rating?.toFixed(1) || "0.0"} · {t.completedTasks || 0} tasks · {t.workExperience || 0}yr exp
                        {t.skills?.length > 0 && ` · ${t.skills.slice(0,2).join(", ")}`}
                      </div>
                    </div>
                  </div>

                  <div className="amp-reason">{t.reason}</div>

                  {t.strengths?.length > 0 && (
                    <div className="amp-strengths">
                      {t.strengths.map((s, j) => (
                        <span key={j} className="amp-strength">✦ {s}</span>
                      ))}
                    </div>
                  )}

                  {onSelectTranscriber && (
                    <button className="amp-select-btn" onClick={() => onSelectTranscriber(t)}>
                      View Profile & Apply →
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}

        {ran && !loading && results.length === 0 && !error && (
          <div className="amp-empty">No strong matches found yet. More transcribers will join soon!</div>
        )}
      </div>
    </>
  );
}