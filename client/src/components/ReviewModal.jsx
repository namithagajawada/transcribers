import { useState } from "react";
import axios from "axios";

export default function ReviewModal({ task, currentUser, onClose, onSubmitted }) {
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [comment,   setComment]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState("");

  const submit = async () => {
    if (rating === 0) return setError("Please select a star rating");
    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/reviews", {
        taskId:      task._id,
        clientId:    currentUser._id,
        assistantId: task.assignedTo?._id || task.assignedTo,
        clientName:  currentUser.name,
        rating,
        comment,
      });
      onSubmitted?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  return (
    <>
      <style>{`
        .rv-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(6,16,30,0.8); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px; animation: rvFade 0.2s ease;
        }
        @keyframes rvFade { from{opacity:0;} to{opacity:1;} }
        .rv-modal {
          width: 100%; max-width: 440px;
          background: #0C1A2E; border: 1px solid rgba(78,205,196,0.22);
          border-radius: 24px; padding: 36px 32px;
          animation: rvUp 0.25s ease;
        }
        @keyframes rvUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        .rv-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.3rem; letter-spacing:-0.02em; margin-bottom:6px; color:#E8F6FF; }
        .rv-sub { color:#7A9BB5; font-size:0.85rem; margin-bottom:24px; line-height:1.5; }
        .rv-stars { display:flex; gap:6px; justify-content:center; margin-bottom:10px; }
        .rv-star { font-size:2.2rem; cursor:pointer; transition:transform 0.1s; user-select:none; }
        .rv-star:hover { transform:scale(1.15); }
        .rv-star-label { text-align:center; font-family:'Sora',sans-serif; font-weight:700; font-size:0.9rem; color:#4ECDC4; height:20px; margin-bottom:20px; }
        .rv-label { display:block; font-size:0.75rem; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; color:#7A9BB5; margin-bottom:6px; }
        .rv-textarea { width:100%; background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px 16px; color:#E8F6FF; font-family:'Nunito',sans-serif; font-size:0.9rem; resize:vertical; min-height:90px; outline:none; transition:border-color 0.2s; }
        .rv-textarea:focus { border-color:#4ECDC4; }
        .rv-textarea::placeholder { color:rgba(122,155,181,0.5); }
        .rv-error { background:rgba(255,107,107,0.1); border:1px solid rgba(255,107,107,0.25); border-radius:10px; padding:10px 14px; font-size:0.82rem; color:#FF6B6B; margin:12px 0; }
        .rv-actions { display:flex; gap:10px; margin-top:20px; }
        .rv-submit { flex:1; padding:13px; background:linear-gradient(135deg,#4ECDC4,#2cb5ae); color:#06101E; border:none; border-radius:12px; font-family:'Sora',sans-serif; font-weight:800; font-size:0.95rem; cursor:pointer; transition:transform 0.2s,opacity 0.2s; }
        .rv-submit:hover:not(:disabled) { transform:translateY(-2px); }
        .rv-submit:disabled { opacity:0.6; cursor:not-allowed; }
        .rv-cancel { padding:13px 20px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#7A9BB5; cursor:pointer; font-weight:600; font-size:0.9rem; transition:background 0.2s; }
        .rv-cancel:hover { background:rgba(255,255,255,0.08); }
      `}</style>

      <div className="rv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="rv-modal">
          <div className="rv-title">Leave a Review ⭐</div>
          <div className="rv-sub">
            How was your experience with <strong style={{ color: "#E8F6FF" }}>{task.assignedTo?.name}</strong>?<br />
            Your review helps other clients make better decisions.
          </div>

          {/* Stars */}
          <div className="rv-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className="rv-star"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
              >
                {s <= (hovered || rating) ? "⭐" : "☆"}
              </div>
            ))}
          </div>
          <div className="rv-star-label">{labels[hovered || rating]}</div>

          <label className="rv-label">Your comments (optional)</label>
          <textarea
            className="rv-textarea"
            placeholder="e.g. Great accuracy, delivered ahead of schedule, very professional…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {error && <div className="rv-error">⚠️ {error}</div>}

          <div className="rv-actions">
            <button className="rv-cancel" onClick={onClose}>Cancel</button>
            <button className="rv-submit" onClick={submit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Review →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}