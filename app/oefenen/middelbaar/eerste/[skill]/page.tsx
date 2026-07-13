import PageShell from "@/components/PageShell";
import OefenpaginaEersteMiddelbaarClient from "@/components/oefenen/middelbaar/OefenpaginaEersteMiddelbaarClient";

type PageProps = {
  params: Promise<{
    skill: string;
  }>;
};

export default async function EersteMiddelbaarSkillPage({
  params,
}: PageProps) {
  const { skill } = await params;

  return (
    <PageShell>
      <OefenpaginaEersteMiddelbaarClient skill={skill} />
    </PageShell>
  );
}
