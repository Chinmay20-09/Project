const ProjectCard = ({ proj }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...glass,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        border: `1px solid ${hovered ? T.primary : T.border}`,
        boxShadow: hovered ? `inset 0 0 24px rgba(79,70,229,0.06)` : "none",
        transition: "all 0.25s",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
        <img
          src={proj.img}
          alt={proj.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.05)" : "scale(1)", transition: "transform 0.5s" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0e0e10 0%, transparent 60%)", opacity: 0.7 }} />
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.text }}>{proj.title}</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ cursor: "pointer", color: T.textMuted, fontSize: 16 }} title="Code">&lt;/&gt;</span>
            <span style={{ cursor: "pointer", color: T.textMuted, fontSize: 16 }} title="Open">↗</span>
          </div>
        </div>
        <p style={{ margin: "0 0 16px", color: T.textMuted, fontSize: 14, lineHeight: 1.65, flex: 1 }}>{proj.desc}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
          {proj.tags.map(t => <Tag key={t} label={t} />)}
        </div>
        <button style={{
          width: "100%", padding: "10px", borderRadius: 8,
          background: T.surfaceHigher, border: `1px solid ${T.border}`,
          color: T.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer",
          transition: "background 0.2s, color 0.2s",
        }}
          onMouseEnter={e => { e.target.style.background = T.primary; e.target.style.color = "#fff"; }}
          onMouseLeave={e => { e.target.style.background = T.surfaceHigher; e.target.style.color = T.textMuted; }}
        >Details</button>
      </div>
    </div>
  );
};
export default ProjectCard;