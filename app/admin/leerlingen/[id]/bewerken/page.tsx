import EditStudentClient from "@/components/admin/EditStudentClient";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditStudentPage({ params }: PageProps) {
  const { id } = await params;

  return <EditStudentClient studentId={id} />;
}
