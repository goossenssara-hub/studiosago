import { BookOpenText, Calculator, Globe2, Languages } from "lucide-react";
import type { LearningSubject } from "@/lib/oefeningen/types";

const ICONS = {
  Taal: BookOpenText,
  Wiskunde: Calculator,
  Wereldoriëntatie: Globe2,
  Frans: Languages,
} satisfies Record<LearningSubject, typeof BookOpenText>;

export default function SubjectIcon({ subject }: { subject: LearningSubject }) {
  const Icon = ICONS[subject];
  return <Icon aria-hidden="true" strokeWidth={1.8} />;
}
