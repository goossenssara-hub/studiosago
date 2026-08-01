import PageShell from "@/components/PageShell";
import AdminTextCorrectionRequests from "@/components/admin/AdminTextCorrectionRequests";

export const dynamic = "force-dynamic";

export default function AdminTextCorrectionRequestsPage() {
  return (
    <PageShell>
      <main
        style={{
          width: "min(1180px, calc(100% - 32px))",
          margin: "42px auto 90px",
        }}
      >
        <AdminTextCorrectionRequests />
      </main>
    </PageShell>
  );
}
