import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChatBox from "../components/ChatBox";
import NotificationBell from "../components/NotificationBell";

const SKILLS    = ["general", "legal", "medical", "academic", "technical"];
const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Spanish", "French", "Other"];

const STATUS_STYLE = {
  pending:   { bg:"rgba(255,230,109,0.15)", color:"#FFE66D", label:"⏳ Pending"   },
  assigned:  { bg:"rgba(78,205,196,0.15)",  color:"#4ECDC4", label:"✅ Assigned"  },
  completed: { bg:"rgba(109,255,154,0.15)", color:"#6DFF9A", label:"🎉 Completed" },
};

function VerificationBadge({ status }) {
  const map = {
    verified:   { bg:"rgba(78,205,196,0.15)",  color:"#4ECDC4", label:"✓ Verified"          },
    pending:    { bg:"rgba(255,230,109,0.12)", color:"#FFE66D", label:"⏳ Under Review"       },
    rejected:   { bg:"rgba(255,107,107,0.12)", color:"#FF6B6B", label:"✕ Rejected"           },
    unverified: { bg:"rgba(255,255,255,0.06)", color:"#7A9BB5", label:"○ Not Verified"        },
  };
  const s = map[status] || map.unverified;
  return <span style={{background:s.bg, color:s.color, border:`1px solid ${s.color}40`, borderRadius:"100px", padding:"3px 10px", fontSize:"0.72rem", fontWeight:700}}>{s.label}</span>;
}

export default function Assistant() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab,           setTab]          = useState("browse");
  const [pending,       setPending]      = useState([]);
  const [myTasks,       setMyTasks]      = useState([]);
  const [myApplications,setMyApplications] = useState([]);
  const [chatTask,      setChatTask]     = useState(null);
  const [applying,      setApplying]     = useState(null);   // taskId being applied to
  const [applyMsg,      setApplyMsg]     = useState("");
  const [applyingId,    setApplyingId]   = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [uploading,     setUploading]    = useState(false);
  const [docError,      setDocError]     = useState("");
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name:"", bio:"", gender:"", age:"",
    workExperience:"", skills:[], languages:[],
    previousWorks:[], verificationStatus:"unverified",
    verificationDocs:[], isVerified:false,
  });
  const [skillInput, setSkillInput] = useState("");
  const [langInput,  setLangInput]  = useState("");

  // New previous work form
  const [newWork, setNewWork] = useState({ title:"", description:"", year:"" });
  const [addingWork, setAddingWork] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchPending(); fetchMyTasks(); fetchProfile(); fetchMyApplications();
  }, []);

  const fetchPending = async () => {
    try { const r = await axios.get("http://localhost:5000/tasks/pending"); setPending(r.data); }
    catch (e) { console.error(e); }
  };
  const fetchMyTasks = async () => {
    try { const r = await axios.get(`http://localhost:5000/tasks/assistant/${user._id}`); setMyTasks(r.data); }
    catch (e) { console.error(e); }
  };
  const fetchMyApplications = async () => {
    try { const r = await axios.get(`http://localhost:5000/applications/assistant/${user._id}`); setMyApplications(r.data); }
    catch (e) { console.error(e); }
  };
  const fetchProfile = async () => {
    try {
      const r = await axios.get(`http://localhost:5000/users/${user._id}`);
      const d = r.data;
      setProfile({
        name:               d.name               || "",
        bio:                d.bio                || "",
        gender:             d.gender             || "",
        age:                d.age                || "",
        workExperience:     d.workExperience     || "",
        skills:             d.skills             || [],
        languages:          d.languages          || [],
        previousWorks:      d.previousWorks      || [],
        verificationStatus: d.verificationStatus || "unverified",
        verificationDocs:   d.verificationDocs   || [],
        isVerified:         d.isVerified         || false,
      });
      setSkillInput((d.skills    || []).join(", "));
      setLangInput( (d.languages || []).join(", "));
    } catch (e) { console.error(e); }
  };

  const applyToTask = async (taskId) => {
    setApplyingId(taskId);
    try {
      await axios.post("http://localhost:5000/applications", { taskId, assistantId: user._id, message: applyMsg });
      setApplying(null); setApplyMsg("");
      fetchPending(); fetchMyApplications();
      alert("Application sent! The client will review and accept/decline.");
    } catch (err) {
      alert(err.response?.data?.error || "Application failed");
    } finally { setApplyingId(null); }
  };

  const markComplete = async (taskId) => {
    try { await axios.patch(`http://localhost:5000/tasks/${taskId}/complete`); fetchMyTasks(); }
    catch { alert("Failed to mark complete"); }
  };

  const saveProfile = async () => {
    const updatedSkills = skillInput.split(",").map(s=>s.trim()).filter(Boolean);
    const updatedLangs  = langInput.split(",").map(s=>s.trim()).filter(Boolean);
    setProfileSaving(true);
    try {
      const payload = {
        name:           profile.name,
        bio:            profile.bio,
        gender:         profile.gender,
        age:            profile.age ? Number(profile.age) : null,
        workExperience: profile.workExperience ? Number(profile.workExperience) : 0,
        skills:         updatedSkills,
        languages:      updatedLangs,
        previousWorks:  profile.previousWorks,
      };
      const res = await axios.put(`http://localhost:5000/users/${user._id}`, payload);
      setProfile(p => ({ ...p, skills: updatedSkills, languages: updatedLangs, ...res.data }));
      alert("Profile saved!");
    } catch { alert("Failed to save profile"); }
    finally { setProfileSaving(false); }
  };

  const uploadDocs = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setDocError(""); setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append("docs", f));
      const res = await axios.post(`http://localhost:5000/users/${user._id}/upload-docs`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfile(p => ({ ...p, verificationDocs: res.data.verificationDocs, verificationStatus: res.data.verificationStatus }));
      alert("Documents uploaded! Your verification is now under review.");
    } catch (err) {
      setDocError(err.response?.data?.error || "Upload failed");
    } finally { setUploading(false); }
  };

  const addPreviousWork = () => {
    if (!newWork.title.trim()) return;
    setProfile(p => ({ ...p, previousWorks: [...p.previousWorks, { ...newWork, year: newWork.year ? Number(newWork.year) : null }] }));
    setNewWork({ title:"", description:"", year:"" });
    setAddingWork(false);
  };

  const removePreviousWork = (i) => {
    setProfile(p => ({ ...p, previousWorks: p.previousWorks.filter((_,idx)=>idx!==i) }));
  };

  const alreadyApplied = (taskId) => myApplications.some(a => String(a.taskId?._id || a.taskId) === String(taskId));
  const appStatus      = (taskId) => myApplications.find(a => String(a.taskId?._id || a.taskId) === String(taskId))?.status;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--bg:#06101E;--bg2:#0C1A2E;--teal:#4ECDC4;--coral:#FF6B6B;--sun:#FFE66D;--text:#E8F6FF;--muted:#7A9BB5;--border:rgba(78,205,196,0.18);}
        .ad-root{min-height:100vh;background:var(--bg);color:var(--text);font-family:'Nunito',sans-serif;}
        .ad-nav{display:flex;justify-content:space-between;align-items:center;padding:14px 32px;background:rgba(12,26,46,0.92);border-bottom:1px solid var(--border);backdrop-filter:blur(12px);position:sticky;top:0;z-index:50;}
        .ad-logo{font-family:'Sora',sans-serif;font-weight:800;font-size:1.2rem;background:linear-gradient(135deg,var(--teal),var(--sun));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .ad-logo span{font-weight:300;}
        .ad-nav-right{display:flex;align-items:center;gap:12px;}
        .ad-user-badge{display:flex;align-items:center;gap:8px;background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.22);border-radius:100px;padding:6px 14px;font-size:0.82rem;}
        .ad-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--coral),var(--sun));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.7rem;color:#06101E;}
        .ad-role-tag{color:var(--coral);font-size:0.7rem;font-weight:700;}
        .ad-logout{background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.25);color:var(--coral);border-radius:8px;padding:7px 14px;cursor:pointer;font-size:0.8rem;font-weight:700;transition:background 0.2s;}
        .ad-logout:hover{background:rgba(255,107,107,0.2);}
        .ad-tabs{display:flex;gap:4px;padding:20px 32px 0;border-bottom:1px solid var(--border);overflow-x:auto;}
        .ad-tab{padding:10px 18px;border-radius:10px 10px 0 0;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600;font-size:0.85rem;color:var(--muted);border:1px solid transparent;border-bottom:none;transition:all 0.2s;white-space:nowrap;}
        .ad-tab.active{background:var(--bg2);color:var(--coral);border-color:rgba(255,107,107,0.22);}
        .ad-tab:hover:not(.active){color:var(--text);}
        .ad-content{padding:32px;max-width:880px;margin:0 auto;}
        .ad-section-title{font-family:'Sora',sans-serif;font-weight:800;font-size:1.3rem;letter-spacing:-0.02em;margin-bottom:6px;}
        .ad-section-sub{color:var(--muted);font-size:0.88rem;margin-bottom:24px;}
        .ad-label{display:block;font-size:0.75rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
        .ad-input,.ad-textarea,.ad-select{width:100%;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 16px;color:var(--text);font-family:'Nunito',sans-serif;font-size:0.92rem;outline:none;transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;}
        .ad-textarea{resize:vertical;min-height:80px;}
        .ad-input:focus,.ad-textarea:focus,.ad-select:focus{border-color:var(--teal);background:rgba(78,205,196,0.06);box-shadow:0 0 0 3px rgba(78,205,196,0.1);}
        .ad-select option{background:#0C1A2E;}
        .ad-input::placeholder,.ad-textarea::placeholder{color:rgba(122,155,181,0.5);}
        .ad-field{margin-bottom:18px;}
        .ad-hint{font-size:0.73rem;color:var(--muted);margin-top:4px;}
        .ad-form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;}

        /* TASK CARDS */
        .ad-task-card{background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:18px;padding:20px;margin-bottom:14px;transition:border-color 0.2s;}
        .ad-task-card:hover{border-color:rgba(78,205,196,0.3);}
        .ad-task-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px;}
        .ad-task-desc{font-weight:600;font-size:0.95rem;flex:1;line-height:1.5;}
        .ad-badge{padding:4px 12px;border-radius:100px;font-size:0.72rem;font-weight:700;white-space:nowrap;}
        .ad-task-meta{display:flex;flex-wrap:wrap;gap:10px;font-size:0.78rem;color:var(--muted);margin-bottom:14px;}
        .ad-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
        .ad-apply-btn{background:linear-gradient(135deg,var(--teal),#2cb5ae);color:#06101E;border:none;border-radius:10px;padding:10px 18px;font-family:'Sora',sans-serif;font-weight:700;font-size:0.82rem;cursor:pointer;transition:transform 0.15s,opacity 0.2s;}
        .ad-apply-btn:hover:not(:disabled){transform:scale(1.03);}
        .ad-apply-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .ad-chat-btn{background:rgba(78,205,196,0.1);border:1px solid var(--border);color:var(--teal);border-radius:10px;padding:10px 16px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:700;font-size:0.82rem;transition:background 0.2s;}
        .ad-chat-btn:hover{background:rgba(78,205,196,0.2);}
        .ad-complete-btn{background:rgba(109,255,154,0.1);border:1px solid rgba(109,255,154,0.2);color:#6DFF9A;border-radius:10px;padding:10px 16px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:700;font-size:0.82rem;transition:background 0.2s;}
        .ad-complete-btn:hover{background:rgba(109,255,154,0.2);}
        .ad-app-status-accepted{color:#4ECDC4;font-weight:700;font-size:0.8rem;}
        .ad-app-status-declined{color:#FF6B6B;font-weight:700;font-size:0.8rem;}
        .ad-app-status-pending{color:#FFE66D;font-weight:700;font-size:0.8rem;}
        .ad-empty{text-align:center;padding:48px 0;color:var(--muted);font-size:0.9rem;}

        /* APPLY PANEL */
        .ad-apply-panel{background:rgba(78,205,196,0.05);border:1px solid var(--border);border-radius:12px;padding:16px;margin-top:12px;}
        .ad-apply-panel-title{font-size:0.82rem;font-weight:700;color:var(--teal);margin-bottom:10px;}
        .ad-apply-textarea{width:100%;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;color:var(--text);font-family:'Nunito',sans-serif;font-size:0.88rem;resize:none;outline:none;min-height:70px;transition:border-color 0.2s;}
        .ad-apply-textarea:focus{border-color:var(--teal);}
        .ad-apply-textarea::placeholder{color:rgba(122,155,181,0.5);}
        .ad-apply-actions{display:flex;gap:8px;margin-top:10px;}
        .ad-apply-send{background:linear-gradient(135deg,var(--teal),#2cb5ae);color:#06101E;border:none;border-radius:9px;padding:9px 18px;font-family:'Sora',sans-serif;font-weight:700;font-size:0.82rem;cursor:pointer;transition:opacity 0.2s;}
        .ad-apply-send:disabled{opacity:0.6;cursor:not-allowed;}
        .ad-apply-cancel{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:var(--muted);border-radius:9px;padding:9px 14px;cursor:pointer;font-size:0.82rem;font-weight:600;transition:background 0.2s;}
        .ad-apply-cancel:hover{background:rgba(255,255,255,0.1);}

        /* STATS */
        .ad-stats{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;}
        .ad-stat{flex:1;min-width:110px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center;}
        .ad-stat-num{font-family:'Sora',sans-serif;font-weight:800;font-size:1.6rem;background:linear-gradient(135deg,var(--teal),var(--sun));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .ad-stat-label{font-size:0.7rem;color:var(--muted);margin-top:2px;text-transform:uppercase;letter-spacing:0.05em;}

        /* WARNING */
        .ad-warning{background:rgba(255,230,109,0.07);border:1px solid rgba(255,230,109,0.2);border-radius:12px;padding:14px 18px;font-size:0.84rem;color:var(--sun);margin-bottom:18px;line-height:1.6;}

        /* CHIPS */
        .ad-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
        .ad-chip{padding:4px 12px;border-radius:100px;background:rgba(78,205,196,0.12);border:1px solid var(--border);color:var(--teal);font-size:0.72rem;font-weight:700;}
        .ad-chip-lang{background:rgba(255,107,107,0.08);border-color:rgba(255,107,107,0.2);color:var(--coral);}

        /* PREVIOUS WORKS */
        .ad-work-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;gap:10px;}
        .ad-work-title{font-weight:700;font-size:0.88rem;margin-bottom:3px;}
        .ad-work-desc{font-size:0.78rem;color:var(--muted);}
        .ad-work-remove{background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.2);color:var(--coral);border-radius:7px;padding:5px 10px;cursor:pointer;font-size:0.75rem;font-weight:700;white-space:nowrap;}
        .ad-add-work-btn{background:rgba(78,205,196,0.1);border:1px dashed rgba(78,205,196,0.3);color:var(--teal);border-radius:12px;padding:10px;width:100%;cursor:pointer;font-size:0.85rem;font-weight:700;text-align:center;transition:background 0.2s;}
        .ad-add-work-btn:hover{background:rgba(78,205,196,0.15);}
        .ad-work-form{background:rgba(78,205,196,0.05);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:10px;}

        /* VERIFICATION */
        .ad-verif-box{background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px;}
        .ad-verif-title{font-family:'Sora',sans-serif;font-weight:700;font-size:0.95rem;margin-bottom:8px;display:flex;align-items:center;gap:10px;}
        .ad-verif-desc{color:var(--muted);font-size:0.82rem;line-height:1.6;margin-bottom:14px;}
        .ad-upload-btn{display:inline-flex;align-items:center;gap:8px;background:rgba(78,205,196,0.12);border:1.5px dashed rgba(78,205,196,0.4);color:var(--teal);border-radius:12px;padding:10px 20px;cursor:pointer;font-weight:700;font-size:0.85rem;transition:background 0.2s;}
        .ad-upload-btn:hover{background:rgba(78,205,196,0.2);}
        .ad-doc-list{margin-top:10px;display:flex;flex-direction:column;gap:5px;}
        .ad-doc-item{font-size:0.75rem;color:var(--muted);display:flex;align-items:center;gap:6px;}
        .ad-doc-error{color:var(--coral);font-size:0.8rem;margin-top:6px;}

        .ad-submit{width:100%;padding:14px;background:linear-gradient(135deg,var(--teal),#2cb5ae);color:#06101E;border:none;border-radius:14px;font-family:'Sora',sans-serif;font-weight:800;font-size:1rem;cursor:pointer;box-shadow:0 6px 24px rgba(78,205,196,0.25);transition:transform 0.2s,opacity 0.2s;}
        .ad-submit:hover:not(:disabled){transform:translateY(-2px);}
        .ad-submit:disabled{opacity:0.6;cursor:not-allowed;}

        .ad-profile-card{background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:20px;padding:32px;}

        @media(max-width:640px){
          .ad-nav{padding:12px 16px;}
          .ad-content{padding:16px;}
          .ad-tabs{padding:14px 16px 0;}
          .ad-form-row{grid-template-columns:1fr;}
        }
      `}</style>

      <div className="ad-root">
        {/* ── NAV ── */}
        <nav className="ad-nav">
          <div className="ad-logo">Scribe<span>Connect</span></div>
          <div className="ad-nav-right">
            <NotificationBell userId={user?._id} />
            <div className="ad-user-badge">
              <div className="ad-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <span>{user?.name}</span>
              <span className="ad-role-tag">TRANSCRIBER</span>
            </div>
            <button className="ad-logout" onClick={()=>{logout();navigate("/");}}>Log Out</button>
          </div>
        </nav>

        {/* ── TABS ── */}
        <div className="ad-tabs">
          {[
            { key:"browse",  label:"🔍 Browse Tasks"     },
            { key:"mywork",  label:"📌 My Assignments"   },
            { key:"applied", label:"📤 My Applications"  },
            { key:"profile", label:"👤 Profile"          },
          ].map(t => (
            <div key={t.key} className={`ad-tab ${tab===t.key?"active":""}`}
              onClick={()=>{setTab(t.key);if(t.key==="browse")fetchPending();if(t.key==="mywork")fetchMyTasks();if(t.key==="applied")fetchMyApplications();}}>
              {t.label}
            </div>
          ))}
        </div>

        <div className="ad-content">

          {/* ══ BROWSE TASKS ══ */}
          {tab === "browse" && (
            <div>
              <div className="ad-section-title">Available Requests</div>
              <div className="ad-section-sub">Apply to open requests — clients review applications and accept who they want to work with</div>

              {profile.verificationStatus === "unverified" && (
                <div className="ad-warning">
                  💡 Complete your profile verification to build client trust and appear with a <strong>✓ Verified</strong> badge!
                </div>
              )}

              {pending.length === 0
                ? <div className="ad-empty">No open requests right now. Check back soon! 👀</div>
                : pending.map(task => {
                    const applied = alreadyApplied(task._id);
                    const status  = appStatus(task._id);
                    return (
                      <div key={task._id} className="ad-task-card">
                        <div className="ad-task-top">
                          <div className="ad-task-desc">{task.description}</div>
                          <span className="ad-badge" style={{background:"rgba(255,230,109,0.15)",color:"#FFE66D"}}>⏳ Open</span>
                        </div>
                        <div className="ad-task-meta">
                          <span>📝 {task.type}</span>
                          <span>🌐 {task.language}</span>
                          {task.deadline && <span>📅 Due: {task.deadline}</span>}
                        </div>
                        <div className="ad-actions">
                          {!applied
                            ? <button className="ad-apply-btn" onClick={()=>setApplying(task._id)}>Apply →</button>
                            : status === "pending"   ? <span className="ad-app-status-pending">⏳ Application sent</span>
                            : status === "accepted"  ? <span className="ad-app-status-accepted">✓ Accepted</span>
                            : status === "declined"  ? <span className="ad-app-status-declined">✕ Not selected</span>
                            : null
                          }
                        </div>

                        {/* Apply panel */}
                        {applying === task._id && (
                          <div className="ad-apply-panel">
                            <div className="ad-apply-panel-title">Add a short note to the client (optional)</div>
                            <textarea
                              className="ad-apply-textarea"
                              placeholder="e.g. I have 5 years of legal transcription experience and can deliver by the deadline…"
                              value={applyMsg}
                              onChange={e=>setApplyMsg(e.target.value)}
                            />
                            <div className="ad-apply-actions">
                              <button className="ad-apply-send" disabled={applyingId===task._id} onClick={()=>applyToTask(task._id)}>
                                {applyingId===task._id?"Sending…":"Send Application"}
                              </button>
                              <button className="ad-apply-cancel" onClick={()=>{setApplying(null);setApplyMsg("");}}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              }
            </div>
          )}

          {/* ══ MY ASSIGNMENTS ══ */}
          {tab === "mywork" && (
            <div>
              <div className="ad-section-title">My Assignments</div>
              <div className="ad-section-sub">Tasks you've been accepted for</div>

              <div className="ad-stats">
                <div className="ad-stat"><div className="ad-stat-num">{myTasks.length}</div><div className="ad-stat-label">Total</div></div>
                <div className="ad-stat"><div className="ad-stat-num">{myTasks.filter(t=>t.status==="assigned").length}</div><div className="ad-stat-label">Active</div></div>
                <div className="ad-stat"><div className="ad-stat-num">{myTasks.filter(t=>t.status==="completed").length}</div><div className="ad-stat-label">Done</div></div>
              </div>

              {myTasks.length === 0
                ? <div className="ad-empty">No assignments yet. Browse and apply to tasks! 🚀</div>
                : myTasks.map(task => {
                    const s = STATUS_STYLE[task.status] || STATUS_STYLE.assigned;
                    return (
                      <div key={task._id} className="ad-task-card">
                        <div className="ad-task-top">
                          <div className="ad-task-desc">{task.description}</div>
                          <span className="ad-badge" style={{background:s.bg,color:s.color}}>{s.label}</span>
                        </div>
                        <div className="ad-task-meta">
                          <span>📝 {task.type}</span><span>🌐 {task.language}</span>
                          {task.deadline && <span>📅 Due: {task.deadline}</span>}
                        </div>
                        <div className="ad-actions">
                          <button className="ad-chat-btn" onClick={()=>setChatTask(task)}>💬 Chat with Client</button>
                          {task.status === "assigned" && (
                            <button className="ad-complete-btn" onClick={()=>markComplete(task._id)}>🎉 Mark Complete</button>
                          )}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          )}

          {/* ══ MY APPLICATIONS ══ */}
          {tab === "applied" && (
            <div>
              <div className="ad-section-title">My Applications</div>
              <div className="ad-section-sub">Track all the tasks you've applied to</div>
              {myApplications.length === 0
                ? <div className="ad-empty">You haven't applied to anything yet. Browse open tasks!</div>
                : myApplications.map(app => {
                    const task = app.taskId;
                    const statusMap = {
                      pending:  { bg:"rgba(255,230,109,0.1)", color:"#FFE66D", label:"⏳ Awaiting client" },
                      accepted: { bg:"rgba(78,205,196,0.1)",  color:"#4ECDC4", label:"🎉 Accepted!"        },
                      declined: { bg:"rgba(255,107,107,0.1)", color:"#FF6B6B", label:"✕ Not selected"     },
                    };
                    const s = statusMap[app.status] || statusMap.pending;
                    return (
                      <div key={app._id} className="ad-task-card">
                        <div className="ad-task-top">
                          <div className="ad-task-desc">{task?.description || "Task removed"}</div>
                          <span className="ad-badge" style={{background:s.bg,color:s.color}}>{s.label}</span>
                        </div>
                        <div className="ad-task-meta">
                          {task?.type && <span>📝 {task.type}</span>}
                          {task?.language && <span>🌐 {task.language}</span>}
                          {task?.deadline && <span>📅 {task.deadline}</span>}
                        </div>
                        {app.message && <div style={{fontSize:"0.8rem",color:"var(--muted)",fontStyle:"italic",marginBottom:"8px"}}>Your note: "{app.message}"</div>}
                      </div>
                    );
                  })
              }
            </div>
          )}

          {/* ══ PROFILE ══ */}
          {tab === "profile" && (
            <div>
              <div className="ad-section-title">My Transcriber Profile</div>
              <div className="ad-section-sub">A complete profile gets you more accepted applications</div>

              {/* VERIFICATION BOX */}
              <div className="ad-verif-box">
                <div className="ad-verif-title">
                  🛡️ Verification
                  <VerificationBadge status={profile.verificationStatus} />
                </div>
                <div className="ad-verif-desc">
                  Upload a government ID, professional certificate, or any relevant credential. Once verified, you'll appear with a <strong>✓ Verified</strong> badge that increases client trust significantly.
                  <br/>Accepted formats: PDF, JPG, PNG (max 5MB each, up to 5 files).
                </div>
                <label className="ad-upload-btn">
                  {uploading ? "Uploading…" : "📎 Upload Verification Documents"}
                  <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple style={{display:"none"}} onChange={uploadDocs} />
                </label>
                {docError && <div className="ad-doc-error">⚠️ {docError}</div>}
                {profile.verificationDocs.length > 0 && (
                  <div className="ad-doc-list">
                    {profile.verificationDocs.map((doc,i)=>(
                      <div key={i} className="ad-doc-item">📄 {doc.split("/").pop()}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="ad-profile-card">
                {/* Basic info */}
                <div className="ad-field">
                  <label className="ad-label">Full Name</label>
                  <input className="ad-input" value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} placeholder="Your name" />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Email</label>
                  <input className="ad-input" value={user?.email} disabled style={{opacity:0.5}} />
                </div>
                <div className="ad-form-row">
                  <div>
                    <label className="ad-label">Gender</label>
                    <select className="ad-select" value={profile.gender} onChange={e=>setProfile({...profile,gender:e.target.value})}>
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                    </select>
                  </div>
                  <div>
                    <label className="ad-label">Age</label>
                    <input type="number" className="ad-input" value={profile.age} onChange={e=>setProfile({...profile,age:e.target.value})} placeholder="Your age" min={18} max={100} />
                  </div>
                </div>
                <div className="ad-form-row">
                  <div>
                    <label className="ad-label">Work Experience (years)</label>
                    <input type="number" className="ad-input" value={profile.workExperience} onChange={e=>setProfile({...profile,workExperience:e.target.value})} placeholder="e.g. 5" min={0} />
                  </div>
                </div>
                <div className="ad-field">
                  <label className="ad-label">Bio</label>
                  <textarea className="ad-textarea" value={profile.bio} onChange={e=>setProfile({...profile,bio:e.target.value})} placeholder="e.g. 5 years of medical transcription experience, specializing in cardiology…" />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Skills / Specializations</label>
                  <input className="ad-input" value={skillInput} onChange={e=>setSkillInput(e.target.value)} placeholder="legal, medical, academic" />
                  <div className="ad-hint">Comma-separated. Affects your match score.</div>
                  {skillInput && <div className="ad-chips">{skillInput.split(",").map(s=>s.trim()).filter(Boolean).map((s,i)=><span key={i} className="ad-chip">{s}</span>)}</div>}
                </div>
                <div className="ad-field">
                  <label className="ad-label">Languages</label>
                  <input className="ad-input" value={langInput} onChange={e=>setLangInput(e.target.value)} placeholder="English, Hindi, Telugu" />
                  <div className="ad-hint">Comma-separated.</div>
                  {langInput && <div className="ad-chips">{langInput.split(",").map(l=>l.trim()).filter(Boolean).map((l,i)=><span key={i} className="ad-chip ad-chip-lang">{l}</span>)}</div>}
                </div>

                {/* Previous Works */}
                <div className="ad-field">
                  <label className="ad-label">Previous Works</label>
                  {profile.previousWorks.map((w,i)=>(
                    <div key={i} className="ad-work-card">
                      <div style={{flex:1,minWidth:0}}>
                        <div className="ad-work-title">{w.title} {w.year && <span style={{color:"var(--muted)",fontWeight:400,fontSize:"0.78rem"}}>· {w.year}</span>}</div>
                        {w.description && <div className="ad-work-desc">{w.description}</div>}
                      </div>
                      <button className="ad-work-remove" onClick={()=>removePreviousWork(i)}>✕</button>
                    </div>
                  ))}

                  {addingWork
                    ? <div className="ad-work-form">
                        <div className="ad-field"><label className="ad-label">Title</label><input className="ad-input" value={newWork.title} onChange={e=>setNewWork({...newWork,title:e.target.value})} placeholder="e.g. Court hearing transcript — Smith vs. Johnson" /></div>
                        <div className="ad-form-row">
                          <div><label className="ad-label">Year</label><input type="number" className="ad-input" value={newWork.year} onChange={e=>setNewWork({...newWork,year:e.target.value})} placeholder="2023" /></div>
                        </div>
                        <div className="ad-field"><label className="ad-label">Description</label><textarea className="ad-textarea" style={{minHeight:"60px"}} value={newWork.description} onChange={e=>setNewWork({...newWork,description:e.target.value})} placeholder="Brief description of the work done…" /></div>
                        <div style={{display:"flex",gap:"8px"}}>
                          <button className="ad-apply-send" onClick={addPreviousWork}>Add</button>
                          <button className="ad-apply-cancel" onClick={()=>setAddingWork(false)}>Cancel</button>
                        </div>
                      </div>
                    : <div className="ad-add-work-btn" onClick={()=>setAddingWork(true)}>+ Add Previous Work</div>
                  }
                </div>

                <button className="ad-submit" onClick={saveProfile} disabled={profileSaving}>
                  {profileSaving?"Saving…":"💾 Save Profile"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {chatTask && <ChatBox task={chatTask} currentUser={user} onClose={()=>setChatTask(null)} />}
    </>
  );
}


