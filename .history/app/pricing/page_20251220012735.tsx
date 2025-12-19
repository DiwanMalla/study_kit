import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PricingContent } from "@/components/pricing/pricing-content";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <PricingContent ctaHref="/dashboard" />
      </main>
      <Footer />
    </div>
  );
}
