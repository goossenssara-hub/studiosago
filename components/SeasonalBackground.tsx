"use client";

import { useEffect, useState } from "react";
import { getSeason, getSeasonBackground, type Season } from "@/lib/getSeason";

type SeasonalBackgroundProps = {
  children: React.ReactNode;
};

export default function SeasonalBackground({ children }: SeasonalBackgroundProps) {
  const [season, setSeason] = useState<Season>("summer");

  useEffect(() => {
    setSeason(getSeason());
  }, []);

  return (
    <div
      className={`seasonal-page seasonal-${season}`}
      style={{
        backgroundImage: `url("${getSeasonBackground(season)}")`,
      }}
    >
      {children}
    </div>
  );
}
