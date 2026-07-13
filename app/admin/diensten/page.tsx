import AdminServices from "@/components/admin/AdminServices";

export const metadata = {
  title: "Diensten beheren | Studio SaGo Admin",
};

export const dynamic = "force-dynamic";

export default function DienstenAdminPage() {
  return (
    <main className="admin-page">
      <AdminServices />
    </main>
  );
}
