import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PricingContent({
  ctaHref = "/dashboard",
}: {
  ctaHref?: string;
}) {
  return (
    <>
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Simple, Transparent <span className="text-primary">Pricing</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your study needs. Start for free and upgrade
          as you grow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PricingCard
          title="Free"
          price="$0"
          description="Perfect for casual study sessions and trying out our AI features."
          features={[
            "3 Study Kits per month",
            "Basic AI Summaries",
            "50 Flashcards per kit",
            "Community Support",
            "Standard AI Models",
          ]}
          buttonText="Get Started"
          variant="outline"
          href={ctaHref}
        />
        <PricingCard
          title="Pro"
          price="$9"
          period="/month"
          description="Our most popular plan for serious students who need more power."
          features={[
            "Unlimited Study Kits",
            "Advanced AI Tutor",
            "Exam Simulator",
            "Study Planner & Analytics",
            "Priority Email Support",
            "Faster Processing",
          ]}
          buttonText="Start Free Trial"
          variant="default"
          popular
          href={ctaHref}
        />
        <PricingCard
          title="Ultimate"
          price="$15"
          period="/month"
          description="For power users who want the absolute best AI models and features."
          features={[
            "Everything in Pro",
            "Premium Models (GPT-4o)",
            "Collaborative Study Rooms",
            "API Access",
            "Dedicated Support",
            "Beta Feature Access",
          ]}
          buttonText="Go Ultimate"
          variant="outline"
          href={ctaHref}
        />
      </div>

      <div className="mt-24 max-w-3xl mx-auto bg-surface border border-border rounded-2xl p-8 text-center space-y-6">
        <h3 className="text-2xl font-bold">
          Need a custom plan for your school?
        </h3>
        <p className="text-muted-foreground">
          We offer institutional licenses for schools and universities. Contact
          our sales team for a custom quote.
        </p>
        <Button variant="link" className="text-primary font-bold" asChild>
          <Link href="mailto:support@superstudentkit.com">Contact Sales →</Link>
        </Button>
      </div>
    </>
  );
}

function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  variant = "default",
  popular = false,
  href,
}: {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  variant?: "default" | "outline";
  popular?: boolean;
  href: string;
}) {
  return (
    <Card
      className={`relative flex flex-col transition-all duration-300 hover:shadow-xl ${
        popular
          ? "border-primary border-4 shadow-lg scale-105 bg-surface"
          : "hover:-translate-y-1 bg-surface"
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
            MOST POPULAR
          </span>
        </div>
      )}
      <CardHeader className="pt-8">
        <CardTitle className="text-3xl">{title}</CardTitle>
        <CardDescription className="min-h-[60px]">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-baseline mb-8">
          <span className="text-5xl font-bold">{price}</span>
          {period && (
            <span className="text-muted-foreground ml-1 text-xl">{period}</span>
          )}
        </div>
        <ul className="space-y-4">
          {features.map((feature) => (
            <li key={feature} className="flex items-start text-sm">
              <Check className="h-5 w-5 text-primary mr-3 shrink-0" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-6">
        <Button
          className="w-full h-12 text-base font-bold"
          variant={variant}
          asChild
        >
          <Link href={href}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
