"use client";

import { useAuth } from "@/hooks/use-auth";
import { FeatureCard, UseCaseCard } from "./home-cards";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BarChart3,
  ChevronRight,
  Globe,
  Layout,
  Lock,
  Palette,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export function HomeLowerSections() {
  const { user } = useAuth();
  return (
    <>
      {/* Features Grid */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for the modern web
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, customize, and share your boards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Layout className="w-6 h-6" />}
            title="Flexible Layouts"
            description="Grid, single column, or masonry. Your choice."
            gradient="from-violet-500 to-purple-500"
          />
          <FeatureCard
            icon={<Palette className="w-6 h-6" />}
            title="Beautiful Themes"
            description="Stunning presets or fully custom colors."
            gradient="from-fuchsia-500 to-pink-500"
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI-Powered"
            description="Smart suggestions for content & SEO."
            gradient="from-cyan-500 to-blue-500"
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Built-in Analytics"
            description="Track views, clicks, and engagement."
            gradient="from-amber-500 to-orange-500"
          />
          <FeatureCard
            icon={<Globe className="w-6 h-6" />}
            title="Custom Domains"
            description="Use your own domain for branding."
            gradient="from-emerald-500 to-teal-500"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Collaboration"
            description="Invite team members to edit together."
            gradient="from-blue-500 to-indigo-500"
          />
          <FeatureCard
            icon={<Lock className="w-6 h-6" />}
            title="Privacy Controls"
            description="Public, unlisted, or password-protected."
            gradient="from-red-500 to-rose-500"
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Lightning Fast"
            description="Built with Next.js for blazing speed."
            gradient="from-yellow-500 to-amber-500"
          />
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Made for everyone
            </h2>
            <p className="text-xl text-muted-foreground">
              Whether you&apos;re a creator, developer, or team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <UseCaseCard
              title="Creators"
              emoji="🎨"
              items={["Social links", "Latest content", "Merch shop", "Newsletter"]}
            />
            <UseCaseCard
              title="Developers"
              emoji="💻"
              items={["GitHub repos", "Portfolio", "Blog posts", "Contact form"]}
            />
            <UseCaseCard
              title="Teams"
              emoji="👥"
              items={["Resources", "Tools", "Team links", "Documentation"]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
            <div className="relative bg-muted/50 border border-border rounded-3xl p-12 backdrop-blur-sm">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to get started?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of creators building beautiful boards with OpenBoard.
              </p>
              {!user && (
                <Button size="lg" asChild className="h-14 px-10 text-lg bg-white text-black hover:bg-white/90 rounded-full group">
                  <Link href="/signup">
                    Create Your Board
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
