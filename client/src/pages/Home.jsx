// import { Link } from "react-router-dom";

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">

//       {/* NAVBAR */}
//       <div className="flex justify-between items-center px-8 py-5">
//         <h1 className="text-2xl font-bold tracking-wide">
//           ScribeConnect 🚀
//         </h1>

//         <div className="flex gap-4">
//           <Link
//             to="/login"
//             className="hover:text-gray-200 transition"
//           >
//             Login
//           </Link>

//           <Link
//             to="/signup"
//             className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-100"
//           >
//             Sign Up
//           </Link>
//         </div>
//       </div>

//       {/* HERO SECTION */}
//       <div className="flex flex-col items-center justify-center text-center px-6 mt-20">
//         <h1 className="text-5xl font-extrabold leading-tight mb-6">
//           Empowering Accessibility <br />
//           Through Human Assistance
//         </h1>

//         <p className="max-w-2xl text-lg text-gray-100 mb-8">
//           ScribeConnect connects differently-abled individuals with skilled
//           transcribers using AI-powered matching, voice interaction, and real-time collaboration.
//         </p>

//         <div className="flex gap-4">
//           <Link
//             to="/signup"
//             className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:scale-105 transition"
//           >
//             Get Started
//           </Link>

//           <Link
//             to="/create"
//             className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-purple-600 transition"
//           >
//             Try Demo
//           </Link>
//         </div>
//       </div>

//       {/* FEATURES SECTION */}
//       <div className="mt-32 px-8 grid md:grid-cols-3 gap-8 text-center">
//         <div className="bg-white text-black p-6 rounded-xl shadow-lg">
//           <h3 className="text-xl font-bold mb-2">🎤 Voice Enabled</h3>
//           <p>Speak your requests easily without typing.</p>
//         </div>

//         <div className="bg-white text-black p-6 rounded-xl shadow-lg">
//           <h3 className="text-xl font-bold mb-2">🤖 Smart Matching</h3>
//           <p>AI finds the best assistant for your needs.</p>
//         </div>

//         <div className="bg-white text-black p-6 rounded-xl shadow-lg">
//           <h3 className="text-xl font-bold mb-2">🔒 Secure & Reliable</h3>
//           <p>Safe communication and task management.</p>
//         </div>
//       </div>

//       {/* FOOTER */}
//       <div className="mt-20 text-center text-sm text-gray-200 pb-6">
//         © 2026 ScribeConnect. Built for accessibility 💙
//       </div>
//     </div>
//   );
// }

import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Inject Google Fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Particle canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(78,205,196,${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:       #06101E;
          --bg2:      #0C1A2E;
          --teal:     #4ECDC4;
          --coral:    #FF6B6B;
          --sun:      #FFE66D;
          --text:     #E8F6FF;
          --muted:    #7A9BB5;
          --card:     rgba(255,255,255,0.04);
          --border:   rgba(78,205,196,0.18);
        }

        .sc-root {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: 'Nunito', sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        /* ── CANVAS ── */
        .sc-canvas {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        /* ── MESH BLOBS ── */
        .sc-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.18;
          pointer-events: none;
          z-index: 0;
        }
        .sc-blob-1 {
          width: 520px; height: 520px;
          background: var(--teal);
          top: -120px; left: -120px;
          animation: blobFloat 8s ease-in-out infinite alternate;
        }
        .sc-blob-2 {
          width: 400px; height: 400px;
          background: var(--coral);
          bottom: 60px; right: -80px;
          animation: blobFloat 10s ease-in-out infinite alternate-reverse;
        }
        .sc-blob-3 {
          width: 300px; height: 300px;
          background: var(--sun);
          top: 40%; left: 50%;
          animation: blobFloat 12s ease-in-out infinite alternate;
        }
        @keyframes blobFloat {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(30px, 40px) scale(1.08); }
        }

        /* ── NAV ── */
        .sc-nav {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px 48px;
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          background: rgba(6,16,30,0.6);
        }
        .sc-logo {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, var(--teal), var(--sun));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sc-logo span { font-weight: 300; }
        .sc-nav-links { display: flex; gap: 12px; align-items: center; }
        .sc-nav-login {
          color: var(--muted);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 8px 18px;
          border-radius: 8px;
          transition: color 0.2s;
        }
        .sc-nav-login:hover { color: var(--teal); }
        .sc-btn-primary {
          background: linear-gradient(135deg, var(--teal), #38b2ac);
          color: #06101E;
          text-decoration: none;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          padding: 10px 22px;
          border-radius: 10px;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 20px rgba(78,205,196,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sc-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(78,205,196,0.5);
        }

        /* ── HERO ── */
        .sc-hero {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 100px 24px 80px;
        }
        .sc-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(78,205,196,0.1);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 6px 18px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--teal);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 32px;
          animation: fadeUp 0.6s ease both;
        }
        .sc-badge-dot {
          width: 7px; height: 7px;
          background: var(--teal);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.5); }
        }

        .sc-hero-title {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: clamp(2.6rem, 6vw, 5rem);
          line-height: 1.08;
          letter-spacing: -0.03em;
          max-width: 820px;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .sc-hero-title .hl-teal {
          background: linear-gradient(135deg, var(--teal) 30%, #a8edea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sc-hero-title .hl-coral {
          background: linear-gradient(135deg, var(--coral) 30%, #ffb3b3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sc-hero-sub {
          max-width: 580px;
          font-size: 1.05rem;
          line-height: 1.75;
          color: var(--muted);
          margin: 24px 0 40px;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .sc-hero-ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.7s 0.3s ease both;
        }
        .sc-btn-hero {
          background: linear-gradient(135deg, var(--teal), #2cb5ae);
          color: #06101E;
          text-decoration: none;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          padding: 15px 34px;
          border-radius: 14px;
          letter-spacing: 0.01em;
          box-shadow: 0 6px 30px rgba(78,205,196,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sc-btn-hero:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(78,205,196,0.55);
        }
        .sc-btn-ghost {
          border: 1.5px solid var(--border);
          color: var(--text);
          text-decoration: none;
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          padding: 15px 34px;
          border-radius: 14px;
          backdrop-filter: blur(8px);
          background: rgba(255,255,255,0.04);
          transition: border-color 0.2s, background 0.2s;
        }
        .sc-btn-ghost:hover {
          border-color: var(--teal);
          background: rgba(78,205,196,0.08);
        }

        /* ── STATS BAR ── */
        .sc-stats {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          gap: 0;
          flex-wrap: wrap;
          margin: 0 auto 0;
          max-width: 900px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          overflow: hidden;
          animation: fadeUp 0.7s 0.4s ease both;
        }
        .sc-stat {
          flex: 1;
          min-width: 160px;
          padding: 28px 24px;
          text-align: center;
          border-right: 1px solid var(--border);
        }
        .sc-stat:last-child { border-right: none; }
        .sc-stat-num {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: 2rem;
          background: linear-gradient(135deg, var(--teal), var(--sun));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sc-stat-label {
          font-size: 0.8rem;
          color: var(--muted);
          margin-top: 4px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── SECTION LABEL ── */
        .sc-section-label {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--teal);
          margin-bottom: 14px;
        }
        .sc-section-title {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          letter-spacing: -0.025em;
          line-height: 1.18;
          margin-bottom: 14px;
        }
        .sc-section-sub {
          color: var(--muted);
          font-size: 1rem;
          line-height: 1.7;
          max-width: 520px;
        }

        /* ── FEATURES ── */
        .sc-features-section {
          position: relative;
          z-index: 2;
          padding: 100px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .sc-features-header {
          margin-bottom: 56px;
        }
        .sc-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .sc-feature-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px 28px;
          backdrop-filter: blur(10px);
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
          cursor: default;
        }
        .sc-feature-card:hover {
          transform: translateY(-6px);
          border-color: var(--teal);
          box-shadow: 0 12px 40px rgba(78,205,196,0.12);
        }
        .sc-feature-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 20px;
        }
        .sc-feature-card h3 {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 10px;
        }
        .sc-feature-card p {
          color: var(--muted);
          font-size: 0.9rem;
          line-height: 1.65;
        }

        /* ── HOW IT WORKS ── */
        .sc-how-section {
          position: relative;
          z-index: 2;
          padding: 80px 48px;
          background: linear-gradient(180deg, transparent, rgba(78,205,196,0.04), transparent);
        }
        .sc-how-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .sc-how-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0;
          margin-top: 56px;
          position: relative;
        }
        .sc-how-steps::before {
          content: '';
          position: absolute;
          top: 28px;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--teal), transparent);
          z-index: 0;
        }
        .sc-step {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 24px 0;
        }
        .sc-step-num {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--teal), #2cb5ae);
          color: #06101E;
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          box-shadow: 0 0 0 8px rgba(78,205,196,0.12);
        }
        .sc-step h4 {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 8px;
        }
        .sc-step p {
          color: var(--muted);
          font-size: 0.85rem;
          line-height: 1.65;
        }

        /* ── AUDIENCE CARDS ── */
        .sc-audience-section {
          position: relative;
          z-index: 2;
          padding: 80px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .sc-audience-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 56px;
        }
        .sc-audience-card {
          border-radius: 24px;
          padding: 40px 36px;
          position: relative;
          overflow: hidden;
        }
        .sc-audience-card-client {
          background: linear-gradient(135deg, rgba(78,205,196,0.12), rgba(78,205,196,0.04));
          border: 1px solid rgba(78,205,196,0.25);
        }
        .sc-audience-card-scribe {
          background: linear-gradient(135deg, rgba(255,107,107,0.12), rgba(255,107,107,0.04));
          border: 1px solid rgba(255,107,107,0.25);
        }
        .sc-audience-card-bg {
          position: absolute;
          top: -40px; right: -40px;
          font-size: 8rem;
          opacity: 0.07;
          pointer-events: none;
        }
        .sc-audience-card h3 {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          margin-bottom: 8px;
        }
        .sc-audience-card .sc-audience-sub {
          color: var(--muted);
          font-size: 0.9rem;
          margin-bottom: 24px;
        }
        .sc-audience-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sc-audience-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--text);
          line-height: 1.5;
        }
        .sc-check {
          flex-shrink: 0;
          width: 20px; height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          margin-top: 2px;
        }
        .sc-check-teal { background: rgba(78,205,196,0.2); color: var(--teal); }
        .sc-check-coral { background: rgba(255,107,107,0.2); color: var(--coral); }

        /* ── CTA SECTION ── */
        .sc-cta-section {
          position: relative;
          z-index: 2;
          padding: 80px 48px;
          text-align: center;
        }
        .sc-cta-box {
          max-width: 720px;
          margin: 0 auto;
          background: linear-gradient(135deg, rgba(78,205,196,0.12), rgba(255,107,107,0.06));
          border: 1px solid rgba(78,205,196,0.22);
          border-radius: 28px;
          padding: 64px 48px;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        .sc-cta-glow {
          position: absolute;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(78,205,196,0.25), transparent 70%);
          top: -100px; left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }
        .sc-cta-box h2 {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          letter-spacing: -0.025em;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }
        .sc-cta-box p {
          color: var(--muted);
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 36px;
          position: relative;
          z-index: 1;
        }
        .sc-cta-btns {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        /* ── FOOTER ── */
        .sc-footer {
          position: relative;
          z-index: 2;
          border-top: 1px solid var(--border);
          padding: 40px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .sc-footer-copy {
          color: var(--muted);
          font-size: 0.85rem;
        }
        .sc-footer-links {
          display: flex;
          gap: 24px;
        }
        .sc-footer-links a {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.2s;
        }
        .sc-footer-links a:hover { color: var(--teal); }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .sc-nav { padding: 18px 24px; }
          .sc-hero { padding: 70px 20px 60px; }
          .sc-features-section, .sc-audience-section { padding: 60px 24px; }
          .sc-how-section { padding: 60px 24px; }
          .sc-cta-section { padding: 60px 24px; }
          .sc-cta-box { padding: 40px 24px; }
          .sc-footer { padding: 30px 24px; flex-direction: column; text-align: center; }
          .sc-audience-grid { grid-template-columns: 1fr; }
          .sc-how-steps::before { display: none; }
          .sc-stat { min-width: 140px; }
        }
      `}</style>

      <div className="sc-root">
        {/* Ambient blobs */}
        <div className="sc-blob sc-blob-1" />
        <div className="sc-blob sc-blob-2" />
        <div className="sc-blob sc-blob-3" />

        {/* Particle canvas */}
        <canvas ref={canvasRef} className="sc-canvas" />

        {/* ── NAVBAR ── */}
        <nav className="sc-nav">
          <div className="sc-logo">Scribe<span>Connect</span></div>
          <div className="sc-nav-links">
            <Link to="/login" className="sc-nav-login">Log In</Link>
            <Link to="/signup" className="sc-btn-primary">Get Started →</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="sc-hero">
          <div className="sc-badge">
            <div className="sc-badge-dot" />
            Now with AI-Powered Matching
          </div>

          <h1 className="sc-hero-title">
            Transcription built for<br />
            <span className="hl-teal">every ability,</span>{" "}
            <span className="hl-coral">every need</span>
          </h1>

          <p className="sc-hero-sub">
            ScribeConnect connects differently-abled individuals with expert
            transcribers — through voice, AI, and a platform built entirely
            around accessibility.
          </p>

          <div className="sc-hero-ctas">
            <Link to="/signup" className="sc-btn-hero">Start for Free</Link>
            <Link to="/create" className="sc-btn-ghost">Watch Demo ▶</Link>
          </div>
        </section>

        {/* ── STATS ── */}
        <div style={{ position: "relative", zIndex: 2, padding: "0 48px 80px", display: "flex", justifyContent: "center" }}>
          <div className="sc-stats">
            <div className="sc-stat">
              <div className="sc-stat-num">500+</div>
              <div className="sc-stat-label">Expert Transcribers</div>
            </div>
            <div className="sc-stat">
              <div className="sc-stat-num">98%</div>
              <div className="sc-stat-label">Accuracy Rate</div>
            </div>
            <div className="sc-stat">
              <div className="sc-stat-num">24h</div>
              <div className="sc-stat-label">Average Turnaround</div>
            </div>
            <div className="sc-stat">
              <div className="sc-stat-num">12K+</div>
              <div className="sc-stat-label">Tasks Completed</div>
            </div>
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section className="sc-features-section">
          <div className="sc-features-header">
            <div className="sc-section-label">What We Offer</div>
            <h2 className="sc-section-title">Everything in one<br />intelligent platform</h2>
            <p className="sc-section-sub">
              From voice commands to secure payments — built to remove every
              barrier between you and great transcription.
            </p>
          </div>

          <div className="sc-features-grid">
            {[
              { icon: "🎙️", color: "rgba(78,205,196,0.15)", title: "Voice-First Interface", desc: "Navigate and request services entirely by voice — no typing required. Designed for users with visual or motor impairments." },
              { icon: "🤖", color: "rgba(255,107,107,0.15)", title: "Intelligent Matching", desc: "AI pairs you with the best transcriber based on specialization — legal, medical, academic, and more." },
              { icon: "💬", color: "rgba(255,230,109,0.15)", title: "Real-Time Chat & Files", desc: "Integrated messaging and secure file sharing eliminate scattered emails and confusing cloud links." },
              { icon: "⏰", color: "rgba(78,205,196,0.15)", title: "Smart Deadline Tracking", desc: "Automatic reminders and live progress updates keep every project on schedule, always." },
              { icon: "🔒", color: "rgba(255,107,107,0.15)", title: "Secure Payments", desc: "Built-in payment processing with escrow protection. Pay confidently, release on completion." },
              { icon: "📊", color: "rgba(255,230,109,0.15)", title: "Live Availability", desc: "See transcriber schedules in real time. Book instantly or plan ahead — your workflow, your terms." },
            ].map((f, i) => (
              <div key={i} className="sc-feature-card">
                <div className="sc-feature-icon" style={{ background: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="sc-how-section">
          <div className="sc-how-inner">
            <div style={{ textAlign: "center" }}>
              <div className="sc-section-label">How It Works</div>
              <h2 className="sc-section-title">From request to delivery<br />in four simple steps</h2>
            </div>
            <div className="sc-how-steps">
              {[
                { n: "01", title: "Post Your Request", desc: "Describe your project by voice or text. Specify format, specialization, and deadline." },
                { n: "02", title: "Get Matched", desc: "Our AI instantly surfaces the best available transcribers for your exact needs." },
                { n: "03", title: "Collaborate Securely", desc: "Chat, share files, and track progress — all within ScribeConnect." },
                { n: "04", title: "Review & Pay", desc: "Approve the final work and release payment. Simple, safe, and transparent." },
              ].map((s, i) => (
                <div key={i} className="sc-step">
                  <div className="sc-step-num">{s.n}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AUDIENCE ── */}
        <section className="sc-audience-section">
          <div>
            <div className="sc-section-label">Who It's For</div>
            <h2 className="sc-section-title">Built for two sides<br />of one mission</h2>
          </div>
          <div className="sc-audience-grid">
            <div className="sc-audience-card sc-audience-card-client">
              <div className="sc-audience-card-bg">🌐</div>
              <h3>For Clients</h3>
              <p className="sc-audience-sub">Differently-abled individuals & organizations needing accessible transcription</p>
              <ul className="sc-audience-list">
                {[
                  "Voice-driven interface — no typing ever required",
                  "Find verified experts in legal, medical & academic fields",
                  "Clear timelines, costs, and secure file management",
                  "Real-time progress with instant chat support",
                ].map((item, i) => (
                  <li key={i}>
                    <span className="sc-check sc-check-teal">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sc-audience-card sc-audience-card-scribe">
              <div className="sc-audience-card-bg">✍️</div>
              <h3>For Transcribers</h3>
              <p className="sc-audience-sub">Freelance professionals building stable, reputable careers</p>
              <ul className="sc-audience-list">
                {[
                  "Consistent job flow matched to your specialization",
                  "Standardized, transparent pricing — no more guesswork",
                  "Built-in invoicing, deadline tools & client feedback",
                  "A profile that builds credibility over time",
                ].map((item, i) => (
                  <li key={i}>
                    <span className="sc-check sc-check-coral">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="sc-cta-section">
          <div className="sc-cta-box">
            <div className="sc-cta-glow" />
            <h2>Ready to bridge the gap?</h2>
            <p>
              Join thousands of clients and transcribers who've made<br />
              accessibility effortless with ScribeConnect.
            </p>
            <div className="sc-cta-btns">
              <Link to="/signup" className="sc-btn-hero">Create Free Account</Link>
              <Link to="/login" className="sc-btn-ghost">Sign In</Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="sc-footer">
          <div>
            <div className="sc-logo" style={{ fontSize: "1.2rem", marginBottom: "4px" }}>Scribe<span>Connect</span></div>
            <div className="sc-footer-copy">© 2026 ScribeConnect · Built for accessibility 💙</div>
          </div>
          <div className="sc-footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
            <a href="#">Contact</a>
          </div>
        </footer>
      </div>
    </>
  );
}