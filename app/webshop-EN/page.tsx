import PageShell from "@/components/PageShell";
import EnglishDigitalWebshop, { type EnglishDigitalProduct } from "@/components/EnglishDigitalWebshop";

export const revalidate = 300;

const products: EnglishDigitalProduct[] = [
  {
    id: "studio-sago-discovery-board-en-free",
    title: "Studio SaGo Discovery Board",
    subtitle: "A playful educational board game for learning, moving and exploring together.",
    description: "A ready-to-print discovery game with 65 varied language, maths, thinking and movement challenges. Download, print and play at home or in the classroom.",
    href: "/downloads/studio-sago-discovery-board-en.pdf",
    image_url: "/images/studio-sago-discovery-board-en-cover.png",
    button_text: "Free download",
    event_dates: "Free PDF download",
    price: 0,
  },
  {
    id: "studio-sago-memory-game-en-free",
    title: "Discovery Board Memory Game",
    subtitle: "A printable memory game designed to be used with the Studio SaGo Discovery Board.",
    description: "Children practise observation, memory, vocabulary and concentration while matching the illustrated cards from the Discovery Board.",
    href: "/downloads/studio-sago-memory-game-en.pdf",
    image_url: "/images/studio-sago-memory-game-en-cover.png",
    button_text: "Free download",
    event_dates: "Free PDF download",
    price: 0,
  },
];

export default function EnglishWebshopPage() {
  return <PageShell locale="en"><EnglishDigitalWebshop products={products} /></PageShell>;
}
