// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Signup() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "client",
//   });

//   const navigate = useNavigate();

//   const handleSignup = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/signup", form);

//       console.log(res.data);
//       alert("Signup successful!");

//       navigate("/login");
//     } catch (err) {
//       console.error(err);
//       alert("Signup failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#06101E] text-white">

//       <div className="w-full max-w-md bg-white/5 backdrop-blur border border-[#4ECDC4]/20 rounded-2xl p-8">

//         <h2 className="text-2xl font-bold mb-6 text-center">
//           Create Account 🚀
//         </h2>

//         {/* NAME */}
//         <input
//           type="text"
//           placeholder="Full Name"
//           className="w-full mb-3 p-3 rounded bg-transparent border border-gray-600 focus:border-teal-400 outline-none"
//           onChange={(e) => setForm({ ...form, name: e.target.value })}
//         />

//         {/* EMAIL */}
//         <input
//           type="email"
//           placeholder="Email"
//           className="w-full mb-3 p-3 rounded bg-transparent border border-gray-600 focus:border-teal-400 outline-none"
//           onChange={(e) => setForm({ ...form, email: e.target.value })}
//         />

//         {/* PASSWORD */}
//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full mb-4 p-3 rounded bg-transparent border border-gray-600 focus:border-teal-400 outline-none"
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//         />

//         {/* ROLE */}
//         <select
//           className="w-full mb-4 p-3 rounded bg-[#06101E] border border-gray-600"
//           onChange={(e) => setForm({ ...form, role: e.target.value })}
//         >
//           <option value="client">Client</option>
//           <option value="assistant">Assistant</option>
//         </select>

//         {/* BUTTON */}
//         <button
//           onClick={handleSignup}
//           className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 text-black py-3 rounded-lg font-bold hover:scale-105 transition"
//         >
//           Sign Up
//         </button>

//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5, dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35, alpha: Math.random() * 0.4 + 0.15,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(78,205,196,${p.alpha})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const handleSignup = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/signup", form);
      console.log(res.data);
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #06101E; --teal: #4ECDC4; --coral: #FF6B6B;
          --sun: #FFE66D; --text: #E8F6FF; --muted: #7A9BB5;
          --border: rgba(78,205,196,0.2);
        }
        .su-root {
          min-height: 100vh; background: var(--bg); color: var(--text);
          font-family: 'Nunito', sans-serif; display: flex;
          flex-direction: column; position: relative; overflow: hidden;
        }
        .su-canvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .su-blob {
          position: fixed; border-radius: 50%;
          filter: blur(80px); opacity: 0.15; pointer-events: none; z-index: 0;
        }
        .su-blob-1 { width: 420px; height: 420px; background: var(--teal); top: -100px; left: -100px; animation: bf 9s ease-in-out infinite alternate; }
        .su-blob-2 { width: 320px; height: 320px; background: var(--coral); bottom: -60px; right: -60px; animation: bf 11s ease-in-out infinite alternate-reverse; }
        @keyframes bf { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(25px,35px) scale(1.07); } }

        /* NAV */
        .su-nav {
          position: relative; z-index: 10;
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 40px;
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          background: rgba(6,16,30,0.55);
        }
        .su-logo {
          font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.3rem;
          letter-spacing: -0.02em; text-decoration: none;
          background: linear-gradient(135deg, var(--teal), var(--sun));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .su-logo span { font-weight: 300; }
        .su-nav-link {
          color: var(--muted); text-decoration: none; font-size: 0.88rem;
          font-weight: 600; transition: color 0.2s;
        }
        .su-nav-link:hover { color: var(--teal); }

        /* LAYOUT */
        .su-main {
          position: relative; z-index: 2; flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 24px;
          gap: 64px;
        }

        /* LEFT PANEL */
        .su-left {
          max-width: 380px; display: flex; flex-direction: column; gap: 32px;
          animation: fadeUp 0.6s ease both;
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .su-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(78,205,196,0.1); border: 1px solid var(--border);
          border-radius: 100px; padding: 5px 14px;
          font-size: 0.75rem; font-weight: 700; color: var(--teal);
          letter-spacing: 0.07em; text-transform: uppercase; width: fit-content;
        }
        .su-dot { width: 6px; height: 6px; background: var(--teal); border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(1.5);} }
        .su-left h1 {
          font-family: 'Sora', sans-serif; font-weight: 800;
          font-size: clamp(2rem, 3.5vw, 2.8rem); line-height: 1.1;
          letter-spacing: -0.03em;
        }
        .su-left h1 .teal {
          background: linear-gradient(135deg, var(--teal), #a8edea);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .su-left p { color: var(--muted); font-size: 0.95rem; line-height: 1.7; }
        .su-perks { display: flex; flex-direction: column; gap: 12px; }
        .su-perk {
          display: flex; align-items: center; gap: 12px;
          font-size: 0.88rem; color: var(--text);
        }
        .su-perk-icon {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(78,205,196,0.12); font-size: 1rem;
        }

        /* CARD */
        .su-card {
          width: 100%; max-width: 440px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 24px; padding: 40px 36px;
          backdrop-filter: blur(14px);
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .su-card-title {
          font-family: 'Sora', sans-serif; font-weight: 800;
          font-size: 1.6rem; letter-spacing: -0.02em; margin-bottom: 6px;
        }
        .su-card-sub { color: var(--muted); font-size: 0.88rem; margin-bottom: 28px; }

        /* FORM */
        .su-field { margin-bottom: 14px; }
        .su-label {
          display: block; font-size: 0.78rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 6px;
          transition: color 0.2s;
        }
        .su-label.active { color: var(--teal); }
        .su-input {
          width: 100%; padding: 13px 16px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: var(--text);
          font-family: 'Nunito', sans-serif; font-size: 0.95rem;
          outline: none; transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          appearance: none;
        }
        .su-input:focus, .su-input.focused {
          border-color: var(--teal);
          background: rgba(78,205,196,0.06);
          box-shadow: 0 0 0 3px rgba(78,205,196,0.12);
        }
        .su-input option { background: #0C1A2E; color: var(--text); }

        /* ROLE TOGGLE */
        .su-role-toggle {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 8px; margin-bottom: 24px;
        }
        .su-role-btn {
          padding: 12px; border-radius: 12px; cursor: pointer;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: var(--muted); font-family: 'Sora', sans-serif;
          font-weight: 600; font-size: 0.88rem;
          text-align: center; transition: all 0.2s; user-select: none;
        }
        .su-role-btn.active {
          border-color: var(--teal); background: rgba(78,205,196,0.12);
          color: var(--teal);
          box-shadow: 0 0 0 3px rgba(78,205,196,0.1);
        }

        /* SUBMIT */
        .su-submit {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, var(--teal), #2cb5ae);
          color: #06101E; border: none; border-radius: 14px;
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem;
          cursor: pointer; letter-spacing: 0.01em;
          box-shadow: 0 6px 24px rgba(78,205,196,0.35);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .su-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(78,205,196,0.5);
        }
        .su-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .su-spinner {
          width: 18px; height: 18px; border: 2.5px solid rgba(0,0,0,0.2);
          border-top-color: #06101E; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .su-switch {
          text-align: center; margin-top: 20px;
          font-size: 0.85rem; color: var(--muted);
        }
        .su-switch a { color: var(--teal); text-decoration: none; font-weight: 700; }
        .su-switch a:hover { text-decoration: underline; }

        @media (max-width: 800px) {
          .su-left { display: none; }
          .su-main { padding: 32px 20px; }
          .su-card { padding: 32px 24px; }
          .su-nav { padding: 16px 24px; }
        }
      `}</style>

      <div className="su-root">
        <div className="su-blob su-blob-1" />
        <div className="su-blob su-blob-2" />
        <canvas ref={canvasRef} className="su-canvas" />

        {/* NAV */}
        <nav className="su-nav">
          <Link to="/" className="su-logo">Scribe<span>Connect</span></Link>
          <Link to="/login" className="su-nav-link">Already have an account? Log in →</Link>
        </nav>

        <main className="su-main">
          {/* LEFT PANEL */}
          <div className="su-left">
            <div>
              <div className="su-tag"><div className="su-dot" />Join the community</div>
            </div>
            <h1>Start your <span className="teal">accessible</span> journey today</h1>
            <p>Whether you need transcription or want to offer your skills — ScribeConnect is your platform.</p>
            <div className="su-perks">
              {[
                { icon: "🎙️", text: "Voice-first interface, no typing needed" },
                { icon: "🤖", text: "AI-powered matching to the right transcriber" },
                { icon: "🔒", text: "Secure files, chat & payments in one place" },
                { icon: "⚡", text: "Get matched and started in minutes" },
              ].map((p, i) => (
                <div key={i} className="su-perk">
                  <div className="su-perk-icon">{p.icon}</div>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FORM CARD */}
          <div className="su-card">
            <div className="su-card-title">Create account</div>
            <div className="su-card-sub">Join thousands using ScribeConnect every day</div>

            {/* ROLE TOGGLE */}
            <div style={{ marginBottom: "6px" }}>
              <span className="su-label" style={{ display: "block", marginBottom: "8px" }}>I am a</span>
              <div className="su-role-toggle">
                <div
                  className={`su-role-btn ${form.role === "client" ? "active" : ""}`}
                  onClick={() => setForm({ ...form, role: "client" })}
                >
                  👤 Client
                </div>
                <div
                  className={`su-role-btn ${form.role === "assistant" ? "active" : ""}`}
                  onClick={() => setForm({ ...form, role: "assistant" })}
                >
                  ✍️ Transcriber
                </div>
              </div>
            </div>

            {[
              { key: "name",     label: "Full Name",      type: "text",     placeholder: "Jane Smith" },
              { key: "email",    label: "Email Address",  type: "email",    placeholder: "jane@example.com" },
              { key: "password", label: "Password",       type: "password", placeholder: "Min. 8 characters" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} className="su-field">
                <label className={`su-label ${focused === key ? "active" : ""}`}>{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  className={`su-input ${focused === key ? "focused" : ""}`}
                  onFocus={() => setFocused(key)}
                  onBlur={() => setFocused("")}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}

            <div style={{ marginBottom: "24px" }} />

            <button className="su-submit" onClick={handleSignup} disabled={loading}>
              {loading ? <><div className="su-spinner" /> Creating account…</> : "Create Account →"}
            </button>

            <div className="su-switch">
              Already have an account? <Link to="/login">Log in</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}