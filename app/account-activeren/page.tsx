import PageShell from "@/components/PageShell";
import AccountActivationForm from "@/components/AccountActivationForm";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AccountActivationPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const initialError =
    typeof params.error === "string"
      ? params.error.trim()
      : "";

  return (
    <PageShell>
      <main className="account-activation-page">
        <AccountActivationForm initialError={initialError} />
      </main>
    </PageShell>
  );
}