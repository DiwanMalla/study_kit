import { PricingContent } from "@/components/pricing/pricing-content";

export default function DashboardPricingPage() {
  return (
    <div className="max-w-[1200px] mx-auto p-6 md:p-10 pb-20">
      <PricingContent ctaHref="/dashboard" />
    </div>
  );
}
