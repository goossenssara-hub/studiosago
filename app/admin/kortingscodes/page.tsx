import DiscountCodesAdmin from "@/components/DiscountCodesAdmin";

export const metadata = {
  title: "Kortingscodes | Studio SaGo Admin",
};

export default function KortingscodesPage() {
  return (
    <main className="admin-page">
      <DiscountCodesAdmin />
    </main>
  );
}