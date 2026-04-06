import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChatBox from "../components/ChatBox";
import NotificationBell from "../components/NotificationBell";
import ReviewModal from "../components/ReviewModal";

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const TYPES     = ["general", "legal", "medical", "academic", "technical"];
const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Spanish", "French", "Other"];
const STATUS_STYLE = {
  pending:   { bg: "rgba(255,230,109,0.15)", color: "#FFE66D", label: "⏳ Pending"   },
  assigned:  { bg: "rgba(78,205,196,0.15)",  color: "#4ECDC4", label: "✅ Assigned"  },
  completed: { bg: "rgba(109,255,154,0.15)", color: "#6DFF9A", label: "🎉 Completed" },
};

function StarDisplay({ rating, size = "0.85rem" }) {
  return (
    <span style={{ fontSize: size }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating) ? "#FFE66D" : "rgba(255,255,255,0.2)" }}>★</span>
      ))}
      <span style={{ color: "#7A9BB5", marginLeft: "4px", fontSize: "0.78rem" }}>{rating?.toFixed(1)}</span>
    </span>
  );
}

function VerifiedBadge({ status }) {
  if (status === "verified")  return <span style={{ background:"rgba(78,205,196,0.15)", color:"#4ECDC4", border:"1px solid rgba(78,205,196,0.3)", borderRadius:"100px", padding:"2px 9px", fontSize:"0.68rem", fontWeight:700 }}>✓ Verified</span>;
  if (status === "pending")   return <span style={{ background:"rgba(255,230,109,0.12)", color:"#FFE66D", border:"1px solid rgba(255,230,109,0.25)", borderRadius:"100px", padding:"2px 9px", fontSize:"0.68rem", fontWeight:700 }}>⏳ Pending</span>;
  return null;
}

export default function Client() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab,           setTab]           = useState("request");
  const [tasks,         setTasks]         = useState([]);
  const [applications,  setApplications]  = useState({});  // taskId → [apps]
  const [chatTask,      setChatTask]      = useState(null);
  const [reviewTask,    setReviewTask]    = useState(null);
  const [reviewedTasks, setReviewedTasks] = useState(new Set());
  const [loading,       setLoading]       = useState(false);
  const [listening,     setListening]     = useState(false);
  const [transcribers,  setTranscribers]  = useState([]);
  const [viewProfile,   setViewProfile]   = useState(null);  // transcriber profile modal
  const [profileReviews, setProfileReviews] = useState([]);
  const [tSearch,       setTSearch]       = useState("");
  const [tSkill,        setTSkill]        = useState("");
  const recogRef = useRef(null);

  const [form, setForm] = useState({ description: "", type: "general", language: "English", deadline: "" });
  const [profile, setProfile] = useState({ name: "", bio: "", gender: "", age: "" });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchTasks(); fetchProfile();
  }, []);

  useEffect(() => {
    if (!SR) return;
    const r = new SR();
    r.continuous = true; r.lang = "en-US"; r.interimResults = false;
    r.onresult = (e) => { let t = ""; for (let i = 0; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript + " "; if (t) setForm(f => ({ ...f, description: f.description + t })); };
    r.onerror = () => setListening(false);
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
      // Check which completed tasks are already reviewed
      const reviewed = new Set();
      for (const t of res.data) {
        if (t.status === "completed") {
          try {
            const rv = await axios.get(`http://localhost:5000/reviews/transcriber/${t.assignedTo?._id || t.assignedTo}`);
            if (rv.data.some(r => r.taskId === t._id || r.taskId?._id === t._id || String(r.taskId) === String(t._id))) {
              reviewed.add(String(t._id));
            }
          } catch {}
        }
      }
      setReviewedTasks(reviewed);
    } catch (err) { console.error(err); }
  };

  const fetchApplications = async (taskId) => {
    try {
      const res = await axios.get(`http://localhost:5000/applications/task/${taskId}`);
      setApplications(prev => ({ ...prev, [taskId]: res.data }));
    } catch (err) { console.error(err); }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/users/${user._id}`);
      setProfile({ name: res.data.name || "", bio: res.data.bio || "", gender: res.data.gender || "", age: res.data.age || "" });
    } catch (err) { console.error(err); }
  };

  const fetchTranscribers = async () => {
    try {
      const params = {};
      if (tSearch) params.search = tSearch;
      if (tSkill)  params.skill  = tSkill;
      const res = await axios.get("http://localhost:5000/transcribers", { params });
      setTranscribers(res.data);
    } catch (err) { console.error(err); }
  };

  const openTranscriberProfile = async (t) => {
    setViewProfile(t);
    try {
      const res = await axios.get(`http://localhost:5000/reviews/transcriber/${t._id}`);
      setProfileReviews(res.data);
    } catch {}
  };

  const submitTask = async () => {
    if (!form.description.trim()) return alert("Please describe your request");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/create-task", { ...form, clientId: user._id, status: "pending" });
      setForm({ description: "", type: "general", language: "English", deadline: "" });
      fetchTasks();
      setTab("requests");
    } catch { alert("Failed to create request"); }
    finally { setLoading(false); }
  };

  const acceptApplication = async (appId, taskId) => {
    try {
      await axios.patch(`http://localhost:5000/applications/${appId}/accept`);
      fetchApplications(taskId);
      fetchTasks();
    } catch { alert("Accept failed"); }
  };

  const declineApplication = async (appId, taskId) => {
    try {
      await axios.patch(`http://localhost:5000/applications/${appId}/decline`);
      fetchApplications(taskId);
    } catch { alert("Decline failed"); }
  };

  const markComplete = async (taskId) => {
    try {
      await axios.patch(`http://localhost:5000/tasks/${taskId}/complete`);
      fetchTasks();
    } catch { alert("Failed to mark complete"); }
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      await axios.put(`http://localhost:5000/users/${user._id}`, profile);
      alert("Profile saved!");
    } catch { alert("Failed to save"); }
    finally { setProfileSaving(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--bg:#06101E;--bg2:#0C1A2E;--teal:#4ECDC4;--coral:#FF6B6B;--sun:#FFE66D;--text:#E8F6FF;--muted:#7A9BB5;--border:rgba(78,205,196,0.18);}
        .cd-root{min-height:100vh;background:var(--bg);color:var(--text);font-family:'Nunito',sans-serif;}
        .cd-nav{display:flex;justify-content:space-between;align-items:center;padding:14px 32px;background:rgba(12,26,46,0.92);border-bottom:1px solid var(--border);backdrop-filter:blur(12px);position:sticky;top:0;z-index:50;}
        .cd-logo{font-family:'Sora',sans-serif;font-weight:800;font-size:1.2rem;background:linear-gradient(135deg,var(--teal),var(--sun));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .cd-logo span{font-weight:300;}
        .cd-nav-right{display:flex;align-items:center;gap:12px;}
        .cd-user-badge{display:flex;align-items:center;gap:8px;background:rgba(78,205,196,0.1);border:1px solid var(--border);border-radius:100px;padding:6px 14px;font-size:0.82rem;}
        .cd-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--sun));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.7rem;color:#06101E;}
        .cd-role-tag{color:var(--teal);font-size:0.7rem;font-weight:700;}
        .cd-logout{background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.25);color:var(--coral);border-radius:8px;padding:7px 14px;cursor:pointer;font-size:0.8rem;font-weight:700;transition:background 0.2s;}
        .cd-logout:hover{background:rgba(255,107,107,0.2);}
        .cd-tabs{display:flex;gap:4px;padding:20px 32px 0;border-bottom:1px solid var(--border);overflow-x:auto;}
        .cd-tab{padding:10px 18px;border-radius:10px 10px 0 0;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600;font-size:0.85rem;color:var(--muted);border:1px solid transparent;border-bottom:none;transition:all 0.2s;white-space:nowrap;}
        .cd-tab.active{background:var(--bg2);color:var(--teal);border-color:var(--border);}
        .cd-tab:hover:not(.active){color:var(--text);}
        .cd-content{padding:32px;max-width:880px;margin:0 auto;}
        .cd-section-title{font-family:'Sora',sans-serif;font-weight:800;font-size:1.3rem;letter-spacing:-0.02em;margin-bottom:6px;}
        .cd-section-sub{color:var(--muted);font-size:0.88rem;margin-bottom:24px;}
        .cd-label{display:block;font-size:0.75rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
        .cd-textarea,.cd-input,.cd-select{width:100%;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 16px;color:var(--text);font-family:'Nunito',sans-serif;font-size:0.92rem;outline:none;transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;}
        .cd-textarea{resize:vertical;min-height:100px;}
        .cd-textarea:focus,.cd-input:focus,.cd-select:focus{border-color:var(--teal);background:rgba(78,205,196,0.06);box-shadow:0 0 0 3px rgba(78,205,196,0.1);}
        .cd-select option{background:#0C1A2E;}
        .cd-input::placeholder,.cd-textarea::placeholder{color:rgba(122,155,181,0.5);}
        .cd-voice-row{display:flex;gap:10px;margin-bottom:16px;align-items:center;}
        .cd-voice-btn{display:flex;align-items:center;gap:8px;padding:9px 18px;border-radius:10px;border:none;cursor:pointer;font-family:'Sora',sans-serif;font-weight:700;font-size:0.82rem;transition:all 0.2s;}
        .cd-voice-on{background:linear-gradient(135deg,var(--coral),#e05555);color:#fff;box-shadow:0 0 0 4px rgba(255,107,107,0.18);}
        .cd-voice-off{background:rgba(78,205,196,0.1);color:var(--teal);border:1px solid var(--border);}
        .cd-pulse{width:8px;height:8px;border-radius:50%;background:currentColor;animation:pulse 1s infinite;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(1.6);}}
        .cd-type-grid{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px;}
        .cd-type-btn{padding:8px 14px;border-radius:10px;cursor:pointer;font-size:0.82rem;font-weight:600;border:1.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:var(--muted);transition:all 0.2s;text-transform:capitalize;}
        .cd-type-btn.active{border-color:var(--teal);background:rgba(78,205,196,0.12);color:var(--teal);}
        .cd-form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;}
        .cd-field{margin-bottom:16px;}
        .cd-submit{width:100%;padding:14px;background:linear-gradient(135deg,var(--teal),#2cb5ae);color:#06101E;border:none;border-radius:14px;font-family:'Sora',sans-serif;font-weight:800;font-size:1rem;cursor:pointer;box-shadow:0 6px 24px rgba(78,205,196,0.28);transition:transform 0.2s,opacity 0.2s;}
        .cd-submit:hover:not(:disabled){transform:translateY(-2px);}
        .cd-submit:disabled{opacity:0.6;cursor:not-allowed;}

        /* TASK CARDS */
        .cd-task-card{background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:18px;padding:20px;margin-bottom:14px;transition:border-color 0.2s;}
        .cd-task-card:hover{border-color:rgba(78,205,196,0.3);}
        .cd-task-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px;}
        .cd-task-desc{font-weight:600;font-size:0.95rem;flex:1;line-height:1.5;}
        .cd-badge{padding:4px 12px;border-radius:100px;font-size:0.72rem;font-weight:700;white-space:nowrap;}
        .cd-task-meta{display:flex;flex-wrap:wrap;gap:10px;font-size:0.78rem;color:var(--muted);margin-bottom:12px;}
        .cd-assigned-to{font-size:0.82rem;color:var(--teal);font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .cd-actions{display:flex;gap:8px;flex-wrap:wrap;}
        .cd-chat-btn{background:rgba(78,205,196,0.1);border:1px solid var(--border);color:var(--teal);border-radius:8px;padding:8px 14px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:700;font-size:0.78rem;transition:background 0.2s;}
        .cd-chat-btn:hover{background:rgba(78,205,196,0.2);}
        .cd-complete-btn{background:rgba(109,255,154,0.1);border:1px solid rgba(109,255,154,0.2);color:#6DFF9A;border-radius:8px;padding:8px 14px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:700;font-size:0.78rem;transition:background 0.2s;}
        .cd-complete-btn:hover{background:rgba(109,255,154,0.2);}
        .cd-review-btn{background:rgba(255,230,109,0.1);border:1px solid rgba(255,230,109,0.22);color:var(--sun);border-radius:8px;padding:8px 14px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:700;font-size:0.78rem;transition:background 0.2s;}
        .cd-review-btn:hover{background:rgba(255,230,109,0.2);}
        .cd-apps-btn{background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.22);color:var(--coral);border-radius:8px;padding:8px 14px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:700;font-size:0.78rem;transition:background 0.2s;}
        .cd-apps-btn:hover{background:rgba(255,107,107,0.18);}
        .cd-empty{text-align:center;padding:48px 0;color:var(--muted);font-size:0.9rem;}

        /* APPLICATION CARDS */
        .cd-apps-panel{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;margin-top:12px;}
        .cd-apps-panel-title{font-family:'Sora',sans-serif;font-weight:700;font-size:0.85rem;color:var(--coral);margin-bottom:12px;}
        .cd-app-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;}
        .cd-app-card:last-child{margin-bottom:0;}
        .cd-app-info{flex:1;min-width:0;}
        .cd-app-name{font-weight:700;font-size:0.9rem;margin-bottom:3px;display:flex;align-items:center;gap:6px;}
        .cd-app-meta{font-size:0.75rem;color:var(--muted);margin-bottom:4px;}
        .cd-app-msg{font-size:0.8rem;color:var(--text);font-style:italic;margin-top:4px;}
        .cd-app-actions{display:flex;gap:6px;flex-shrink:0;}
        .cd-acc-btn{background:rgba(78,205,196,0.15);border:1px solid rgba(78,205,196,0.3);color:var(--teal);border-radius:8px;padding:7px 14px;cursor:pointer;font-weight:700;font-size:0.78rem;transition:background 0.2s;}
        .cd-acc-btn:hover{background:rgba(78,205,196,0.25);}
        .cd-dec-btn{background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.22);color:var(--coral);border-radius:8px;padding:7px 12px;cursor:pointer;font-weight:700;font-size:0.78rem;transition:background 0.2s;}
        .cd-dec-btn:hover{background:rgba(255,107,107,0.2);}
        .cd-status-declined{color:#FF6B6B;font-size:0.72rem;font-weight:700;}
        .cd-status-accepted{color:#4ECDC4;font-size:0.72rem;font-weight:700;}

        /* BROWSE TRANSCRIBERS */
        .cd-search-row{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;}
        .cd-search-input{flex:1;min-width:160px;}
        .cd-skill-select{min-width:140px;}
        .cd-search-btn{padding:12px 20px;background:linear-gradient(135deg,var(--teal),#2cb5ae);color:#06101E;border:none;border-radius:12px;font-family:'Sora',sans-serif;font-weight:700;font-size:0.88rem;cursor:pointer;transition:transform 0.15s;}
        .cd-search-btn:hover{transform:scale(1.02);}
        .cd-tc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;}
        .cd-tc-card{background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:18px;padding:22px;cursor:pointer;transition:border-color 0.2s,transform 0.2s;}
        .cd-tc-card:hover{border-color:rgba(78,205,196,0.4);transform:translateY(-3px);}
        .cd-tc-name{font-family:'Sora',sans-serif;font-weight:700;font-size:1rem;margin-bottom:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .cd-tc-meta{font-size:0.78rem;color:var(--muted);margin-bottom:8px;}
        .cd-tc-bio{font-size:0.8rem;color:var(--text);line-height:1.5;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .cd-tc-skills{display:flex;flex-wrap:wrap;gap:5px;}
        .cd-skill-chip{padding:3px 10px;border-radius:100px;background:rgba(78,205,196,0.1);border:1px solid rgba(78,205,196,0.2);color:var(--teal);font-size:0.68rem;font-weight:700;}

        /* PROFILE MODAL */
        .cd-prof-overlay{position:fixed;inset:0;z-index:150;background:rgba(6,16,30,0.82);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px;}
        .cd-prof-modal{width:100%;max-width:560px;max-height:90vh;overflow-y:auto;background:#0C1A2E;border:1px solid var(--border);border-radius:24px;padding:32px;animation:profUp 0.25s ease;}
        @keyframes profUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        .cd-prof-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;}
        .cd-prof-name{font-family:'Sora',sans-serif;font-weight:800;font-size:1.5rem;margin-bottom:4px;}
        .cd-prof-close{background:rgba(255,107,107,0.12);border:1px solid rgba(255,107,107,0.25);color:var(--coral);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:0.8rem;font-weight:700;}
        .cd-prof-section{margin-bottom:20px;}
        .cd-prof-sec-title{font-family:'Sora',sans-serif;font-weight:700;font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--teal);margin-bottom:10px;}
        .cd-review-item{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px;margin-bottom:8px;}
        .cd-review-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
        .cd-review-author{font-weight:700;font-size:0.82rem;}
        .cd-review-date{font-size:0.7rem;color:var(--muted);}
        .cd-review-comment{font-size:0.82rem;color:var(--text);line-height:1.55;}
        .cd-prev-work{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px;margin-bottom:8px;}
        .cd-prev-work-title{font-weight:700;font-size:0.88rem;margin-bottom:4px;}
        .cd-prev-work-desc{font-size:0.8rem;color:var(--muted);}

        /* PROFILE TAB */
        .cd-profile-card{background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:20px;padding:32px;}

        @media(max-width:640px){
          .cd-nav{padding:12px 16px;}
          .cd-content{padding:16px;}
          .cd-form-row{grid-template-columns:1fr;}
          .cd-tabs{padding:14px 16px 0;}
        }
      `}</style>

      <div className="cd-root">
        {/* ── NAV ── */}
        <nav className="cd-nav">
          <div className="cd-logo">Scribe<span>Connect</span></div>
          <div className="cd-nav-right">
            <NotificationBell userId={user?._id} />
            <div className="cd-user-badge">
              <div className="cd-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <span>{user?.name}</span>
              <span className="cd-role-tag">CLIENT</span>
            </div>
            <button className="cd-logout" onClick={() => { logout(); navigate("/"); }}>Log Out</button>
          </div>
        </nav>

        {/* ── TABS ── */}
        <div className="cd-tabs">
          {[
            { key:"request",      label:"🎙️ New Request"         },
            { key:"requests",     label:"📋 My Requests"          },
            { key:"transcribers", label:"🔍 Browse Transcribers"  },
            { key:"profile",      label:"👤 Profile"              },
          ].map(t => (
            <div key={t.key} className={`cd-tab ${tab===t.key?"active":""}`}
              onClick={() => { setTab(t.key); if(t.key==="requests") fetchTasks(); if(t.key==="transcribers") fetchTranscribers(); }}>
              {t.label}
            </div>
          ))}
        </div>

        <div className="cd-content">

          {/* ══ NEW REQUEST ══ */}
          {tab === "request" && (
            <div>
              <div className="cd-section-title">Create a New Request</div>
              <div className="cd-section-sub">Describe your task — transcribers will apply and you choose who works with you</div>

              <div className="cd-field">
                <label className="cd-label">Describe your request</label>
                <div className="cd-voice-row">
                  <button className={`cd-voice-btn ${listening?"cd-voice-on":"cd-voice-off"}`} onClick={toggleVoice}>
                    {listening ? <><div className="cd-pulse"/>Stop Listening</> : <>🎤 Speak</>}
                  </button>
                  {listening && <span style={{fontSize:"0.78rem",color:"var(--coral)"}}>Listening…</span>}
                </div>
                <textarea className="cd-textarea" placeholder="e.g. I need a 30-minute legal hearing transcribed in English by Friday…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              </div>

              <div className="cd-field">
                <label className="cd-label">Transcription Type</label>
                <div className="cd-type-grid">
                  {TYPES.map(t=>(
                    <div key={t} className={`cd-type-btn ${form.type===t?"active":""}`} onClick={()=>setForm({...form,type:t})}>
                      {t==="general"?"📝":t==="legal"?"⚖️":t==="medical"?"🏥":t==="academic"?"🎓":"💻"} {t}
                    </div>
                  ))}
                </div>
              </div>

              <div className="cd-form-row">
                <div>
                  <label className="cd-label">Language</label>
                  <select className="cd-select" value={form.language} onChange={e=>setForm({...form,language:e.target.value})}>
                    {LANGUAGES.map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="cd-label">Deadline</label>
                  <input type="date" className="cd-input" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} />
                </div>
              </div>

              <button className="cd-submit" onClick={submitTask} disabled={loading}>
                {loading?"Posting…":"🚀 Post Request — Transcribers Will Apply"}
              </button>
            </div>
          )}

          {/* ══ MY REQUESTS ══ */}
          {tab === "requests" && (
            <div>
              <div className="cd-section-title">My Requests</div>
              <div className="cd-section-sub">Manage applications, track status, chat, and review</div>

              {tasks.length === 0
                ? <div className="cd-empty">No requests yet. Create your first one! 🚀</div>
                : tasks.map(task => {
                    const s = STATUS_STYLE[task.status] || STATUS_STYLE.pending;
                    const apps = applications[task._id];
                    const pendingApps = apps?.filter(a=>a.status==="pending") || [];
                    return (
                      <div key={task._id} className="cd-task-card">
                        <div className="cd-task-top">
                          <div className="cd-task-desc">{task.description}</div>
                          <span className="cd-badge" style={{background:s.bg,color:s.color}}>{s.label}</span>
                        </div>
                        <div className="cd-task-meta">
                          <span>📝 {task.type}</span>
                          <span>🌐 {task.language}</span>
                          {task.deadline && <span>📅 {task.deadline}</span>}
                        </div>

                        {task.assignedTo
                          ? <div className="cd-assigned-to">✍️ <strong>{task.assignedTo.name}</strong> {task.assignedTo.isVerified && <VerifiedBadge status="verified" />}</div>
                          : <div style={{fontSize:"0.8rem",color:"var(--muted)",marginBottom:"12px"}}>No transcriber assigned yet</div>
                        }

                        <div className="cd-actions">
                          {/* Show applications button on pending tasks */}
                          {task.status === "pending" && (
                            <button className="cd-apps-btn" onClick={() => { fetchApplications(task._id); setApplications(prev=>({...prev, [`show_${task._id}`]:!prev[`show_${task._id}`]})); }}>
                              🙋 Applications {pendingApps.length > 0 ? `(${pendingApps.length})` : ""}
                            </button>
                          )}
                          {task.assignedTo && (task.status === "assigned" || task.status === "completed") && (
                            <button className="cd-chat-btn" onClick={()=>setChatTask(task)}>💬 Chat</button>
                          )}
                          {task.assignedTo && task.status === "assigned" && (
                            <button className="cd-complete-btn" onClick={()=>markComplete(task._id)}>🎉 Mark Complete</button>
                          )}
                          {task.status === "completed" && task.assignedTo && !reviewedTasks.has(String(task._id)) && (
                            <button className="cd-review-btn" onClick={()=>setReviewTask(task)}>⭐ Leave Review</button>
                          )}
                          {task.status === "completed" && reviewedTasks.has(String(task._id)) && (
                            <span style={{fontSize:"0.78rem",color:"#6DFF9A",fontWeight:700}}>✓ Reviewed</span>
                          )}
                        </div>

                        {/* Applications panel */}
                        {applications[`show_${task._id}`] && apps && (
                          <div className="cd-apps-panel">
                            <div className="cd-apps-panel-title">Applications — select one to work with you</div>
                            {apps.length === 0 && <div style={{color:"var(--muted)",fontSize:"0.82rem"}}>No applications yet. Check back soon!</div>}
                            {apps.map(app => (
                              <div key={app._id} className="cd-app-card">
                                <div className="cd-app-info">
                                  <div className="cd-app-name">
                                    {app.assistantId?.name}
                                    <VerifiedBadge status={app.assistantId?.verificationStatus} />
                                  </div>
                                  <div className="cd-app-meta">
                                    <StarDisplay rating={app.assistantId?.rating || 0} />
                                    {" · "}{app.assistantId?.workExperience || 0}yr exp
                                    {app.assistantId?.skills?.length > 0 && ` · ${app.assistantId.skills.slice(0,2).join(", ")}`}
                                  </div>
                                  {app.message && <div className="cd-app-msg">"{app.message}"</div>}
                                  <div style={{marginTop:"6px"}}>
                                    <span style={{fontSize:"0.72rem",color:"var(--muted)",cursor:"pointer",textDecoration:"underline"}} onClick={()=>openTranscriberProfile(app.assistantId)}>
                                      View full profile →
                                    </span>
                                  </div>
                                </div>
                                <div className="cd-app-actions">
                                  {app.status === "pending" && (
                                    <>
                                      <button className="cd-acc-btn" onClick={()=>acceptApplication(app._id, task._id)}>Accept</button>
                                      <button className="cd-dec-btn" onClick={()=>declineApplication(app._id, task._id)}>✕</button>
                                    </>
                                  )}
                                  {app.status === "accepted" && <span className="cd-status-accepted">✓ Accepted</span>}
                                  {app.status === "declined" && <span className="cd-status-declined">✕ Declined</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
              }
            </div>
          )}

          {/* ══ BROWSE TRANSCRIBERS ══ */}
          {tab === "transcribers" && (
            <div>
              <div className="cd-section-title">Browse Transcribers</div>
              <div className="cd-section-sub">Find and view profiles of verified transcribers</div>

              <div className="cd-search-row">
                <input className="cd-input cd-search-input" placeholder="Search by name…" value={tSearch} onChange={e=>setTSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchTranscribers()} />
                <select className="cd-select cd-skill-select" value={tSkill} onChange={e=>setTSkill(e.target.value)}>
                  <option value="">All skills</option>
                  {TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
                <button className="cd-search-btn" onClick={fetchTranscribers}>Search</button>
              </div>

              {transcribers.length === 0
                ? <div className="cd-empty">No transcribers found. Try adjusting your search.</div>
                : <div className="cd-tc-grid">
                    {transcribers.map(tc => (
                      <div key={tc._id} className="cd-tc-card" onClick={()=>openTranscriberProfile(tc)}>
                        <div className="cd-tc-name">
                          {tc.name}
                          <VerifiedBadge status={tc.verificationStatus} />
                        </div>
                        <div className="cd-tc-meta">
                          <StarDisplay rating={tc.rating || 0} />
                          {" · "}{tc.completedTasks || 0} tasks · {tc.workExperience || 0}yr exp
                        </div>
                        {tc.bio && <div className="cd-tc-bio">{tc.bio}</div>}
                        <div className="cd-tc-skills">
                          {tc.skills?.map(s=><span key={s} className="cd-skill-chip">{s}</span>)}
                          {tc.languages?.slice(0,2).map(l=><span key={l} style={{padding:"3px 10px",borderRadius:"100px",background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.18)",color:"var(--coral)",fontSize:"0.68rem",fontWeight:700}}>{l}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ══ PROFILE ══ */}
          {tab === "profile" && (
            <div>
              <div className="cd-section-title">My Profile</div>
              <div className="cd-section-sub">Update your personal information</div>
              <div className="cd-profile-card">
                <div className="cd-field">
                  <label className="cd-label">Full Name</label>
                  <input className="cd-input" value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} placeholder="Your name" />
                </div>
                <div className="cd-field">
                  <label className="cd-label">Email</label>
                  <input className="cd-input" value={user?.email} disabled style={{opacity:0.5}} />
                </div>
                <div className="cd-form-row">
                  <div>
                    <label className="cd-label">Gender</label>
                    <select className="cd-select" value={profile.gender} onChange={e=>setProfile({...profile,gender:e.target.value})}>
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                    </select>
                  </div>
                  <div>
                    <label className="cd-label">Age</label>
                    <input type="number" className="cd-input" value={profile.age} onChange={e=>setProfile({...profile,age:e.target.value})} placeholder="Your age" min={13} max={120} />
                  </div>
                </div>
                <div className="cd-field">
                  <label className="cd-label">About You</label>
                  <textarea className="cd-textarea" value={profile.bio} onChange={e=>setProfile({...profile,bio:e.target.value})} placeholder="Tell transcribers about your needs…" />
                </div>
                <button className="cd-submit" onClick={saveProfile} disabled={profileSaving}>
                  {profileSaving?"Saving…":"💾 Save Profile"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TRANSCRIBER PROFILE MODAL ── */}
      {viewProfile && (
        <div className="cd-prof-overlay" onClick={e=>e.target===e.currentTarget&&setViewProfile(null)}>
          <div className="cd-prof-modal">
            <div className="cd-prof-header">
              <div>
                <div className="cd-prof-name">{viewProfile.name} <VerifiedBadge status={viewProfile.verificationStatus}/></div>
                <StarDisplay rating={viewProfile.rating||0} size="1rem" />
                <span style={{fontSize:"0.78rem",color:"var(--muted)",marginLeft:"6px"}}>{viewProfile.reviewCount||0} reviews</span>
              </div>
              <button className="cd-prof-close" onClick={()=>setViewProfile(null)}>✕ Close</button>
            </div>

            <div className="cd-prof-section">
              <div className="cd-prof-sec-title">About</div>
              <div style={{fontSize:"0.88rem",color:"var(--text)",lineHeight:1.65}}>{viewProfile.bio||"No bio provided."}</div>
              <div style={{display:"flex",gap:"16px",flexWrap:"wrap",marginTop:"12px",fontSize:"0.8rem",color:"var(--muted)"}}>
                {viewProfile.gender && <span>👤 {viewProfile.gender}</span>}
                {viewProfile.age    && <span>🎂 {viewProfile.age} yrs</span>}
                <span>💼 {viewProfile.workExperience||0} years experience</span>
                <span>✅ {viewProfile.completedTasks||0} tasks completed</span>
              </div>
            </div>

            {viewProfile.skills?.length > 0 && (
              <div className="cd-prof-section">
                <div className="cd-prof-sec-title">Skills & Languages</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                  {viewProfile.skills.map(s=><span key={s} className="cd-skill-chip">{s}</span>)}
                  {viewProfile.languages?.map(l=><span key={l} style={{padding:"4px 12px",borderRadius:"100px",background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.18)",color:"var(--coral)",fontSize:"0.72rem",fontWeight:700}}>{l}</span>)}
                </div>
              </div>
            )}

            {viewProfile.previousWorks?.length > 0 && (
              <div className="cd-prof-section">
                <div className="cd-prof-sec-title">Previous Works</div>
                {viewProfile.previousWorks.map((w,i)=>(
                  <div key={i} className="cd-prev-work">
                    <div className="cd-prev-work-title">{w.title} {w.year && <span style={{color:"var(--muted)",fontWeight:400,fontSize:"0.78rem"}}>· {w.year}</span>}</div>
                    {w.description && <div className="cd-prev-work-desc">{w.description}</div>}
                  </div>
                ))}
              </div>
            )}

            <div className="cd-prof-section">
              <div className="cd-prof-sec-title">Reviews ({profileReviews.length})</div>
              {profileReviews.length === 0
                ? <div style={{color:"var(--muted)",fontSize:"0.85rem"}}>No reviews yet.</div>
                : profileReviews.map(r=>(
                    <div key={r._id} className="cd-review-item">
                      <div className="cd-review-top">
                        <div className="cd-review-author">{r.clientName}</div>
                        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                          <StarDisplay rating={r.rating} />
                          <div className="cd-review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      {r.comment && <div className="cd-review-comment">"{r.comment}"</div>}
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT MODAL ── */}
      {chatTask && <ChatBox task={chatTask} currentUser={user} onClose={()=>setChatTask(null)} />}

      {/* ── REVIEW MODAL ── */}
      {reviewTask && (
        <ReviewModal
          task={reviewTask}
          currentUser={user}
          onClose={()=>setReviewTask(null)}
          onSubmitted={()=>{ fetchTasks(); }}
        />
      )}
    </>
  );
}


