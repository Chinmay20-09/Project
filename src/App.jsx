import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import GlassCard from "./components/GlassCard";
import ProjectCard from "./components/ProjectCard";
import Tag from "./components/Tag";
import Footer from "./components/Footer";
// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#0e0e10",
  surface: "#131315",
  surfaceHigh: "#1a1a1d",
  surfaceHigher: "#222226",
  border: "#2a2a30",
  borderHover: "#4f46e5",
  text: "#e8e6f0",
  textMuted: "#9490a8",
  textFaint: "#55525e",
  primary: "#4f46e5",
  primaryDim: "rgba(79,70,229,0.12)",
  secondary: "#4cd7f6",
  tertiary: "#ffb695",
  glass: "rgba(14,14,16,0.75)",
};

// ─── Utilities ────────────────────────────────────────────────────────────────
const glass = {
  background: T.glass,
  backdropFilter: "blur(14px)",
  border: `1px solid ${T.border}`,
};

const pill = (active) => ({
  padding: "6px 16px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  background: active ? T.primary : T.surfaceHigher,
  color: active ? "#fff" : T.textMuted,
  border: `1px solid ${active ? T.primary : T.border}`,
  letterSpacing: "0.02em",
});

// ─── Shared Components ────────────────────────────────────────────────────────
const Dot = ({ color = T.primary, pulse = false }) => (
  <span style={{
    display: "inline-block",
    width: 8, height: 8,
    borderRadius: "50%",
    background: color,
    animation: pulse ? "pulse 2s infinite" : "none",
    flexShrink: 0,
  }} />
);
// ─── HOME PAGE ────────────────────────────────────────────────────────────────
const HomePage = ({ setPage }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const timelineItems = [
    { year: "2023–Present", title: "Deep Dive into Transformers", desc: "Focusing on LLM architecture and fine-tuning techniques for specialized productivity tools.", active: true },
    { year: "2022", title: "Full-Stack Sophistication", desc: "Mastered the T3 stack and focused on performance optimization for distributed systems.", active: false },
    { year: "2021", title: "First Steps in AI/ML", desc: "Began exploring machine learning fundamentals with Python and scikit-learn.", active: false },
  ];

  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all 0.7s ease" }}>
      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "80px 24px 64px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 64, alignItems: "center", width: "100%" }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 999,
              background: T.primaryDim, border: `1px solid rgba(79,70,229,0.3)`,
              marginBottom: 28,
            }}>
              <Dot pulse />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.primary }}>Available for select projects</span>
            </div>

            <h1 style={{
              margin: "0 0 20px",
              fontSize: 60, fontWeight: 700, lineHeight: 1.1,
              letterSpacing: "-0.04em",
              background: "linear-gradient(135deg, #e8e6f0 30%, #9490a8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Building practical software, AI systems and productivity tools.
            </h1>

            <p style={{ fontSize: 18, color: T.textMuted, lineHeight: 1.65, marginBottom: 40, maxWidth: 520 }}>
              Computer Science student focused on AI/ML. I transform complex theoretical concepts into robust, user-centric applications.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => setPage("projects")}
                style={{
                  padding: "14px 32px", borderRadius: 10,
                  background: T.primary, border: "none", color: "#fff",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  transition: "opacity 0.2s, transform 0.15s",
                }}
                onMouseEnter={e => { e.target.style.opacity = 0.9; e.target.style.transform = "scale(1.02)"; }}
                onMouseLeave={e => { e.target.style.opacity = 1; e.target.style.transform = "scale(1)"; }}
              >View Projects</button>

              <button
                onClick={() => setPage("projects")}
                style={{
                  padding: "14px 32px", borderRadius: 10,
                  background: "transparent", border: `1px solid ${T.border}`,
                  color: T.text, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.target.style.background = T.surfaceHigh}
                onMouseLeave={e => e.target.style.background = "transparent"}
              >Download Products</button>

              <button
                onClick={() => setPage("technical")}
                style={{
                  padding: "14px 24px", borderRadius: 10,
                  background: "transparent", border: "none",
                  color: T.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = T.text}
                onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
              >Contact Me <span>→</span></button>
            </div>
          </div>

          {/* Photo */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", inset: -2,
                background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
                borderRadius: 20, filter: "blur(16px)", opacity: 0.3,
              }} />
              <div style={{
                position: "relative", borderRadius: 18,
                border: `1px solid ${T.border}`,
                overflow: "hidden", background: T.surface,
              }}>
                <img
                  src="https://lh3.googleusercontent.com/aida/AP1WRLugjvqUHdL0x8zsxPtRmb1UAzdiTcDtgO0hq3GyZrVRBaY5IODvPR_TYVudAJgSeYzkWDoX3c4rjj8r02PjkICWaT1a1CcyvU-6d8yAHcMxv3uH8hK-rECtZ_BkSWydV-kn8aVKRisDlQAOmTxErVeJ4IAXJtJAEgbDsusQxonSSry31UD00NQ1Pr3Ht2rhAtWt7Nb1El9zuzSPIv0RxKPdq7iBpT9t9Q0RS2L6WlHZuej7lekmqaZd5j6j"
                  alt="Chinmay Kolte"
                  style={{ width: "100%", maxWidth: 380, display: "block", filter: "grayscale(0.2)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento intro */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <GlassCard hover style={{ padding: 36 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 24, fontWeight: 600, color: T.text }}>Builder & Founder at Heart</h2>
            <p style={{ margin: 0, color: T.textMuted, lineHeight: 1.7, fontSize: 16 }}>
              My journey in technology started with a simple curiosity: "How can I make this better?" Whether it's optimizing a data pipeline for an ML model or crafting a minimalist task manager, my approach is always practical first. I believe that software should disappear into the user's workflow, enabling them rather than distracting them.
            </p>
          </GlassCard>
          <GlassCard style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <span style={{ fontSize: 40, marginBottom: 12 }}>⌘</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.secondary, marginBottom: 10 }}>Philosophy</span>
            <p style={{ margin: 0, fontStyle: "italic", color: T.text, fontSize: 15, lineHeight: 1.6 }}>
              "Theory without practice is empty; practice without theory is blind."
            </p>
          </GlassCard>
        </div>
      </section>

      {/* About */}
      <section style={{ background: "#0a0a0c", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "5fr 7fr", gap: 80 }}>
          <div>
            <h2 style={{
              fontSize: 48, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #e8e6f0, #9490a8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 32,
            }}>About My Journey</h2>

            <GlassCard style={{ padding: 24, borderLeft: `4px solid ${T.primary}`, marginBottom: 24 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.primary }}>Education</p>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 18, color: T.text }}>B.E. in Computer Science Engineering</p>
              <p style={{ margin: "0 0 8px", color: T.textMuted }}>Smt. Indira Gandhi College of Engineering</p>
              <p style={{ margin: 0, fontSize: 12, color: T.textFaint }}>Expected 2028 · Focus on AI/ML & Automation Engineering</p>
            </GlassCard>

            <p style={{ color: T.textMuted, lineHeight: 1.75, fontSize: 15 }}>
              I view learning as a recursive process. Each project solved opens up ten new questions. My growth narrative isn't just about mastering syntax, but about understanding systems at scale.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: T.text, marginBottom: 32 }}>Timeline of Learning</h3>
            <div style={{ position: "relative", paddingLeft: 28 }}>
              <div style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 2, background: `linear-gradient(to bottom, ${T.primary}, transparent)` }} />
              {timelineItems.map((item, i) => (
                <div key={i} style={{ position: "relative", marginBottom: 36 }}>
                  <div style={{
                    position: "absolute", left: -35, top: 4,
                    width: 14, height: 14, borderRadius: "50%",
                    background: item.active ? T.primary : T.textFaint,
                    border: `3px solid ${T.bg}`,
                  }} />
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontFamily: "monospace", color: item.active ? T.primary : T.textFaint }}>{item.year}</p>
                  <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 17, color: T.text }}>{item.title}</p>
                  <p style={{ margin: 0, color: T.textMuted, fontSize: 14, lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ─── PROJECTS PAGE ────────────────────────────────────────────────────────────
const ProjectsPage = () => {
  const [filter, setFilter] = useState("All");
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const projects = [
    {
      id: 1, title: "AxisFlow",
      desc: "Advanced workflow orchestration engine built for high-throughput data processing.",
      tags: ["React", "Go", "Redis"],
      img: "https://lh3.googleusercontent.com/aida/AP1WRLsOwZHmN9rUvmrftyWMXWf4q3p4BUAD2uGqPSsVpB-5NVjAhYnFRwKGGWBfl0xGBVUns_KvO_mzDhKU0RjM3Xup4G6VVABNYmhOv6a6eSiO6wcuPN9dJsE15Xo9TMwzpfMcH4HVelIhng6leaSE9ZuuZww621xSvyrVvw-WN1lJ1hEKRdDcC6gAy0yWM6HhCkSrENoCjuSx0CHQaTeEffX63p3Ji4XpVrVy1cnOHI0KiEgJoDQsXyosvyG1",
    },
    {
      id: 2, title: "DeskBuddy",
      desc: "Desktop companion for developers to automate environmental setups and track deep-work.",
      tags: ["Electron", "TypeScript", "SQLite"],
      img: "https://lh3.googleusercontent.com/aida/AP1WRLtLcMl8L7FUD6Ityiktj53iO39wQZucjtnv7c-Gn7WPTfTMFnUnBpEhkxBheswAI8lysVYRP7tNe5ohHZHGmKp1OV6nni_WkuAh-wxNOSK7zI67S-gKxcwp6cXUDgX6pU3pIp5NensjvDJ5Fpz9R6BeAoZ7b2HHFAt9fAJA_8GBFjMwvZkE6Qnd5pQGV7w2TtVZ4ZRSGCSvrXpMkKprGbsYct1LvgzTeowaq4t3N7Dl4LZTiLpN068zWNAy",
    },
    {
      id: 3, title: "Lakshman Rekha",
      desc: "Intelligent perimeter monitoring system utilizing computer vision for enhanced site safety.",
      tags: ["Python", "OpenCV", "FastAPI"],
      img: "https://lh3.googleusercontent.com/aida/AP1WRLvMUqrEH4ZKJcACe7IPuXeHePf6dv1Uj6TRTmjGzhLOWIK-kz5jTRmylf1rNUcbbepNHwqQyswmUaoCymvS0rcrsng4MXMK67zlbdRNvAo0t9kCc0WM7wS332XZ_haUxYaXK1w8lF6_3fMtGSbTEOOFJnqNinmPHr5YTEuWuZQhWl4dJM-uh-T2k214caz9-7FvlQQ7iYv7Ypu57jnq2w3ZXs8W382V5cnZN-5J9nPTb8iVIwNZ7_RdyUwV",
    },
  ];

  const filters = ["All", "React", "Python", "Go", "Electron"];
  const filtered = filter === "All" ? projects : projects.filter(p => p.tags.includes(filter));

  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all 0.7s ease", paddingTop: 96 }}>
      {/* Projects */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 700, color: T.primary }}>Selected Projects</h1>
            <p style={{ margin: 0, color: T.textMuted, fontSize: 15 }}>Open-source initiatives and technical experiments.</p>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textFaint, fontSize: 16 }}>⌕</span>
            <input
              placeholder="Search projects"
              style={{
                background: T.surfaceHigh, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "9px 16px 9px 36px",
                color: T.text, fontSize: 13, outline: "none", width: 220,
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={pill(filter === f)}>{f}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {filtered.map(proj => (
            <ProjectCard key={proj.id} proj={proj} />
          ))}
        </div>
      </section>

      {/* Products */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        <h1 style={{ margin: "0 0 32px", fontSize: 28, fontWeight: 700, color: T.secondary }}>Premium Products</h1>

        <GlassCard style={{ padding: 48 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 64, alignItems: "center" }}>
            <div>
              <div style={{
                width: 72, height: 72,
                background: `linear-gradient(135deg, ${T.secondary}, ${T.primary})`,
                borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24, fontSize: 32,
              }}>⌘</div>
              <h2 style={{ margin: "0 0 12px", fontSize: 48, fontWeight: 700, letterSpacing: "-0.04em", color: T.text }}>CodePulse</h2>
              <p style={{ margin: "0 0 24px", color: T.textMuted, fontSize: 15, lineHeight: 1.65 }}>
                The ultimate telemetry dashboard for modern engineering teams. Monitor performance with zero overhead.
              </p>
              <div style={{ marginBottom: 28 }}>
                {["Zero-configuration setup", "AI anomaly detection"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ color: T.secondary, fontSize: 16 }}>✓</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{f}</span>
                  </div>
                ))}
              </div>
              <button style={{
                width: "100%", padding: "16px", borderRadius: 12,
                background: T.primary, border: "none", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>↓ Download for MacOS</button>
            </div>
            <div>
              <img
                src="https://lh3.googleusercontent.com/aida/AP1WRLsaPEg5FVCCEOsl7i4PSVK0LNH_HZOpDnLxQ7IB_Q7_SJ4xqbVOkFDDeawSFG-vcipSVj4x1aMJFUdQFWQR15f-L4qxZaBRBQzAMUag-uzPHhzSl8cGD3_Wxz36kuZY2bdTHjdwZSIIPlGW4iTBwFayF0nxffQd58T2by7M-koNKd6uyfTmUHKYkkE3pxrBQ9o7KSiXTpRsF9GTbnAqk3My1Rf__evjb5GPpemgwzYM_2UTcg_uECy93-U"
                style={{ width: "100%", borderRadius: 12, border: `1px solid ${T.border}` }}
                alt="CodePulse screenshot"
              />
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

// ─── PRODUCTS / BLOG / RESUME / CONTACT PAGES ───────────────────────────────
const ProductsPage = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);
  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all 0.7s ease", paddingTop: 96 }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ margin: "0 0 24px", fontSize: 28, fontWeight: 700, color: T.secondary }}>Products</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {[
            { slug: 'axisflow', title: 'AxisFlow', desc: 'Workflow orchestration engine.' },
            { slug: 'deskbuddy', title: 'DeskBuddy', desc: 'Desktop companion for devs.' },
            { slug: 'lakshmanrekha', title: 'Lakshman Rekha', desc: 'Perimeter monitoring with CV.' },
          ].map(p => (
            <div key={p.slug} style={{ ...glass, padding: 18, borderRadius: 12 }}>
              <h3 style={{ marginTop: 0 }}>{p.title}</h3>
              <p style={{ color: T.textMuted }}>{p.desc}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => window.alert(`${p.title} — more at /products/${p.slug}`)} style={pill(false)}>Open</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const BlogPage = () => (
  <div style={{ paddingTop: 96, maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
    <h1 style={{ marginTop: 0 }}>Blog</h1>
    <p style={{ color: T.textMuted }}>Blog index coming soon.</p>
  </div>
);

const ResumePage = () => (
  <div style={{ paddingTop: 96, maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
    <h1 style={{ marginTop: 0 }}>Resume</h1>
    <p style={{ color: T.textMuted }}>Downloadable resume will be available here.</p>
  </div>
);

const ContactPage = () => (
  <div style={{ paddingTop: 96, maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
    <h1 style={{ marginTop: 0 }}>Contact</h1>
    <GlassCard style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, color: T.textMuted }}>Email</p>
          <p style={{ marginTop: 8, fontWeight: 700 }}>chinmay@kolte.dev</p>
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ display: 'block', marginBottom: 8, color: T.textMuted }}>Message</label>
          <textarea placeholder="Tell me about your project..." rows={4} style={{ width: '100%', padding: 12, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text }} />
          <div style={{ marginTop: 12 }}>
            <button style={{ padding: '12px 18px', borderRadius: 8, background: T.primary, color: '#fff', border: 'none' }}>Send</button>
          </div>
        </div>
      </div>
    </GlassCard>
  </div>
);
// ─── TECHNICAL / EXPERIENCE PAGE ──────────────────────────────────────────────
const TechnicalPage = () => {
  const graphRef = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  useEffect(() => {
    if (!graphRef.current) return;
    graphRef.current.innerHTML = "";
    const shades = ["#1a1a1d", `rgba(79,70,229,0.15)`, `rgba(79,70,229,0.35)`, `rgba(79,70,229,0.6)`, T.primary];
    for (let i = 0; i < 52 * 7; i++) {
      const cell = document.createElement("div");
      cell.style.cssText = `aspect-ratio:1; border-radius:2px; background:${shades[Math.floor(Math.random() * shades.length)]}`;
      graphRef.current.appendChild(cell);
    }
  }, []);

  const skills = [
    { label: "Programming", color: T.primary, icon: "⌨", items: ["Flutter", "Dart", "Python", "C", "Go"] },
    { label: "AI & ML", color: T.secondary, icon: "◈", items: ["LLMs", "PyTorch", "Prompt Eng", "Vision"] },
    { label: "Tools", color: T.tertiary, icon: "⚙", items: ["Git", "Docker", "Firebase", "Vercel"] },
  ];

  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all 0.7s ease", paddingTop: 96 }}>
      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 64px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 999,
          background: T.primaryDim, border: `1px solid rgba(79,70,229,0.3)`,
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.primary }}>Available for opportunities</span>
        </div>

        <h1 style={{
          fontSize: 60, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.04em",
          margin: "0 0 8px",
          color: T.text,
        }}>
          Engineering intelligent systems
          <br />
          <span style={{ color: T.primary }}>with precision.</span>
        </h1>
      </section>

      {/* Skills */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {skills.map(sk => (
            <GlassCard key={sk.label} hover style={{ padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 22, color: sk.color }}>{sk.icon}</span>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.text }}>{sk.label}</h3>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {sk.items.map(item => <Tag key={item} label={item} />)}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Contribution graph */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 64px" }}>
        <GlassCard style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: T.textMuted }}>542 contributions in the last year</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.textFaint }}>
              <span>Less</span>
              <div style={{ width: 12, height: 12, background: T.surfaceHigher, borderRadius: 2 }} />
              <div style={{ width: 12, height: 12, background: "rgba(79,70,229,0.35)", borderRadius: 2 }} />
              <div style={{ width: 12, height: 12, background: T.primary, borderRadius: 2 }} />
              <span>More</span>
            </div>
          </div>
          <div
            ref={graphRef}
            style={{ display: "grid", gridTemplateColumns: "repeat(52, 1fr)", gap: 2 }}
          />
        </GlassCard>
      </section>

      {/* Contact */}
      <section style={{ background: "#0a0a0c", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <h2 style={{ margin: "0 0 16px", fontSize: 36, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
              Let's build something <span style={{ color: T.primary }}>extraordinary.</span>
            </h2>
            <p style={{ margin: "0 0 40px", color: T.textMuted, fontSize: 17, lineHeight: 1.65 }}>
              Currently looking for new challenges. Reach out for collaborations!
            </p>
            <a href="mailto:chinmay@kolte.dev" style={{ display: "flex", alignItems: "center", gap: 16, textDecoration: "none" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: T.surfaceHigh, border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>✉</div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 12, color: T.textMuted }}>Email</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: T.text }}>chinmay@kolte.dev</p>
              </div>
            </a>
          </div>

          <GlassCard style={{ padding: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[["Name", "John Doe", "text"], ["Email", "john@example.com", "email"]].map(([label, ph, type]) => (
                <div key={label}>
                  <label style={{ display: "block", fontSize: 13, color: T.textMuted, marginBottom: 8, fontWeight: 600 }}>{label}</label>
                  <input
                    type={type}
                    placeholder={ph}
                    style={{
                      width: "100%", padding: "12px 14px", boxSizing: "border-box",
                      background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8,
                      color: T.text, fontSize: 14, outline: "none",
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 13, color: T.textMuted, marginBottom: 8, fontWeight: 600 }}>Message</label>
                <textarea
                  placeholder="Tell me about your project..."
                  rows={4}
                  style={{
                    width: "100%", padding: "12px 14px", boxSizing: "border-box",
                    background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8,
                    color: T.text, fontSize: 14, outline: "none", resize: "vertical",
                  }}
                />
              </div>
              <button style={{
                padding: "16px", borderRadius: 10,
                background: T.primary, border: "none", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                transition: "opacity 0.2s",
              }}
                onMouseEnter={e => e.target.style.opacity = 0.88}
                onMouseLeave={e => e.target.style.opacity = 1}
              >Send Message</button>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  useEffect(() => { window.scrollTo({ top: 0 }); }, [page]);

  const pages = { home: <HomePage setPage={setPage} />, projects: <ProjectsPage />, products: <ProductsPage />, blog: <BlogPage />, resume: <ResumePage />, contact: <ContactPage />, technical: <TechnicalPage /> };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        *{box-sizing:border-box}
        input::placeholder,textarea::placeholder{color:#55525e}
        input:focus,textarea:focus{border-color:${T.primary}!important;box-shadow:0 0 0 3px rgba(79,70,229,0.15)!important}
      `}</style>
      <Navbar page={page} setPage={setPage} />
      <main>{pages[page]}</main>
      <Footer />
    </div>
  );
}