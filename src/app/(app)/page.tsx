"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Zap,
  BarChart3,
  Palette,
  Lock,
  Globe,
  Users,
  Layout,
} from "lucide-react";
import OpenBoardLogo from "@/images/openboard_logoword.png";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <Image
              src={OpenBoardLogo}
              alt="OpenBoard"
              width={300}
              height={80}
              className="h-20 object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Create. Share. Connect.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The open-source platform to create beautiful, shareable boards for
            your links, content, and projects.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/boards">Go to My Boards</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/signup">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Started Free
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                  asChild
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • Unlimited boards • Forever free
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Everything you need, nothing you don&apos;t
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Layout className="w-8 h-8" />}
            title="Flexible Layouts"
            description="Create boards with custom layouts. Grid, single column, or masonry style."
          />
          <FeatureCard
            icon={<Palette className="w-8 h-8" />}
            title="Beautiful Themes"
            description="Choose from stunning presets or customize every color and style."
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="AI-Powered"
            description="Get intelligent suggestions for content, layouts, and SEO optimization."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Built-in Analytics"
            description="Track views, clicks, and engagement without external tools."
          />
          <FeatureCard
            icon={<Globe className="w-8 h-8" />}
            title="Custom Domains"
            description="Use your own domain for a professional branded experience."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Collaboration"
            description="Invite team members to edit and manage boards together."
          />
          <FeatureCard
            icon={<Lock className="w-8 h-8" />}
            title="Privacy Controls"
            description="Public, unlisted, or password-protected boards. You decide."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Lightning Fast"
            description="Built with Next.js for blazing fast performance and SEO."
          />
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Built for everyone
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <UseCaseCard
            title="Creators"
            description="Share all your content in one beautiful link. Perfect for Instagram, TikTok, and YouTube bios."
            examples={[
              "Social links",
              "Latest videos",
              "Shop links",
              "Newsletter signup",
            ]}
          />
          <UseCaseCard
            title="Developers"
            description="Showcase your portfolio, projects, and contact info in a clean, professional page."
            examples={[
              "GitHub repos",
              "Portfolio",
              "Blog posts",
              "Contact form",
            ]}
          />
          <UseCaseCard
            title="Teams"
            description="Create shared resource boards, onboarding guides, and team directories."
            examples={["Resources", "Tools", "Team links", "Documentation"]}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to create your board?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of creators, developers, and teams using OpenBoard to
          share their content.
        </p>

        {!user && (
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/signup">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Building for Free
            </Link>
          </Button>
        )}
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 OpenBoard. Open source and free forever.
          </div>
          <div className="flex gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Community
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function UseCaseCard({
  title,
  description,
  examples,
}: {
  title: string;
  description: string;
  examples: string[];
}) {
  return (
    <div className="p-6 rounded-lg bg-card border">
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <ul className="space-y-2">
        {examples.map((example) => (
          <li key={example} className="text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {example}
          </li>
        ))}
      </ul>
    </div>
  );
}
