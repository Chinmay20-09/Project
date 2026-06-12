const GlassCard = ({ children, style = {}, hover = false }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        ...glass,
        borderRadius: 14,
        transition: "border-color 0.25s, box-shadow 0.25s",
        border: `1px solid ${hover && hovered ? T.primary : T.border}`,
        boxShadow: hover && hovered ? `inset 0 0 24px rgba(79,70,229,0.06)` : "none",
        ...style,
      }}
    >{children}</div>
  );
};

export default GlassCard;