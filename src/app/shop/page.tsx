import type { Metadata } from "next";
import { FullShopExperience } from "@/components/shop/FullShopExperience";

export const metadata: Metadata = {
  title: "Explore the shop in 3D — Creamio",
  description: "A full-screen, true-to-scale 3D model of the Creamio shop. Resize the room, open the freezers, click every machine.",
};

export default function ShopPage() {
  return <FullShopExperience />;
}
