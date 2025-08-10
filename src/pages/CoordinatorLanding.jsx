import CoordinatorNavbar from "../components/CoordinatorNavbar";
import CoordinatorHero from "../components/CoordinatorHero";
import CoordinatorAudience from "../components/CoordinatorAudience";

export default function CoordinatorLanding({ onLogout, user }) {
  return (
    <div className="min-h-screen bg-white">
      <CoordinatorNavbar onLogout={onLogout} />
      <CoordinatorHero />
      <CoordinatorAudience />
    </div>
  );
}
