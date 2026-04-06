import { useState, useEffect } from "react";
import axios from "axios";

const LABEL_STYLE = {
  "Perfect Fit": { bg: "rgba(78,205,196,0.18)",  color: "#4ECDC4" },
  "Great Fit":   { bg: "rgba(255,230,109,0.15)", color: "#FFE66D" },
  "Good Fit":    { bg: "rgba(255,107,107,0.13)", color: "#FF9F9F" },
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

export default function AITaskRecommendations({ assistantId, onApply }) {
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [ran,      setRan]      = useState(false);

  const runMatch = async () => {
    setLoading(true); setError(""); setRan(true);
    try {
      const res = await axios.post("http://localhost:5000/ai-match/tasks", { assistantId });
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
        .atr-wrap { margin-bottom: 28px; }

        .atr-trigger-row { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
        .atr-trigger {
          flex: 1; padding: 13px 20px;
          background: linear-gradient(135deg, #7B2FBE, #4ECDC4);
          border: none; border-radius: 13px; cursor: pointer;
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.92rem;
          color: #fff; letter-spacing: 0.01em;
          box-shadow: 0 6px 24px rgba(123,47,190,0.3);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .atr-trigger:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(123,47,190,0.4); }
        .atr-trigger:disabled { opacity: 0.7; cursor: not-allowed; }
        .atr-spinner {
          width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .atr-hint { font-size: 0.75rem; color: #7A9BB5; }

        .atr-header { display: flex; align-items: center; gap: 10px; margin: 20px 0 16px; }
        .atr-header-title {
          font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1rem;
          background: linear-gradient(135deg, #a78bfa, #4ECDC4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          white-space: nowrap;
        }
        .atr-header-line { flex: 1; height: 1px; background: rgba(167,139,250,0.18); }

        .atr-error { color: #FF6B6B; font-size: 0.82rem; margin-top: 10px; }

        .atr-card {
          background: rgba(123,47,190,0.06);
          border: 1px solid rgba(123,47,190,0.22);
          border-radius: 18px; padding: 20px;
          margin-bottom: 12px;
          transition: border-color 0.2s, transform 0.2s;
          animation: atrIn 0.4s ease both;
        }
        .atr-card:nth-child(2) { animation-delay: 0.08s; }
        .atr-card:nth-child(3) { animation-delay: 0.16s; }
        @keyframes atrIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .atr-card:hover { border-color: rgba(167,139,250,0.4); transform: translateY(-2px); }

        .atr-card-top { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 10px; }
        .atr-card-info { flex: 1; min-width: 0; }
        .atr-card-desc { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.92rem; line-height: 1.45; margin-bottom: 6px; }
        .atr-label { padding: 3px 10px; border-radius: 100px; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.04em; display: inline-block; margin-bottom: 4px; }
        .atr-card-meta { font-size: 0.75rem; color: #7A9BB5; display: flex; flex-wrap: wrap; gap: 10px; }

        .atr-reason { font-size: 0.83rem; color: #C4D8E8; line-height: 1.6; margin-bottom: 12px; padding: 10px 13px; background: rgba(255,255,255,0.04); border-radius: 10px; border-left: 3px solid rgba(167,139,250,0.5); }

        .atr-highlights { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .atr-highlight { padding: 4px 11px; border-radius: 100px; background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.25); color: #c4b5fd; font-size: 0.7rem; font-weight: 700; }

        .atr-apply-btn {
          width: 100%; padding: 10px;
          background: linear-gradient(135deg, #7B2FBE, #5a21a0);
          border: none; border-radius: 10px; cursor: pointer;
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.82rem;
          color: #fff; transition: transform 0.15s;
        }
        .atr-apply-btn:hover { transform: scale(1.02); }

        .atr-empty { text-align: center; padding: 32px; color: #7A9BB5; font-size: 0.88rem; }

        /* Profile completeness nudge */
        .atr-nudge { background: rgba(255,230,109,0.07); border: 1px solid rgba(255,230,109,0.18); border-radius: 12px; padding: 12px 16px; font-size: 0.82rem; color: #FFE66D; margin-bottom: 16px; line-height: 1.6; }
      `}</style>

      <div className="atr-wrap">
        <div className="atr-trigger-row">
          <button className="atr-trigger" onClick={runMatch} disabled={loading}>
            {loading
              ? <><div className="atr-spinner" />AI is finding your best tasks…</>
              : <>✨ Find AI-Matched Tasks for Me</>
            }
          </button>
        </div>
        <div className="atr-hint">Based on your skills, languages, and experience</div>

        {error && <div className="atr-error">⚠️ {error}</div>}

        {ran && !loading && results.length > 0 && (
          <>
            <div className="atr-header">
              <div className="atr-header-title">✨ Tasks Matched to Your Profile</div>
              <div className="atr-header-line" />
            </div>

            {results.map((task, i) => {
              const ls = LABEL_STYLE[task.matchLabel] || LABEL_STYLE["Good Fit"];
              return (
                <div key={i} className="atr-card">
                  <div className="atr-card-top">
                    <ScoreRing score={task.matchScore} />
                    <div className="atr-card-info">
                      <div>
                        <span className="atr-label" style={{ background: ls.bg, color: ls.color }}>
                          {task.matchLabel}
                        </span>
                      </div>
                      <div className="atr-card-desc">{task.description}</div>
                      <div className="atr-card-meta">
                        <span>📝 {task.type}</span>
                        <span>🌐 {task.language}</span>
                        {task.deadline && <span>📅 {task.deadline}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="atr-reason">{task.reason}</div>

                  {task.highlights?.length > 0 && (
                    <div className="atr-highlights">
                      {task.highlights.map((h, j) => (
                        <span key={j} className="atr-highlight">✦ {h}</span>
                      ))}
                    </div>
                  )}

                  {onApply && (
                    <button className="atr-apply-btn" onClick={() => onApply(task)}>
                      Apply to This Task →
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}

        {ran && !loading && results.length === 0 && !error && (
          <div className="atr-empty">
            No matching tasks right now.<br />
            Complete your profile with skills & languages to get better matches!
          </div>
        )}
      </div>
    </>
  );
}