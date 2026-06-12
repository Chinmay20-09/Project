import { useState, useEffect } from "react";
// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { id: "home", label: "Home" },
    { id: "projects", label: "Projects" },
    { id: "products", label: "Products" },
    { id: "blog", label: "Blog" },
    { id: "resume", label: "Resume" },
    { id: "contact", label: "Contact" },
    { id: "technical", label: "Experience" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 64,
      background: scrolled ? "rgba(14,14,16,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent",
      transition: "all 0.3s",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button
          onClick={() => setPage("home")}
          style={{ background: "none", border: "none", cursor: "pointer", color: T.text, fontWeight: 700, fontSize: 15, fontFamily: "'Geist', monospace" }}
        >Chinmay Kolte</button>

        <div style={{ display: "flex", gap: 32 }}>
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => setPage(l.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                color: page === l.id ? T.primary : T.textMuted,
                borderBottom: page === l.id ? `2px solid ${T.primary}` : "2px solid transparent",
                paddingBottom: 2,
                transition: "color 0.2s, border-color 0.2s",
              }}
            >{l.label}</button>
          ))}
        </div>

        <div style={{ width: 80, display: "flex", justifyContent: "flex-end" }}>
          <span style={{ color: T.primary, fontSize: 20, cursor: "pointer" }}>☽</span>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;