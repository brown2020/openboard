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
  ArrowRight,
  Github,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import OpenBoardLogo from "@/images/openboard_logoword.png";
import { cn } from "@/lib/utils";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Image
            src={OpenBoardLogo}
            alt="OpenBoard"
            width={180}
            height={50}
            className="h-10 w-auto brightness-0 invert"
          />
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/brown2020/openboard"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            {user ? (
              <Button asChild className="bg-white text-black hover:bg-white/90">
                <Link href="/boards">Go to Boards</Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" className="text-white hover:bg-white/10">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-white text-black hover:bg-white/90">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/70">100% Open Source</span>
            <a href="https://github.com/brown2020/openboard" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
              View on GitHub <ExternalLink className="w-3 h-3 inline" />
            </a>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="block">Your links.</span>
            <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Beautifully shared.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create stunning, shareable boards for your links, content, and projects. 
            No limits. No fees. Just pure creativity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {user ? (
              <Button size="lg" asChild className="h-14 px-8 text-lg bg-white text-black hover:bg-white/90 rounded-full">
                <Link href="/boards">
                  Open Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="h-14 px-8 text-lg bg-white text-black hover:bg-white/90 rounded-full group">
                  <Link href="/signup">
                    Start Creating
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" asChild className="h-14 px-8 text-lg text-white hover:bg-white/10 rounded-full border border-white/20">
                  <Link href="/login">
                    Sign In
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-8 text-sm text-white/40">
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">✓</span>
              Free forever
            </span>
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">✓</span>
              No credit card
            </span>
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">✓</span>
              Unlimited boards
            </span>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="relative z-10 container mx-auto px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-cyan-500/30 rounded-3xl blur-xl" />
            
            {/* Preview Card */}
            <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 p-1 rounded-2xl">
              <div className="bg-[#0a0a0a] rounded-xl p-8 min-h-[400px]">
                <div className="max-w-md mx-auto text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-2">@yourname</h3>
                  <p className="text-white/60 mb-8">Creator • Developer • Designer</p>
                  
                  <div className="space-y-3">
                    {["Portfolio", "Latest Project", "YouTube Channel", "Newsletter"].map((item, i) => (
                      <div
                        key={item}
                        className={cn(
                          "p-4 rounded-xl transition-all duration-300",
                          "bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02]",
                          "cursor-pointer"
                        )}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for the modern web
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
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
            <p className="text-xl text-white/60">
              Whether you're a creator, developer, or team
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
            <div className="relative bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-sm">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to get started?
              </h2>
              <p className="text-xl text-white/60 mb-8 max-w-lg mx-auto">
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

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white/40">
            <span>© 2025 OpenBoard</span>
            <span>•</span>
            <span>Open source & free forever</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/brown2020/openboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              Documentation
            </a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">
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
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
      <div className={cn(
        "inline-flex p-3 rounded-xl mb-4",
        `bg-gradient-to-br ${gradient}`
      )}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white/60">{description}</p>
    </div>
  );
}

function UseCaseCard({
  title,
  emoji,
  items,
}: {
  title: string;
  emoji: string;
  items: string[];
}) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
