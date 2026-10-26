import { externalUrl } from "@/lib/url";

type Props = {
  name: string;
  logo?: string | null;
  /** kept so existing callers still compile; no longer displayed */
  tier?: string;
  url?: string | null;
  /** "md" = home page strip, "lg" = wide cards for the Sponsors page */
  size?: "md" | "lg";
};

export function SponsorCard({ name, logo, url, size = "md" }: Props) {
  const href = externalUrl(url);
  const d = size === "lg" ? { w: 210, h: 96, logo: 50, pad: 10, gap: "0 10px" } : { w: 240, h: 110, logo: 60, pad: 12, gap: "0 10px" };

  const style: React.CSSProperties = {
    width: d.w,
    height: d.h,
    background: "#fff",
    borderRadius: size === "lg" ? 14 : 16,
    border: size === "lg" ? "1px solid var(--line)" : undefined,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: d.pad,
    margin: d.gap,
    flexShrink: 0,
    color: "#14202b",
    textDecoration: "none",
  };

  const body = (
    <>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} style={{ maxHeight: d.logo, maxWidth: "100%", objectFit: "contain" }} />
      ) : (
        <span style={{ fontFamily: "var(--font-display)", fontSize: size === "lg" ? 17 : 20, fontWeight: 700, textAlign: "center" }}>{name}</span>
      )}
      {logo || href ? (
        <span
          style={{
            fontSize: size === "lg" ? 11 : 12,
            fontWeight: 600,
            color: "#5d6d7a",
            marginTop: size === "lg" ? 6 : 8,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {logo ? name : "Visit website"}
          {href ? " ↗" : ""}
        </span>
      ) : null}
    </>
  );

  if (!href) return <div style={style}>{body}</div>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} (opens website in a new tab)`}
      style={{ ...style, cursor: "pointer" }}
      className="transition duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      {body}
    </a>
  );
}