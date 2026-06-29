import PageShell from "@/components/PageShell";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Inloggen</p>
        <h1>Log in bij Studio SaGo.</h1>
        <p>Gebruik je e-mailadres en wachtwoord om naar je klantendashboard te gaan.</p>
      </section>

      <LoginForm />
    </PageShell>
  );
}