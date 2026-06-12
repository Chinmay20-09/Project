// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{
    background: T.surface,
    borderTop: `1px solid ${T.border}`,
    padding: "64px 24px",
    marginTop: 80,
  }}>
    <div style={{
      maxWidth: 1200, margin: "0 auto",
      display: "flex", flexWrap: "wrap", gap: 32,
      justifyContent: "space-between", alignItems: "center",
    }}>
      <div>
        <p style={{ margin: 0, fontWeight: 700, color: T.text, marginBottom: 4 }}>Chinmay Kolte</p>
        <p style={{ margin: 0, fontSize: 13, color: T.textMuted }}>© 2024 Chinmay Kolte. Built with precision.</p>
      </div>
      <div style={{ display: "flex", gap: 28 }}>
        {["GitHub", "LinkedIn", "Twitter", "Scholar"].map(l => (
          <a key={l} href="#" style={{ color: T.textMuted, textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = T.primary}
            onMouseLeave={e => e.target.style.color = T.textMuted}
          >{l}</a>
        ))}
      </div>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          width: 40, height: 40, borderRadius: "50%",
          border: `1px solid ${T.border}`, background: "none",
          color: T.primary, cursor: "pointer", fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "border-color 0.2s",
        }}
      >↑</button>
    </div>
  </footer>
);
export default Footer;