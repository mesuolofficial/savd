export function MaintenanceScreen() {
  return (
    <div className="pub">
      <header className="hero dk" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "60px 0" }}>
        <div className="ghost">SAVD</div>
        <span className="ring" /><span className="ring" /><span className="ring" />
        <div className="wrap">
          <p className="ey" style={{ position: "relative" }}>Scheduled maintenance</p>
          <h1 style={{ marginTop: 18 }}>We&apos;ll be right back</h1>
          <p className="t">SAVD is being updated. Please check again shortly.</p>
        </div>
      </header>
    </div>
  );
}
