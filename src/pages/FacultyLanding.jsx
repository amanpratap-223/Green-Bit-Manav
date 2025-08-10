export default function FacultyLanding({ onLogout, user }) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Faculty Landing Page</h1>
      <p>Welcome, {user?.name} ({user?.email})</p>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
