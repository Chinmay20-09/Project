const Tag = ({ label }) => (
  <span style={{
    padding: "3px 10px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    background: T.surfaceHigher,
    border: `1px solid ${T.border}`,
    color: T.textMuted,
  }}>{label}</span>
);
export default Tag;