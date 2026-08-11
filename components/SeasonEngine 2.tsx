"use client";

import { useEffect, useState } from "react";
import { getSeasonConfig, type SeasonConfig } from "@/lib/seasonEngine";

type SeasonEngineProps = {
  children: React.ReactNode;
  effects?: boolean;
};

export default function SeasonEngine({
  children,
  effects = true,
}: SeasonEngineProps) {
  const [config, setConfig] = useState<SeasonConfig | null>(null);

  useEffect(() => {
    setConfig(getSeasonConfig());
  }, []);

  if (!config) {
    return <>{children}</>;
  }

  return (
    <div
      className={`season-engine season-${config.season}`}
      style={
        {
          backgroundImage: `url("${config.background}")`,
          "--season-accent": config.accent,
          "--season-soft": config.softAccent,
        } as React.CSSProperties
      }
    >
      {effects && <SeasonEffect type={config.overlay} />}

      {children}
    </div>
  );
}

function SeasonEffect({
  type,
}: {
  type: "blossoms" | "sunbeams" | "leaves" | "snow";
}) {
  if (type === "sunbeams") {
    return <div className="season-effect season-sunbeams" aria-hidden="true" />;
  }

  const symbols = {
    blossoms: ["✿", "●", "✿", "●", "✿", "●"],
    leaves: ["🍂", "🍁", "🍂", "🍁", "🍂", "🍁"],
    snow: ["✦", "❄", "✧", "❄", "✦", "❄"],
  }[type];

  return (
    <div className={`season-effect season-${type}`} aria-hidden="true">
      {symbols.map((symbol, index) => (
        <span key={`${type}-${index}`}>{symbol}</span>
      ))}
    </div>
  );
}
