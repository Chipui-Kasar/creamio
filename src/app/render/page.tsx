import type { Metadata } from "next";
import RenderClient from "./RenderClient";

export const metadata: Metadata = { title: "Render", robots: { index: false, follow: false } };

export default function RenderPage() {
  return <RenderClient />;
}
