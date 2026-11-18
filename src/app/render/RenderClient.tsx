"use client";

import { useEffect, useMemo, useState } from "react";
import ShopCanvas from "@/components/shop/ShopCanvas";
import { RENDER_SHOTS } from "@/data/renderShots";
import { ShopProvider, useShop } from "@/hooks/useShop";

function Stage({ name }: { name: string }) {
  const shot = RENDER_SHOTS[name] ?? RENDER_SHOTS.overview;
  const shop = useShop();
  useEffect(() => {
    if (shot.seating) shop.setSeating(shot.seating);
    if (shot.plan) shop.setView("plan");
    if (shot.open) shop.select(shot.open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pose = useMemo(() => shot.pose(shop.layout), [shot, shop.layout]);
  return (
    <div className="fixed inset-0 bg-[radial-gradient(120%_90%_at_50%_30%,#fff8ee_0%,#ffe9dc_55%,#f7d9d2_100%)]">
      <ShopCanvas active lowPower={false} reducedMotion interactive wheelZoom={false} onReady={() => undefined} overridePose={pose} hidePins quiet />
    </div>
  );
}

/** Headless-capture target: renders one fixed camera shot, no UI. */
export default function RenderClient() {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    setName(new URLSearchParams(window.location.search).get("shot") ?? "overview");
  }, []);
  if (!name) return null;
  return (
    <ShopProvider>
      <Stage name={name} />
    </ShopProvider>
  );
}
