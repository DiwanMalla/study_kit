import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Brain,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  Users,
  ArrowRight,
  Check,
  Zap,
  Target,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const { userId } = auth();
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Study Companion</span>
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                New
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
              Study Smarter,
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Not Harder
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Transform your lecture slides and notes into powerful study
              materials. Get AI-generated summaries, flashcards, practice exams,
              and a personal tutor available 24/7.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="h-12 px-8 text-base gap-2 group"
                asChild
              >
                <Link href="/dashboard">
                  Start for Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="#features">See How It Works</Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary border-2 border-background"
                    />
                  ))}
                </div>
                <span>Join 10,000+ students</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-border" />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 fill-yellow-400"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              value="10,000+"
              label="Active Students"
            />
            <StatCard
              icon={<BookOpen className="h-5 w-5" />}
              value="500K+"
              label="Study Kits Created"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              value="2M+"
              label="Hours Saved"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              value="94%"
              label="Grade Improvement"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <Zap className="h-4 w-4" />
              Powerful Features
            </div>
            <h2 className="text-4xl font-bold tracking-tight">
              Everything You Need to{" "}
              <span className="text-primary">Ace Your Exams</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Stop wasting time organizing notes. Let our AI transform your
              materials into a complete study kit in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Instant Summaries"
              description="Turn 100-page PDFs into concise, easy-to-read summaries. Focus on what actually matters for your exams."
              gradient="from-blue-500/20 to-cyan-500/20"
            />
            <FeatureCard
              icon={<Brain className="h-6 w-6" />}
              title="Smart Flashcards"
              description="AI generates flashcards from your slides automatically. Study with proven spaced repetition techniques."
              gradient="from-purple-500/20 to-pink-500/20"
            />
            <FeatureCard
              icon={<GraduationCap className="h-6 w-6" />}
              title="Exam Simulator"
              description="Practice with AI-generated multiple choice and essay questions tailored to your specific course material."
              gradient="from-orange-500/20 to-red-500/20"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="AI Tutor"
              description="Stuck on a concept? Chat with an AI tutor that actually knows your lecture material inside and out."
              gradient="from-green-500/20 to-emerald-500/20"
            />
            <FeatureCard
              icon={<LayoutDashboard className="h-6 w-6" />}
              title="Study Planner"
              description="Get a personalized study schedule based on your exam dates, material difficulty, and learning pace."
              gradient="from-yellow-500/20 to-orange-500/20"
            />
            <FeatureCard
              icon={<Target className="h-6 w-6" />}
              title="Progress Tracking"
              description="Monitor your learning progress with detailed analytics. Know exactly where you need to focus more."
              gradient="from-indigo-500/20 to-purple-500/20"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              step="01"
              title="Upload Your Materials"
              description="Drop your PDFs, slides, or notes. We support all major formats."
            />
            <StepCard
              step="02"
              title="AI Processes Content"
              description="Our AI analyzes and transforms your materials into study tools."
            />
            <StepCard
              step="03"
              title="Start Studying"
              description="Access summaries, flashcards, quizzes, and your AI tutor instantly."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Simple Pricing
            </div>
            <h2 className="text-4xl font-bold tracking-tight">
              Choose Your <span className="text-primary">Study Plan</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Start for free, upgrade when you need more power. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              title="Free"
              price="$0"
              description="Perfect for trying it out"
              features={[
                "3 Study Kits per month",
                "Basic AI Summaries",
                "50 Flashcards",
                "Community Support",
              ]}
              buttonText="Get Started"
              variant="outline"
            />
            <PricingCard
              title="Pro"
              price="$9"
              period="/month"
              description="For serious students"
              features={[
                "Unlimited Study Kits",
                "Advanced AI Tutor",
                "Exam Simulator",
                "Study Planner",
                "Priority Support",
              ]}
              buttonText="Start Pro Trial"
              variant="default"
              popular
            />
            <PricingCard
              title="Ultimate"
              price="$15"
              period="/month"
              description="Maximum power"
              features={[
                "Everything in Pro",
                "GPT-4 & Claude Models",
                "Group Study Rooms",
                "API Access",
                "Dedicated Support",
              ]}
              buttonText="Go Ultimate"
              variant="outline"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold tracking-tight">
              Ready to Transform Your Study Routine?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of students who are already studying smarter, not
              harder.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-8 text-base gap-2 group"
              asChild
            >
              <Link href="/dashboard">
                Get Started for Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div className="p-2 rounded-full bg-primary/10 text-primary">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Card className="group relative overflow-hidden border-0 bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <CardHeader className="relative">
        <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/10 text-primary w-fit">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-background border">
      <div className="text-6xl font-bold text-primary/20 mb-4">{step}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
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
}: {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  popular?: boolean;
}) {
  return (
    <Card
      className={`relative flex flex-col transition-all duration-300 hover:shadow-xl ${
        popular
          ? "border-primary shadow-lg scale-105 bg-gradient-to-b from-primary/5 to-background"
          : "hover:-translate-y-1"
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
            Most Popular
          </span>
        </div>
      )}
      <CardHeader className="pt-8">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-baseline mb-8">
          <span className="text-5xl font-bold">{price}</span>
          {period && (
            <span className="text-muted-foreground ml-1 text-lg">{period}</span>
          )}
        </div>
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center text-sm">
              <Check className="h-5 w-5 text-primary mr-3 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button className="w-full h-12" variant={variant} size="lg">
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
