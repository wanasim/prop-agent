import { ArrowRight, BarChart3, Bot, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { HydrateClient } from "~/trpc/server";

const features = [
  {
    icon: Bot,
    title: "AI Agents",
    description:
      "Create intelligent agents to automate property management tasks and tenant interactions.",
  },
  {
    icon: CreditCard,
    title: "Rental Payments",
    description: "Streamline rent collection with automated payment processing and tracking.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Get detailed insights into your property performance and tenant behavior.",
  },
] as const;

export default function HomePage() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col bg-background">
        {/* Hero Section */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Prop Agent
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
            The intelligent platform for property owners to manage their rental properties through
            AI-powered agents.
          </p>
          <Link href="/dashboard" className="cursor-pointer">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="container bg-secondary rounded-2xl mx-auto px-8 py-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Key Features</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-none bg-card backdrop-blur-sm">
                  <CardHeader>
                    <Icon className="mb-2 h-8 w-8 text-primary" />
                    <CardTitle className="text-foreground">{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-4 py-16">
          <div className="container mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Ready to Transform Your Property Management?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join Prop Agent today and experience the future of property management.
            </p>
            <Link href="/dashboard" className="cursor-pointer">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Start Managing Smarter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
