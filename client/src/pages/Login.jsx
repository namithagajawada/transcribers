// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/login", form);

//       console.log(res.data);

//       // 🔥 ROLE BASED REDIRECT
//       if (res.data.role === "client") {
//         navigate("/client");
//       } else {
//         navigate("/assistant");
//       }

//     } catch (err) {
//       console.error(err);
//       alert("Login failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#06101E] text-white">

//       <div className="w-full max-w-md bg-white/5 backdrop-blur border border-[#4ECDC4]/20 rounded-2xl p-8">

//         <h2 className="text-2xl font-bold mb-6 text-center">
//           Welcome Back 👋
//         </h2>

//         <input
//           type="email"
//           placeholder="Email"
//           className="w-full mb-3 p-3 rounded bg-transparent border border-gray-600 focus:border-teal-400 outline-none"
//           onChange={(e) => setForm({ ...form, email: e.target.value })}
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full mb-4 p-3 rounded bg-transparent border border-gray-600 focus:border-teal-400 outline-none"
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//         />

//         <button
//           onClick={handleLogin}
//           className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 text-black py-3 rounded-lg font-bold hover:scale-105 transition"
//         >
//           Login
//         </button>

//       </div>
//     </div>
//   );
// }






// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";

// export default function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [focused, setFocused] = useState("");
//   const canvasRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const link = document.createElement("link");
//     link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap";
//     link.rel = "stylesheet";
//     document.head.appendChild(link);

//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     const particles = Array.from({ length: 40 }, () => ({
//       x: Math.random() * canvas.width, y: Math.random() * canvas.height,
//       r: Math.random() * 2 + 0.5, dx: (Math.random() - 0.5) * 0.35,
//       dy: (Math.random() - 0.5) * 0.35, alpha: Math.random() * 0.4 + 0.15,
//     }));
//     let raf;
//     const draw = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       particles.forEach((p) => {
//         ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(78,205,196,${p.alpha})`; ctx.fill();
//         p.x += p.dx; p.y += p.dy;
//         if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
//         if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
//       });
//       raf = requestAnimationFrame(draw);
//     };
//     draw();
//     const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
//     window.addEventListener("resize", resize);
//     return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
//   }, []);

//   const handleLogin = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.post("http://localhost:5000/login", form);
//       console.log(res.data);
//       if (res.data.role === "client") navigate("/client");
//       else navigate("/assistant");
//     } catch (err) {
//       console.error(err);
//       alert("Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap');
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         :root {
//           --bg: #06101E; --teal: #4ECDC4; --coral: #FF6B6B;
//           --sun: #FFE66D; --text: #E8F6FF; --muted: #7A9BB5;
//           --border: rgba(78,205,196,0.2);
//         }
//         .lg-root {
//           min-height: 100vh; background: var(--bg); color: var(--text);
//           font-family: 'Nunito', sans-serif; display: flex;
//           flex-direction: column; position: relative; overflow: hidden;
//         }
//         .lg-canvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
//         .lg-blob {
//           position: fixed; border-radius: 50%;
//           filter: blur(80px); opacity: 0.15; pointer-events: none; z-index: 0;
//         }
//         .lg-blob-1 { width: 400px; height: 400px; background: var(--coral); top: -80px; right: -80px; animation: bf 9s ease-in-out infinite alternate; }
//         .lg-blob-2 { width: 350px; height: 350px; background: var(--teal); bottom: -60px; left: -60px; animation: bf 12s ease-in-out infinite alternate-reverse; }
//         @keyframes bf { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(25px,35px) scale(1.07); } }

//         /* NAV */
//         .lg-nav {
//           position: relative; z-index: 10;
//           display: flex; justify-content: space-between; align-items: center;
//           padding: 20px 40px;
//           backdrop-filter: blur(12px);
//           border-bottom: 1px solid var(--border);
//           background: rgba(6,16,30,0.55);
//         }
//         .lg-logo {
//           font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.3rem;
//           letter-spacing: -0.02em; text-decoration: none;
//           background: linear-gradient(135deg, var(--teal), var(--sun));
//           -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
//         }
//         .lg-logo span { font-weight: 300; }
//         .lg-nav-link {
//           color: var(--muted); text-decoration: none; font-size: 0.88rem;
//           font-weight: 600; transition: color 0.2s;
//         }
//         .lg-nav-link:hover { color: var(--teal); }

//         /* LAYOUT */
//         .lg-main {
//           position: relative; z-index: 2; flex: 1;
//           display: flex; align-items: center; justify-content: center;
//           padding: 48px 24px; gap: 72px;
//         }

//         /* LEFT SIDE — decorative quote panel */
//         .lg-left {
//           max-width: 360px; display: flex; flex-direction: column; gap: 28px;
//           animation: fadeUp 0.6s ease both;
//         }
//         @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
//         .lg-tag {
//           display: inline-flex; align-items: center; gap: 8px;
//           background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.22);
//           border-radius: 100px; padding: 5px 14px;
//           font-size: 0.75rem; font-weight: 700; color: var(--coral);
//           letter-spacing: 0.07em; text-transform: uppercase; width: fit-content;
//         }
//         .lg-dot { width: 6px; height: 6px; background: var(--coral); border-radius: 50%; animation: pulse 2s infinite; }
//         @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(1.5);} }
//         .lg-left h1 {
//           font-family: 'Sora', sans-serif; font-weight: 800;
//           font-size: clamp(2rem, 3.5vw, 2.7rem); line-height: 1.12;
//           letter-spacing: -0.03em;
//         }
//         .lg-left h1 .hl {
//           background: linear-gradient(135deg, var(--teal), #a8edea);
//           -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
//         }
//         .lg-left p { color: var(--muted); font-size: 0.92rem; line-height: 1.7; }

//         /* TESTIMONIAL CARD */
//         .lg-testimonial {
//           background: rgba(255,255,255,0.04);
//           border: 1px solid var(--border);
//           border-radius: 18px; padding: 24px;
//           backdrop-filter: blur(10px);
//         }
//         .lg-testimonial-text {
//           font-size: 0.9rem; line-height: 1.65; color: var(--text);
//           font-style: italic; margin-bottom: 16px;
//         }
//         .lg-testimonial-text::before { content: '"'; color: var(--teal); font-size: 1.4rem; line-height: 0; vertical-align: -6px; margin-right: 2px; font-style: normal; }
//         .lg-testimonial-text::after  { content: '"'; color: var(--teal); font-size: 1.4rem; line-height: 0; vertical-align: -6px; margin-left: 2px;  font-style: normal; }
//         .lg-testimonial-author {
//           display: flex; align-items: center; gap: 10px;
//         }
//         .lg-avatar {
//           width: 36px; height: 36px; border-radius: 50%;
//           background: linear-gradient(135deg, var(--teal), var(--sun));
//           display: flex; align-items: center; justify-content: center;
//           font-size: 0.8rem; font-weight: 700; color: #06101E;
//           flex-shrink: 0;
//         }
//         .lg-author-name { font-weight: 700; font-size: 0.85rem; }
//         .lg-author-role { font-size: 0.75rem; color: var(--muted); }

//         /* CARD */
//         .lg-card {
//           width: 100%; max-width: 420px;
//           background: rgba(255,255,255,0.04);
//           border: 1px solid var(--border);
//           border-radius: 24px; padding: 40px 36px;
//           backdrop-filter: blur(14px);
//           animation: fadeUp 0.6s 0.1s ease both;
//         }
//         .lg-card-title {
//           font-family: 'Sora', sans-serif; font-weight: 800;
//           font-size: 1.65rem; letter-spacing: -0.02em; margin-bottom: 6px;
//         }
//         .lg-card-sub { color: var(--muted); font-size: 0.88rem; margin-bottom: 32px; }

//         /* FORM */
//         .lg-field { margin-bottom: 16px; }
//         .lg-label {
//           display: block; font-size: 0.78rem; font-weight: 700;
//           letter-spacing: 0.06em; text-transform: uppercase;
//           color: var(--muted); margin-bottom: 6px; transition: color 0.2s;
//         }
//         .lg-label.active { color: var(--teal); }
//         .lg-input {
//           width: 100%; padding: 13px 16px;
//           background: rgba(255,255,255,0.05);
//           border: 1.5px solid rgba(255,255,255,0.1);
//           border-radius: 12px; color: var(--text);
//           font-family: 'Nunito', sans-serif; font-size: 0.95rem;
//           outline: none; transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
//         }
//         .lg-input:focus, .lg-input.focused {
//           border-color: var(--teal);
//           background: rgba(78,205,196,0.06);
//           box-shadow: 0 0 0 3px rgba(78,205,196,0.12);
//         }
//         .lg-input::placeholder { color: rgba(122,155,181,0.6); }

//         .lg-forgot {
//           display: flex; justify-content: flex-end;
//           margin: -6px 0 24px;
//         }
//         .lg-forgot a {
//           font-size: 0.8rem; color: var(--teal); text-decoration: none; font-weight: 600;
//         }
//         .lg-forgot a:hover { text-decoration: underline; }

//         .lg-submit {
//           width: 100%; padding: 15px;
//           background: linear-gradient(135deg, var(--teal), #2cb5ae);
//           color: #06101E; border: none; border-radius: 14px;
//           font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem;
//           cursor: pointer; letter-spacing: 0.01em;
//           box-shadow: 0 6px 24px rgba(78,205,196,0.35);
//           transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
//           display: flex; align-items: center; justify-content: center; gap: 8px;
//         }
//         .lg-submit:hover:not(:disabled) {
//           transform: translateY(-2px);
//           box-shadow: 0 10px 32px rgba(78,205,196,0.5);
//         }
//         .lg-submit:disabled { opacity: 0.65; cursor: not-allowed; }
//         .lg-spinner {
//           width: 18px; height: 18px; border: 2.5px solid rgba(0,0,0,0.2);
//           border-top-color: #06101E; border-radius: 50%;
//           animation: spin 0.7s linear infinite;
//         }
//         @keyframes spin { to { transform: rotate(360deg); } }

//         /* DIVIDER */
//         .lg-divider {
//           display: flex; align-items: center; gap: 12px;
//           margin: 20px 0; color: rgba(122,155,181,0.4); font-size: 0.78rem;
//         }
//         .lg-divider::before, .lg-divider::after {
//           content: ''; flex: 1; height: 1px;
//           background: rgba(255,255,255,0.08);
//         }

//         .lg-switch {
//           text-align: center; font-size: 0.85rem; color: var(--muted);
//         }
//         .lg-switch a { color: var(--teal); text-decoration: none; font-weight: 700; }
//         .lg-switch a:hover { text-decoration: underline; }

//         @media (max-width: 800px) {
//           .lg-left { display: none; }
//           .lg-main { padding: 32px 20px; }
//           .lg-card { padding: 32px 24px; }
//           .lg-nav { padding: 16px 24px; }
//         }
//       `}</style>

//       <div className="lg-root">
//         <div className="lg-blob lg-blob-1" />
//         <div className="lg-blob lg-blob-2" />
//         <canvas ref={canvasRef} className="lg-canvas" />

//         {/* NAV */}
//         <nav className="lg-nav">
//           <Link to="/" className="lg-logo">Scribe<span>Connect</span></Link>
//           <Link to="/signup" className="lg-nav-link">Don't have an account? Sign up →</Link>
//         </nav>

//         <main className="lg-main">
//           {/* LEFT PANEL */}
//           <div className="lg-left">
//             <div>
//               <div className="lg-tag"><div className="lg-dot" />Welcome back</div>
//             </div>
//             <h1>Good to see you <span className="hl">again</span></h1>
//             <p>
//               Your transcription projects, messages, and team are all waiting —
//               log in and pick up right where you left off.
//             </p>
//             <div className="lg-testimonial">
//               <div className="lg-testimonial-text">
//                 ScribeConnect changed how I work. I get matched within minutes and my clients are always happy with the results.
//               </div>
//               <div className="lg-testimonial-author">
//                 <div className="lg-avatar">RS</div>
//                 <div>
//                   <div className="lg-author-name">Riya S.</div>
//                   <div className="lg-author-role">Medical Transcriber · Hyderabad</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* FORM CARD */}
//           <div className="lg-card">
//             <div className="lg-card-title">Welcome back 👋</div>
//             <div className="lg-card-sub">Sign in to continue to ScribeConnect</div>

//             {[
//               { key: "email",    label: "Email Address", type: "email",    placeholder: "jane@example.com" },
//               { key: "password", label: "Password",      type: "password", placeholder: "Your password" },
//             ].map(({ key, label, type, placeholder }) => (
//               <div key={key} className="lg-field">
//                 <label className={`lg-label ${focused === key ? "active" : ""}`}>{label}</label>
//                 <input
//                   type={type}
//                   placeholder={placeholder}
//                   className={`lg-input ${focused === key ? "focused" : ""}`}
//                   onFocus={() => setFocused(key)}
//                   onBlur={() => setFocused("")}
//                   onChange={(e) => setForm({ ...form, [key]: e.target.value })}
//                 />
//               </div>
//             ))}

//             <div className="lg-forgot"><a href="#">Forgot password?</a></div>

//             <button className="lg-submit" onClick={handleLogin} disabled={loading}>
//               {loading ? <><div className="lg-spinner" /> Signing in…</> : "Sign In →"}
//             </button>

//             <div className="lg-divider">or</div>

//             <div className="lg-switch">
//               New to ScribeConnect? <Link to="/signup">Create an account</Link>
//             </div>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// }


import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const canvasRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const particles = Array.from({ length: 40 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 0.5, dx: (Math.random() - 0.5) * 0.35, dy: (Math.random() - 0.5) * 0.35, alpha: Math.random() * 0.4 + 0.15 }));
    let raf;
    const draw = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(78,205,196,${p.alpha})`; ctx.fill(); p.x += p.dx; p.y += p.dy; if (p.x < 0 || p.x > canvas.width) p.dx *= -1; if (p.y < 0 || p.y > canvas.height) p.dy *= -1; }); raf = requestAnimationFrame(draw); };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/login", form);
      // Save user to AuthContext + localStorage
      login({ _id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role });
      if (res.data.role === "client") navigate("/client");
      else navigate("/assistant");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--bg:#06101E;--teal:#4ECDC4;--coral:#FF6B6B;--sun:#FFE66D;--text:#E8F6FF;--muted:#7A9BB5;--border:rgba(78,205,196,0.2);}
        .lg-root{min-height:100vh;background:var(--bg);color:var(--text);font-family:'Nunito',sans-serif;display:flex;flex-direction:column;position:relative;overflow:hidden;}
        .lg-canvas{position:fixed;inset:0;z-index:0;pointer-events:none;}
        .lg-blob{position:fixed;border-radius:50%;filter:blur(80px);opacity:0.15;pointer-events:none;z-index:0;}
        .lg-blob-1{width:400px;height:400px;background:var(--coral);top:-80px;right:-80px;animation:bf 9s ease-in-out infinite alternate;}
        .lg-blob-2{width:350px;height:350px;background:var(--teal);bottom:-60px;left:-60px;animation:bf 12s ease-in-out infinite alternate-reverse;}
        @keyframes bf{0%{transform:translate(0,0) scale(1);}100%{transform:translate(25px,35px) scale(1.07);}}
        .lg-nav{position:relative;z-index:10;display:flex;justify-content:space-between;align-items:center;padding:20px 40px;backdrop-filter:blur(12px);border-bottom:1px solid var(--border);background:rgba(6,16,30,0.55);}
        .lg-logo{font-family:'Sora',sans-serif;font-weight:800;font-size:1.3rem;text-decoration:none;background:linear-gradient(135deg,var(--teal),var(--sun));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .lg-logo span{font-weight:300;}
        .lg-nav-link{color:var(--muted);text-decoration:none;font-size:0.88rem;font-weight:600;transition:color 0.2s;}
        .lg-nav-link:hover{color:var(--teal);}
        .lg-main{position:relative;z-index:2;flex:1;display:flex;align-items:center;justify-content:center;padding:48px 24px;gap:72px;}
        .lg-left{max-width:360px;display:flex;flex-direction:column;gap:28px;animation:fadeUp 0.6s ease both;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        .lg-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.22);border-radius:100px;padding:5px 14px;font-size:0.75rem;font-weight:700;color:var(--coral);letter-spacing:0.07em;text-transform:uppercase;width:fit-content;}
        .lg-dot{width:6px;height:6px;background:var(--coral);border-radius:50%;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(1.5);}}
        .lg-left h1{font-family:'Sora',sans-serif;font-weight:800;font-size:clamp(2rem,3.5vw,2.7rem);line-height:1.12;letter-spacing:-0.03em;}
        .lg-hl{background:linear-gradient(135deg,var(--teal),#a8edea);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .lg-left p{color:var(--muted);font-size:0.92rem;line-height:1.7;}
        .lg-testimonial{background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:18px;padding:24px;backdrop-filter:blur(10px);}
        .lg-t-text{font-size:0.9rem;line-height:1.65;color:var(--text);font-style:italic;margin-bottom:16px;}
        .lg-t-text::before{content:'"';color:var(--teal);font-size:1.4rem;line-height:0;vertical-align:-6px;margin-right:2px;font-style:normal;}
        .lg-t-text::after{content:'"';color:var(--teal);font-size:1.4rem;line-height:0;vertical-align:-6px;margin-left:2px;font-style:normal;}
        .lg-t-author{display:flex;align-items:center;gap:10px;}
        .lg-t-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--sun));display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;color:#06101E;flex-shrink:0;}
        .lg-t-name{font-weight:700;font-size:0.85rem;}
        .lg-t-role{font-size:0.75rem;color:var(--muted);}
        .lg-card{width:100%;max-width:420px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:24px;padding:40px 36px;backdrop-filter:blur(14px);animation:fadeUp 0.6s 0.1s ease both;}
        .lg-card-title{font-family:'Sora',sans-serif;font-weight:800;font-size:1.65rem;letter-spacing:-0.02em;margin-bottom:6px;}
        .lg-card-sub{color:var(--muted);font-size:0.88rem;margin-bottom:28px;}
        .lg-error{background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.3);border-radius:10px;padding:10px 14px;font-size:0.82rem;color:var(--coral);margin-bottom:16px;}
        .lg-field{margin-bottom:16px;}
        .lg-label{display:block;font-size:0.78rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;transition:color 0.2s;}
        .lg-label.active{color:var(--teal);}
        .lg-input{width:100%;padding:13px 16px;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:12px;color:var(--text);font-family:'Nunito',sans-serif;font-size:0.95rem;outline:none;transition:border-color 0.25s,background 0.25s,box-shadow 0.25s;}
        .lg-input:focus,.lg-input.focused{border-color:var(--teal);background:rgba(78,205,196,0.06);box-shadow:0 0 0 3px rgba(78,205,196,0.12);}
        .lg-input::placeholder{color:rgba(122,155,181,0.6);}
        .lg-forgot{display:flex;justify-content:flex-end;margin:-4px 0 20px;}
        .lg-forgot a{font-size:0.8rem;color:var(--teal);text-decoration:none;font-weight:600;}
        .lg-submit{width:100%;padding:15px;background:linear-gradient(135deg,var(--teal),#2cb5ae);color:#06101E;border:none;border-radius:14px;font-family:'Sora',sans-serif;font-weight:700;font-size:1rem;cursor:pointer;box-shadow:0 6px 24px rgba(78,205,196,0.35);transition:transform 0.2s,box-shadow 0.2s,opacity 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .lg-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 32px rgba(78,205,196,0.5);}
        .lg-submit:disabled{opacity:0.65;cursor:not-allowed;}
        .lg-spinner{width:18px;height:18px;border:2.5px solid rgba(0,0,0,0.2);border-top-color:#06101E;border-radius:50%;animation:spin 0.7s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .lg-divider{display:flex;align-items:center;gap:12px;margin:20px 0;color:rgba(122,155,181,0.4);font-size:0.78rem;}
        .lg-divider::before,.lg-divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.08);}
        .lg-switch{text-align:center;font-size:0.85rem;color:var(--muted);}
        .lg-switch a{color:var(--teal);text-decoration:none;font-weight:700;}
        .lg-switch a:hover{text-decoration:underline;}
        @media(max-width:800px){.lg-left{display:none;}.lg-main{padding:32px 20px;}.lg-card{padding:32px 24px;}.lg-nav{padding:16px 24px;}}
      `}</style>

      <div className="lg-root">
        <div className="lg-blob lg-blob-1" /><div className="lg-blob lg-blob-2" />
        <canvas ref={canvasRef} className="lg-canvas" />
        <nav className="lg-nav">
          <Link to="/" className="lg-logo">Scribe<span>Connect</span></Link>
          <Link to="/signup" className="lg-nav-link">Don't have an account? Sign up →</Link>
        </nav>
        <main className="lg-main">
          <div className="lg-left">
            <div><div className="lg-tag"><div className="lg-dot" />Welcome back</div></div>
            <h1>Good to see you <span className="lg-hl">again</span></h1>
            <p>Your transcription projects, messages, and team are waiting — log in and pick up right where you left off.</p>
            <div className="lg-testimonial">
              <div className="lg-t-text">ScribeConnect changed how I work. I get matched within minutes and my clients are always happy.</div>
              <div className="lg-t-author">
                <div className="lg-t-avatar">RS</div>
                <div><div className="lg-t-name">Riya S.</div><div className="lg-t-role">Medical Transcriber · Hyderabad</div></div>
              </div>
            </div>
          </div>
          <div className="lg-card">
            <div className="lg-card-title">Welcome back 👋</div>
            <div className="lg-card-sub">Sign in to continue to ScribeConnect</div>
            {error && <div className="lg-error">⚠️ {error}</div>}
            {[
              { key: "email", label: "Email Address", type: "email", placeholder: "jane@example.com" },
              { key: "password", label: "Password", type: "password", placeholder: "Your password" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} className="lg-field">
                <label className={`lg-label ${focused === key ? "active" : ""}`}>{label}</label>
                <input type={type} placeholder={placeholder} className={`lg-input ${focused === key ? "focused" : ""}`}
                  onFocus={() => setFocused(key)} onBlur={() => setFocused("")}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>
            ))}
            <div className="lg-forgot"><a href="#">Forgot password?</a></div>
            <button className="lg-submit" onClick={handleLogin} disabled={loading}>
              {loading ? <><div className="lg-spinner" />Signing in…</> : "Sign In →"}
            </button>
            <div className="lg-divider">or</div>
            <div className="lg-switch">New to ScribeConnect? <Link to="/signup">Create an account</Link></div>
          </div>
        </main>
      </div>
    </>
  );
}