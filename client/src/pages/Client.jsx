// import { useEffect, useState } from "react";
// import axios from "axios";
// import VoiceInput from "../components/VoiceInput";

// export default function Client() {
//   const [tasks, setTasks] = useState([]);

//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   const fetchTasks = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/tasks");
//       setTasks(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#06101E] text-white p-6">
      
//       {/* HEADER */}
//       <h1 className="text-3xl font-bold mb-6 text-center">
//         Client Dashboard 👤
//       </h1>

//       {/* 🎤 VOICE INPUT */}
//       <div className="mb-8 bg-white/5 border border-[#4ECDC4]/20 rounded-xl p-4 backdrop-blur">
//         <h2 className="text-xl font-semibold mb-3">
//           Create New Request 🎙️
//         </h2>
//         <VoiceInput />
//       </div>

//       {/* 📊 TASK LIST */}
//       <div>
//         <h2 className="text-xl font-semibold mb-4">
//           Your Requests 📄
//         </h2>

//         {tasks.length === 0 && (
//           <p className="text-gray-400">No tasks yet</p>
//         )}

//         {tasks.map((task) => (
//           <div
//             key={task._id}
//             className="p-4 mb-4 rounded-xl border border-[#4ECDC4]/20 bg-white/5 backdrop-blur"
//           >
//             <p className="text-lg">
//               <strong>Description:</strong> {task.description}
//             </p>

//             <p
//               className={`mt-2 font-semibold ${
//                 task.status === "assigned"
//                   ? "text-green-400"
//                   : "text-yellow-400"
//               }`}
//             >
//               Status: {task.status}
//             </p>

//             <p className="mt-1 text-teal-300">
//               <strong>Assigned To:</strong>{" "}
//               {task.assignedTo ? task.assignedTo.name : "Not Assigned"}
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChatBox from "../components/ChatBox";

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

const TYPES     = ["general", "legal", "medical", "academic", "technical"];
const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Spanish", "French", "Other"];

const STATUS_STYLE = {
  pending:   { bg: "rgba(255,230,109,0.15)", color: "#FFE66D", label: "⏳ Pending" },
  assigned:  { bg: "rgba(78,205,196,0.15)",  color: "#4ECDC4", label: "✅ Assigned" },
  completed: { bg: "rgba(100,220,120,0.15)", color: "#6DFF9A", label: "🎉 Completed" },
};

export default function Client() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab,     setTab]     = useState("request");
  const [tasks,   setTasks]   = useState([]);
  const [matches, setMatches] = useState([]);
  const [taskId,  setTaskId]  = useState(null);
  const [chatTask, setChatTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);

  const [form, setForm] = useState({
    description: "", type: "general", language: "English", deadline: "",
  });

  const [profile, setProfile] = useState({ name: "", bio: "" });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchTasks();
    fetchProfile();
  }, []);

  // Voice recognition
  useEffect(() => {
    if (!SR) return;
    const r = new SR();
    r.continuous = true; r.lang = "en-US"; r.interimResults = false;
    r.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++)
        if (e.results[i].isFinal) t += e.results[i][0].transcript + " ";
      if (t) setForm(f => ({ ...f, description: f.description + t }));
    };
    r.onerror = (e) => { console.error(e.error); setListening(false); };
    r.onend   = () => setListening(false);
    recogRef.current = r;
  }, []);

  const toggleVoice = () => {
    if (!recogRef.current) return alert("Voice not supported in this browser");
    if (listening) { recogRef.current.stop(); setListening(false); }
    else           { recogRef.current.start(); setListening(true); }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/tasks/client/${user._id}`);
      setTasks(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/users/${user._id}`);
      setProfile({ name: res.data.name || "", bio: res.data.bio || "" });
    } catch (err) { console.error(err); }
  };

  const submitTask = async () => {
    if (!form.description.trim()) return alert("Please describe your request");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/create-task", {
        ...form, clientId: user._id, status: "pending",
      });
      setTaskId(res.data._id);
      const matchRes = await axios.post("http://localhost:5000/match", {
        language: form.language, type: form.type,
      });
      setMatches(matchRes.data);
      fetchTasks();
    } catch (err) { alert("Failed to create request"); }
    finally { setLoading(false); }
  };

  const assignAssistant = async (assistantId) => {
    try {
      await axios.post("http://localhost:5000/assign-task", { taskId, assistantId });
      setMatches([]); setTaskId(null);
      setForm({ description: "", type: "general", language: "English", deadline: "" });
      fetchTasks();
    } catch (err) { alert("Assignment failed"); }
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      await axios.put(`http://localhost:5000/users/${user._id}`, profile);
      alert("Profile saved!");
    } catch (err) { alert("Failed to save profile"); }
    finally { setProfileSaving(false); }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg:#06101E; --bg2:#0C1A2E; --teal:#4ECDC4; --coral:#FF6B6B; --sun:#FFE66D; --text:#E8F6FF; --muted:#7A9BB5; --border:rgba(78,205,196,0.18); }

        .cd-root { min-height:100vh; background:var(--bg); color:var(--text); font-family:'Nunito',sans-serif; }

        /* NAV */
        .cd-nav { display:flex; justify-content:space-between; align-items:center; padding:16px 32px; background:rgba(12,26,46,0.9); border-bottom:1px solid var(--border); backdrop-filter:blur(12px); position:sticky; top:0; z-index:50; }
        .cd-logo { font-family:'Sora',sans-serif; font-weight:800; font-size:1.2rem; background:linear-gradient(135deg,var(--teal),var(--sun)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .cd-logo span { font-weight:300; }
        .cd-nav-right { display:flex; align-items:center; gap:16px; }
        .cd-user-badge { display:flex; align-items:center; gap:8px; background:rgba(78,205,196,0.1); border:1px solid var(--border); border-radius:100px; padding:6px 14px; font-size:0.82rem; }
        .cd-avatar { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,var(--teal),var(--sun)); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.7rem; color:#06101E; }
        .cd-logout { background:rgba(255,107,107,0.1); border:1px solid rgba(255,107,107,0.25); color:var(--coral); border-radius:8px; padding:7px 16px; cursor:pointer; font-size:0.82rem; font-weight:700; transition:background 0.2s; }
        .cd-logout:hover { background:rgba(255,107,107,0.2); }

        /* TABS */
        .cd-tabs { display:flex; gap:4px; padding:20px 32px 0; border-bottom:1px solid var(--border); }
        .cd-tab { padding:10px 20px; border-radius:10px 10px 0 0; cursor:pointer; font-family:'Sora',sans-serif; font-weight:600; font-size:0.88rem; color:var(--muted); border:1px solid transparent; border-bottom:none; transition:all 0.2s; }
        .cd-tab.active { background:var(--bg2); color:var(--teal); border-color:var(--border); }
        .cd-tab:hover:not(.active) { color:var(--text); }

        /* CONTENT */
        .cd-content { padding:32px; max-width:860px; margin:0 auto; }

        /* SECTION TITLES */
        .cd-section-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.3rem; letter-spacing:-0.02em; margin-bottom:6px; }
        .cd-section-sub { color:var(--muted); font-size:0.88rem; margin-bottom:24px; }

        /* FORM ELEMENTS */
        .cd-label { display:block; font-size:0.75rem; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
        .cd-textarea, .cd-input, .cd-select {
          width:100%; background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
          border-radius:12px; padding:12px 16px; color:var(--text);
          font-family:'Nunito',sans-serif; font-size:0.92rem; outline:none;
          transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
        }
        .cd-textarea { resize:vertical; min-height:100px; }
        .cd-textarea:focus, .cd-input:focus, .cd-select:focus {
          border-color:var(--teal); background:rgba(78,205,196,0.06);
          box-shadow:0 0 0 3px rgba(78,205,196,0.1);
        }
        .cd-select option { background:#0C1A2E; }
        .cd-input::placeholder, .cd-textarea::placeholder { color:rgba(122,155,181,0.5); }

        /* VOICE BUTTON */
        .cd-voice-row { display:flex; gap:10px; margin-bottom:20px; align-items:center; }
        .cd-voice-btn { display:flex; align-items:center; gap:8px; padding:9px 18px; border-radius:10px; border:none; cursor:pointer; font-family:'Sora',sans-serif; font-weight:700; font-size:0.82rem; transition:all 0.2s; }
        .cd-voice-on  { background:linear-gradient(135deg,var(--coral),#e05555); color:#fff; box-shadow:0 0 0 4px rgba(255,107,107,0.2); }
        .cd-voice-off { background:rgba(78,205,196,0.12); color:var(--teal); border:1px solid var(--border); }
        .cd-voice-pulse { width:8px; height:8px; border-radius:50%; background:currentColor; animation:pulse 1s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.4;transform:scale(1.5);} }

        /* TYPE GRID */
        .cd-type-grid { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
        .cd-type-btn { padding:8px 16px; border-radius:10px; cursor:pointer; font-size:0.82rem; font-weight:600; border:1.5px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:var(--muted); transition:all 0.2s; text-transform:capitalize; }
        .cd-type-btn.active { border-color:var(--teal); background:rgba(78,205,196,0.12); color:var(--teal); }

        /* FORM ROW */
        .cd-form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
        .cd-field { margin-bottom:16px; }

        /* SUBMIT BTN */
        .cd-submit { width:100%; padding:14px; background:linear-gradient(135deg,var(--teal),#2cb5ae); color:#06101E; border:none; border-radius:14px; font-family:'Sora',sans-serif; font-weight:800; font-size:1rem; cursor:pointer; box-shadow:0 6px 24px rgba(78,205,196,0.3); transition:transform 0.2s,box-shadow 0.2s,opacity 0.2s; }
        .cd-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 32px rgba(78,205,196,0.45); }
        .cd-submit:disabled { opacity:0.6; cursor:not-allowed; }

        /* MATCHES */
        .cd-matches { margin-top:28px; }
        .cd-matches-title { font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:var(--teal); margin-bottom:14px; }
        .cd-match-card { background:rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:16px; padding:20px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; gap:16px; }
        .cd-match-info { flex:1; min-width:0; }
        .cd-match-name { font-family:'Sora',sans-serif; font-weight:700; font-size:0.95rem; margin-bottom:4px; }
        .cd-match-meta { font-size:0.78rem; color:var(--muted); }
        .cd-match-score { font-size:0.75rem; color:var(--teal); font-weight:700; margin-top:4px; }
        .cd-assign-btn { background:linear-gradient(135deg,var(--teal),#2cb5ae); color:#06101E; border:none; border-radius:10px; padding:10px 18px; font-family:'Sora',sans-serif; font-weight:700; font-size:0.82rem; cursor:pointer; white-space:nowrap; transition:transform 0.15s; }
        .cd-assign-btn:hover { transform:scale(1.03); }

        /* TASK CARDS */
        .cd-task-card { background:rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:16px; padding:20px; margin-bottom:14px; transition:border-color 0.2s; }
        .cd-task-card:hover { border-color:rgba(78,205,196,0.35); }
        .cd-task-top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:10px; }
        .cd-task-desc { font-weight:600; font-size:0.95rem; flex:1; }
        .cd-badge { padding:4px 12px; border-radius:100px; font-size:0.72rem; font-weight:700; letter-spacing:0.04em; white-space:nowrap; }
        .cd-task-meta { display:flex; flex-wrap:wrap; gap:10px; font-size:0.78rem; color:var(--muted); margin-bottom:12px; }
        .cd-task-meta span { display:flex; align-items:center; gap:4px; }
        .cd-assigned-to { font-size:0.82rem; color:var(--teal); font-weight:600; margin-bottom:12px; }
        .cd-chat-btn { background:rgba(78,205,196,0.12); border:1px solid var(--border); color:var(--teal); border-radius:8px; padding:8px 16px; cursor:pointer; font-family:'Sora',sans-serif; font-weight:700; font-size:0.8rem; transition:background 0.2s; }
        .cd-chat-btn:hover { background:rgba(78,205,196,0.22); }
        .cd-empty { text-align:center; padding:48px 0; color:var(--muted); font-size:0.9rem; }

        /* PROFILE */
        .cd-profile-card { background:rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:20px; padding:32px; }

        @media(max-width:640px) {
          .cd-nav { padding:14px 20px; }
          .cd-tabs { padding:16px 20px 0; }
          .cd-content { padding:20px; }
          .cd-form-row { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="cd-root">
        {/* ── NAVBAR ── */}
        <nav className="cd-nav">
          <div className="cd-logo">Scribe<span>Connect</span></div>
          <div className="cd-nav-right">
            <div className="cd-user-badge">
              <div className="cd-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <span>{user?.name}</span>
              <span style={{ color: "var(--teal)", fontSize: "0.72rem", fontWeight: 700 }}>CLIENT</span>
            </div>
            <button className="cd-logout" onClick={handleLogout}>Log Out</button>
          </div>
        </nav>

        {/* ── TABS ── */}
        <div className="cd-tabs">
          {[
            { key: "request",  label: "🎙️ New Request" },
            { key: "requests", label: "📋 My Requests" },
            { key: "profile",  label: "👤 Profile" },
          ].map(t => (
            <div key={t.key} className={`cd-tab ${tab === t.key ? "active" : ""}`} onClick={() => { setTab(t.key); if (t.key === "requests") fetchTasks(); }}>
              {t.label}
            </div>
          ))}
        </div>

        <div className="cd-content">

          {/* ══ TAB: NEW REQUEST ══ */}
          {tab === "request" && (
            <div>
              <div className="cd-section-title">Create a New Request</div>
              <div className="cd-section-sub">Describe what you need — speak or type</div>

              {/* Description + Voice */}
              <div className="cd-field">
                <label className="cd-label">Describe your request</label>
                <div className="cd-voice-row">
                  <button className={`cd-voice-btn ${listening ? "cd-voice-on" : "cd-voice-off"}`} onClick={toggleVoice}>
                    {listening ? <><div className="cd-voice-pulse" /> Stop Listening</> : <>🎤 Speak</>}
                  </button>
                  {listening && <span style={{ fontSize: "0.78rem", color: "var(--coral)" }}>Listening…</span>}
                </div>
                <textarea
                  className="cd-textarea"
                  placeholder="e.g. I need a 30-minute legal hearing transcribed in English by Friday…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Type */}
              <div className="cd-field">
                <label className="cd-label">Transcription Type</label>
                <div className="cd-type-grid">
                  {TYPES.map(t => (
                    <div key={t} className={`cd-type-btn ${form.type === t ? "active" : ""}`} onClick={() => setForm({ ...form, type: t })}>
                      {t === "general" ? "📝" : t === "legal" ? "⚖️" : t === "medical" ? "🏥" : t === "academic" ? "🎓" : "💻"} {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Language + Deadline */}
              <div className="cd-form-row">
                <div>
                  <label className="cd-label">Language</label>
                  <select className="cd-select" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="cd-label">Deadline</label>
                  <input type="date" className="cd-input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
              </div>

              <button className="cd-submit" onClick={submitTask} disabled={loading}>
                {loading ? "Finding Matches…" : "🚀 Submit & Find Assistants"}
              </button>

              {/* Matched Assistants */}
              {matches.length > 0 && (
                <div className="cd-matches">
                  <div className="cd-matches-title">✨ AI-Matched Assistants — select one to assign</div>
                  {matches.map((a, i) => (
                    <div key={i} className="cd-match-card">
                      <div className="cd-match-info">
                        <div className="cd-match-name">{a.name}</div>
                        <div className="cd-match-meta">
                          ⭐ {a.rating.toFixed(1)} · {a.skills?.join(", ") || "General"} · {a.languages?.join(", ") || "English"}
                        </div>
                        <div className="cd-match-score">Match score: {(a.score * 100).toFixed(0)}%</div>
                        {a.bio && <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px" }}>{a.bio}</div>}
                      </div>
                      <button className="cd-assign-btn" onClick={() => assignAssistant(a._id)}>
                        Assign →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: MY REQUESTS ══ */}
          {tab === "requests" && (
            <div>
              <div className="cd-section-title">My Requests</div>
              <div className="cd-section-sub">Track all your transcription requests</div>

              {tasks.length === 0 ? (
                <div className="cd-empty">No requests yet.<br />Go to <strong>New Request</strong> to get started 🚀</div>
              ) : tasks.map((task) => {
                const s = STATUS_STYLE[task.status] || STATUS_STYLE.pending;
                return (
                  <div key={task._id} className="cd-task-card">
                    <div className="cd-task-top">
                      <div className="cd-task-desc">{task.description}</div>
                      <span className="cd-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    <div className="cd-task-meta">
                      <span>📝 {task.type}</span>
                      <span>🌐 {task.language}</span>
                      {task.deadline && <span>📅 {task.deadline}</span>}
                    </div>
                    {task.assignedTo ? (
                      <div className="cd-assigned-to">✍️ Assigned to: <strong>{task.assignedTo.name}</strong></div>
                    ) : (
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "12px" }}>Not yet assigned</div>
                    )}
                    {task.assignedTo && (
                      <button className="cd-chat-btn" onClick={() => setChatTask(task)}>
                        💬 Chat with {task.assignedTo.name}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ══ TAB: PROFILE ══ */}
          {tab === "profile" && (
            <div>
              <div className="cd-section-title">My Profile</div>
              <div className="cd-section-sub">How transcribers will see you</div>
              <div className="cd-profile-card">
                <div className="cd-field">
                  <label className="cd-label">Full Name</label>
                  <input className="cd-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" />
                </div>
                <div className="cd-field">
                  <label className="cd-label">Email</label>
                  <input className="cd-input" value={user?.email} disabled style={{ opacity: 0.5 }} />
                </div>
                <div className="cd-field">
                  <label className="cd-label">About You</label>
                  <textarea className="cd-textarea" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell transcribers about your needs or context…" />
                </div>
                <button className="cd-submit" onClick={saveProfile} disabled={profileSaving}>
                  {profileSaving ? "Saving…" : "💾 Save Profile"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CHAT MODAL ── */}
      {chatTask && (
        <ChatBox task={chatTask} currentUser={user} onClose={() => setChatTask(null)} />
      )}
    </>
  );
}