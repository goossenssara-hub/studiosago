export type Season = "spring" | "summer" | "autumn" | "winter";

export type SeasonConfig = {
  season: Season;
  label: string;
  emoji: string;
  background: string;
  accent: string;
  softAccent: string;
  overlay: "blossoms" | "sunbeams" | "leaves" | "snow";
};

export function getSeason(date = new Date()): Season {
  const month = date.getMonth() + 1;

  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";

  return "winter";
}

export function getSeasonConfig(date = new Date()): SeasonConfig {
  const season = getSeason(date);

  const seasons: Record<Season, SeasonConfig> = {
    spring: {
      season: "spring",
      label: "Lente",
      emoji: "🌸",
      background: "/assets/backgrounds/spring.png",
      accent: "#ff9fc7",
      softAccent: "rgba(255, 159, 199, 0.16)",
      overlay: "blossoms",
    },
    summer: {
      season: "summer",
      label: "Zomer",
      emoji: "☀️",
      background: "/assets/backgrounds/summer.png",
      accent: "#fea020",
      softAccent: "rgba(254, 160, 32, 0.16)",
      overlay: "sunbeams",
    },
    autumn: {
      season: "autumn",
      label: "Herfst",
      emoji: "🍂",
      background: "/assets/backgrounds/autumn.png",
      accent: "#d6721d",
      softAccent: "rgba(214, 114, 29, 0.16)",
      overlay: "leaves",
    },
    winter: {
      season: "winter",
      label: "Winter",
      emoji: "❄️",
      background: "/assets/backgrounds/winter.png",
      accent: "#6ba9ff",
      softAccent: "rgba(107, 169, 255, 0.16)",
      overlay: "snow",
    },
  };

  return seasons[season];
}
