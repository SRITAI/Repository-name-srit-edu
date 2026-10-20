export default function Loading() {
  return (
    <main
      id="main"
      className="loading-page"
      aria-busy="true"
      aria-label="Loading your space"
    >
      <span className="eyebrow muted">MAKING A LITTLE ROOM FOR YOU</span>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
    </main>
  );
}
