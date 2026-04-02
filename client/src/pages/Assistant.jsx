// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function Assistant() {
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
//       <h1 className="text-3xl font-bold mb-6 text-center">
//         Assistant Dashboard 🧠
//       </h1>

//       {tasks.map((task) => (
//         <div key={task._id}>
//           {task.description}
//         </div>
//       ))}
//     </div>
//   );
// }








import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChatBox from "../components/ChatBox";

const SKILLS    = ["general", "legal", "medical", "academic", "technical"];
const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Spanish", "French", "Other"];

const STATUS_STYLE = {
  pending:   { bg: "rgba(255,230,109,0.15)", color: "#FFE66D", label: "⏳ Pending" },
  assigned:  { bg: "rgba(78,205,196,0.15)",  color: "#4ECDC4", label: "✅ Assigned" },
  completed: { bg: "rgba(100,220,120,0.15)", color: "#6DFF9A", label: "🎉 Completed" },
};

export default function Assistant() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab,         setTab]         = useState("browse");
  const [pending,     setPending]     = useState([]);
  const [myTasks,     setMyTasks]     = useState([]);
  const [chatTask,    setChatTask]    = useState(null);
  const [accepting,   setAccepting]   = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: "", bio: "", skills: [], languages: [],
  });
  const [skillInput,    setSkillInput]    = useState("");
  const [langInput,     setLangInput]     = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchPending();
    fetchMyTasks();
    fetchProfile();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get("http://localhost:5000/tasks/pending");
      setPending(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMyTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/tasks/assistant/${user._id}`);
      setMyTasks(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/users/${user._id}`);
      setProfile({
        name:      res.data.name      || "",
        bio:       res.data.bio       || "",
        skills:    res.data.skills    || [],
        languages: res.data.languages || [],
      });
      setSkillInput((res.data.skills    || []).join(", "));
      setLangInput( (res.data.languages || []).join(", "));
    } catch (err) { console.error(err); }
  };

  const acceptTask = async (taskId) => {
    setAccepting(taskId);
    try {
      await axios.patch(`http://localhost:5000/tasks/${taskId}/accept`, { assistantId: user._id });
      fetchPending();
      fetchMyTasks();
    } catch (err) { alert("Failed to accept task"); }
    finally { setAccepting(null); }
  };

  const markComplete = async (taskId) => {
    try {
      await axios.patch(`http://localhost:5000/tasks/${taskId}/complete`);
      fetchMyTasks();
    } catch (err) { alert("Failed to mark complete"); }
  };

  const saveProfile = async () => {
    const updatedSkills    = skillInput.split(",").map(s => s.trim()).filter(Boolean);
    const updatedLanguages = langInput.split(",").map(s => s.trim()).filter(Boolean);
    setProfileSaving(true);
    try {
      await axios.put(`http://localhost:5000/users/${user._id}`, {
        name:      profile.name,
        bio:       profile.bio,
        skills:    updatedSkills,
        languages: updatedLanguages,
      });
      setProfile(p => ({ ...p, skills: updatedSkills, languages: updatedLanguages }));
      alert("Profile saved! You'll now appear in smart matches.");
    } catch (err) { alert("Failed to save profile"); }
    finally { setProfileSaving(false); }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --bg:#06101E; --bg2:#0C1A2E; --teal:#4ECDC4; --coral:#FF6B6B; --sun:#FFE66D; --text:#E8F6FF; --muted:#7A9BB5; --border:rgba(78,205,196,0.18); }

        .ad-root { min-height:100vh; background:var(--bg); color:var(--text); font-family:'Nunito',sans-serif; }

        .ad-nav { display:flex; justify-content:space-between; align-items:center; padding:16px 32px; background:rgba(12,26,46,0.9); border-bottom:1px solid var(--border); backdrop-filter:blur(12px); position:sticky; top:0; z-index:50; }
        .ad-logo { font-family:'Sora',sans-serif; font-weight:800; font-size:1.2rem; background:linear-gradient(135deg,var(--teal),var(--sun)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .ad-logo span { font-weight:300; }
        .ad-nav-right { display:flex; align-items:center; gap:14px; }
        .ad-user-badge { display:flex; align-items:center; gap:8px; background:rgba(255,107,107,0.1); border:1px solid rgba(255,107,107,0.22); border-radius:100px; padding:6px 14px; font-size:0.82rem; }
        .ad-avatar { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,var(--coral),var(--sun)); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.7rem; color:#06101E; }
        .ad-role-tag { color:var(--coral); font-size:0.72rem; font-weight:700; }
        .ad-logout { background:rgba(255,107,107,0.1); border:1px solid rgba(255,107,107,0.25); color:var(--coral); border-radius:8px; padding:7px 16px; cursor:pointer; font-size:0.82rem; font-weight:700; transition:background 0.2s; }
        .ad-logout:hover { background:rgba(255,107,107,0.2); }

        .ad-tabs { display:flex; gap:4px; padding:20px 32px 0; border-bottom:1px solid var(--border); }
        .ad-tab { padding:10px 20px; border-radius:10px 10px 0 0; cursor:pointer; font-family:'Sora',sans-serif; font-weight:600; font-size:0.88rem; color:var(--muted); border:1px solid transparent; border-bottom:none; transition:all 0.2s; }
        .ad-tab.active { background:var(--bg2); color:var(--coral); border-color:rgba(255,107,107,0.22); }
        .ad-tab:hover:not(.active) { color:var(--text); }

        .ad-content { padding:32px; max-width:860px; margin:0 auto; }
        .ad-section-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.3rem; letter-spacing:-0.02em; margin-bottom:6px; }
        .ad-section-sub { color:var(--muted); font-size:0.88rem; margin-bottom:24px; }

        /* TASK CARDS */
        .ad-task-card { background:rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:16px; padding:20px; margin-bottom:14px; transition:border-color 0.2s; }
        .ad-task-card:hover { border-color:rgba(78,205,196,0.3); }
        .ad-task-top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:10px; }
        .ad-task-desc { font-weight:600; font-size:0.95rem; flex:1; line-height:1.5; }
        .ad-badge { padding:4px 12px; border-radius:100px; font-size:0.72rem; font-weight:700; white-space:nowrap; }
        .ad-task-meta { display:flex; flex-wrap:wrap; gap:10px; font-size:0.78rem; color:var(--muted); margin-bottom:14px; }
        .ad-task-meta span { display:flex; align-items:center; gap:4px; }
        .ad-actions { display:flex; gap:10px; flex-wrap:wrap; }
        .ad-accept-btn { background:linear-gradient(135deg,var(--teal),#2cb5ae); color:#06101E; border:none; border-radius:10px; padding:10px 20px; font-family:'Sora',sans-serif; font-weight:700; font-size:0.82rem; cursor:pointer; transition:transform 0.15s,opacity 0.2s; }
        .ad-accept-btn:hover:not(:disabled) { transform:scale(1.03); }
        .ad-accept-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .ad-chat-btn { background:rgba(78,205,196,0.12); border:1px solid var(--border); color:var(--teal); border-radius:10px; padding:10px 18px; cursor:pointer; font-family:'Sora',sans-serif; font-weight:700; font-size:0.82rem; transition:background 0.2s; }
        .ad-chat-btn:hover { background:rgba(78,205,196,0.22); }
        .ad-complete-btn { background:rgba(100,220,120,0.12); border:1px solid rgba(100,220,120,0.25); color:#6DFF9A; border-radius:10px; padding:10px 18px; cursor:pointer; font-family:'Sora',sans-serif; font-weight:700; font-size:0.82rem; transition:background 0.2s; }
        .ad-complete-btn:hover { background:rgba(100,220,120,0.22); }
        .ad-empty { text-align:center; padding:48px 0; color:var(--muted); font-size:0.9rem; }

        /* PROFILE */
        .ad-profile-card { background:rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:20px; padding:32px; }
        .ad-label { display:block; font-size:0.75rem; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
        .ad-input, .ad-textarea { width:100%; background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px 16px; color:var(--text); font-family:'Nunito',sans-serif; font-size:0.92rem; outline:none; transition:border-color 0.2s,background 0.2s,box-shadow 0.2s; }
        .ad-textarea { resize:vertical; min-height:90px; }
        .ad-input:focus, .ad-textarea:focus { border-color:var(--teal); background:rgba(78,205,196,0.06); box-shadow:0 0 0 3px rgba(78,205,196,0.1); }
        .ad-input::placeholder, .ad-textarea::placeholder { color:rgba(122,155,181,0.5); }
        .ad-field { margin-bottom:18px; }
        .ad-hint { font-size:0.73rem; color:var(--muted); margin-top:4px; }

        /* SKILL CHIPS */
        .ad-chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
        .ad-chip { padding:4px 12px; border-radius:100px; background:rgba(78,205,196,0.12); border:1px solid var(--border); color:var(--teal); font-size:0.75rem; font-weight:700; }
        .ad-chip-lang { background:rgba(255,107,107,0.1); border-color:rgba(255,107,107,0.22); color:var(--coral); }

        .ad-submit { width:100%; padding:14px; background:linear-gradient(135deg,var(--teal),#2cb5ae); color:#06101E; border:none; border-radius:14px; font-family:'Sora',sans-serif; font-weight:800; font-size:1rem; cursor:pointer; box-shadow:0 6px 24px rgba(78,205,196,0.3); transition:transform 0.2s,opacity 0.2s; }
        .ad-submit:hover:not(:disabled) { transform:translateY(-2px); }
        .ad-submit:disabled { opacity:0.6; cursor:not-allowed; }

        /* STATS ROW */
        .ad-stats { display:flex; gap:12px; margin-bottom:24px; flex-wrap:wrap; }
        .ad-stat { flex:1; min-width:120px; background:rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:14px; padding:16px; text-align:center; }
        .ad-stat-num { font-family:'Sora',sans-serif; font-weight:800; font-size:1.6rem; background:linear-gradient(135deg,var(--teal),var(--sun)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .ad-stat-label { font-size:0.72rem; color:var(--muted); margin-top:2px; text-transform:uppercase; letter-spacing:0.05em; }

        .ad-warning { background:rgba(255,230,109,0.08); border:1px solid rgba(255,230,109,0.2); border-radius:12px; padding:14px 18px; font-size:0.85rem; color:var(--sun); margin-bottom:20px; }

        @media(max-width:640px) {
          .ad-nav { padding:14px 20px; }
          .ad-tabs { padding:16px 20px 0; overflow-x:auto; }
          .ad-content { padding:20px; }
        }
      `}</style>

      <div className="ad-root">
        {/* ── NAVBAR ── */}
        <nav className="ad-nav">
          <div className="ad-logo">Scribe<span>Connect</span></div>
          <div className="ad-nav-right">
            <div className="ad-user-badge">
              <div className="ad-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <span>{user?.name}</span>
              <span className="ad-role-tag">TRANSCRIBER</span>
            </div>
            <button className="ad-logout" onClick={handleLogout}>Log Out</button>
          </div>
        </nav>

        {/* ── TABS ── */}
        <div className="ad-tabs">
          {[
            { key: "browse",   label: "🔍 Browse Tasks" },
            { key: "mywork",   label: "📌 My Assignments" },
            { key: "profile",  label: "👤 Profile" },
          ].map(t => (
            <div key={t.key} className={`ad-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => { setTab(t.key); if (t.key === "browse") fetchPending(); if (t.key === "mywork") fetchMyTasks(); }}>
              {t.label}
            </div>
          ))}
        </div>

        <div className="ad-content">

          {/* ══ TAB: BROWSE TASKS ══ */}
          {tab === "browse" && (
            <div>
              <div className="ad-section-title">Available Requests</div>
              <div className="ad-section-sub">Open transcription requests from clients — accept one to get started</div>

              {!profile.skills?.length && !profile.languages?.length && (
                <div className="ad-warning">
                  ⚠️ Your profile has no skills or languages set. Set them in <strong>Profile</strong> so you appear in smart matches!
                </div>
              )}

              {pending.length === 0 ? (
                <div className="ad-empty">No open requests right now.<br />Check back soon! 👀</div>
              ) : pending.map((task) => (
                <div key={task._id} className="ad-task-card">
                  <div className="ad-task-top">
                    <div className="ad-task-desc">{task.description}</div>
                    <span className="ad-badge" style={{ background: "rgba(255,230,109,0.15)", color: "#FFE66D" }}>⏳ Open</span>
                  </div>
                  <div className="ad-task-meta">
                    <span>📝 {task.type}</span>
                    <span>🌐 {task.language}</span>
                    {task.deadline && <span>📅 Due: {task.deadline}</span>}
                  </div>
                  <div className="ad-actions">
                    <button
                      className="ad-accept-btn"
                      disabled={accepting === task._id}
                      onClick={() => acceptTask(task._id)}
                    >
                      {accepting === task._id ? "Accepting…" : "✅ Accept Task"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ TAB: MY ASSIGNMENTS ══ */}
          {tab === "mywork" && (
            <div>
              <div className="ad-section-title">My Assignments</div>
              <div className="ad-section-sub">Tasks you've been assigned or accepted</div>

              {/* Stats row */}
              <div className="ad-stats">
                <div className="ad-stat">
                  <div className="ad-stat-num">{myTasks.length}</div>
                  <div className="ad-stat-label">Total</div>
                </div>
                <div className="ad-stat">
                  <div className="ad-stat-num">{myTasks.filter(t => t.status === "assigned").length}</div>
                  <div className="ad-stat-label">In Progress</div>
                </div>
                <div className="ad-stat">
                  <div className="ad-stat-num">{myTasks.filter(t => t.status === "completed").length}</div>
                  <div className="ad-stat-label">Completed</div>
                </div>
              </div>

              {myTasks.length === 0 ? (
                <div className="ad-empty">No assignments yet.<br />Browse open tasks and accept one! 🚀</div>
              ) : myTasks.map((task) => {
                const s = STATUS_STYLE[task.status] || STATUS_STYLE.assigned;
                return (
                  <div key={task._id} className="ad-task-card">
                    <div className="ad-task-top">
                      <div className="ad-task-desc">{task.description}</div>
                      <span className="ad-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    <div className="ad-task-meta">
                      <span>📝 {task.type}</span>
                      <span>🌐 {task.language}</span>
                      {task.deadline && <span>📅 Due: {task.deadline}</span>}
                    </div>
                    <div className="ad-actions">
                      <button className="ad-chat-btn" onClick={() => setChatTask(task)}>
                        💬 Chat with Client
                      </button>
                      {task.status === "assigned" && (
                        <button className="ad-complete-btn" onClick={() => markComplete(task._id)}>
                          🎉 Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══ TAB: PROFILE ══ */}
          {tab === "profile" && (
            <div>
              <div className="ad-section-title">My Transcriber Profile</div>
              <div className="ad-section-sub">A complete profile gets you matched with more clients</div>
              <div className="ad-profile-card">
                <div className="ad-field">
                  <label className="ad-label">Full Name</label>
                  <input className="ad-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Email</label>
                  <input className="ad-input" value={user?.email} disabled style={{ opacity: 0.5 }} />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Bio</label>
                  <textarea className="ad-textarea" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="e.g. 5 years of medical transcription experience, specializing in cardiology reports…" />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Skills / Specializations</label>
                  <input className="ad-input" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="e.g. legal, medical, academic" />
                  <div className="ad-hint">Comma-separated. These determine your smart match score.</div>
                  {skillInput && (
                    <div className="ad-chips">
                      {skillInput.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
                        <span key={i} className="ad-chip">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="ad-field">
                  <label className="ad-label">Languages</label>
                  <input className="ad-input" value={langInput} onChange={(e) => setLangInput(e.target.value)} placeholder="e.g. English, Hindi, Telugu" />
                  <div className="ad-hint">Comma-separated. Match clients who need your language.</div>
                  {langInput && (
                    <div className="ad-chips">
                      {langInput.split(",").map(l => l.trim()).filter(Boolean).map((l, i) => (
                        <span key={i} className="ad-chip ad-chip-lang">{l}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button className="ad-submit" onClick={saveProfile} disabled={profileSaving}>
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