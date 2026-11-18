import { HeroSection } from "@/components/hero/HeroSection";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { MenuSection } from "@/components/menu/MenuSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FreshPreparation } from "@/components/sections/FreshPreparation";
import { ShopGallery } from "@/components/sections/ShopGallery";
import { ShopSection } from "@/components/shop/ShopSection";
import { ShopProvider } from "@/hooks/useShop";

export default function Home() {
  return (
    <ShopProvider>
      <Navbar />
      <main>
        <HeroSection />
        <ShopSection />
        <MenuSection />
        <FreshPreparation />
        <ShopGallery />
        <ContactSection />
      </main>
      <Footer />
    </ShopProvider>
  );
}
