import PageShell from "@/components/PageShell";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <PageShell>
      <section className="subpage-hero">
        <p className="eyebrow">Inloggen</p>
        <h1>Log in bij Studio SaGo.</h1>
        <p>Gebruik een magische link via e-mail.</p>
      </section>

      <LoginForm />
    </PageShell>
  );
}