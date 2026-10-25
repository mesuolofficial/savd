import Link from "next/link";

export type FooterSite = { email: string | null; phone: string | null; address: string | null; facebook: string | null; instagram: string | null; twitter: string | null };

export function Footer({ site }: { site: FooterSite }) {
  const socials = [["Facebook", site.facebook], ["Instagram", site.instagram], ["Twitter / X", site.twitter]].filter(([, u]) => u) as [string, string][];
  
  return (
    <footer>
      <div className="wrap">
        <div className="g">
          <div>
            {/* LOGOS ADDED HERE */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <img src="/images/brand/logo.png" alt="SAVD" style={{ height: 48, objectFit: "contain" }} />
              <img src="/images/brand/uol-logo.png" alt="University of Lahore" style={{ height: 40, objectFit: "contain" }} />
            </div>
            <p style={{ marginTop: 10 }}>National Submersible Autonomous Vehicle Design Competition, organized by MES, University of Lahore.</p>
          </div>
          
          <div>
            <h4>Quick navigation</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/competitions">Competitions</Link></li>
              <li><Link href="/archives">Archives</Link></li>
              <li><Link href="/teams">Teams</Link></li>
              <li><Link href="/people">People</Link></li>
            </ul>
          </div>
          
          <div>
            <h4>Useful links</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/certificates/verify">Verify a certificate</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/privacy-policy">Privacy policy</Link></li>
              <li><Link href="/terms-of-service">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4>Contact</h4>
            {site.address ? <p>{site.address}</p> : null}
            {site.email ? <p><a href={`mailto:${site.email}`}>{site.email}</a></p> : null}
            {site.phone ? <p>{site.phone}</p> : null}
            {socials.length ? <p>{socials.map(([l, u], i) => <span key={l}>{i ? " · " : ""}<a href={u} target="_blank" rel="noopener noreferrer">{l}</a></span>)}</p> : null}
          </div>
        </div>
        <div className="bt">© {new Date().getFullYear()} SAVD · Mechanical Engineering Society, University of Lahore</div>
      </div>
    </footer>
  );
}