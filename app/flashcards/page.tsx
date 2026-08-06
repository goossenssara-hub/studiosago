import FlashcardTrainer from "@/components/FlashcardTrainer";
import { flashcardSets } from "@/data/flashcards";

export default function FlashcardsPage() {
  return <FlashcardTrainer sets={flashcardSets} />;
}
