import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { CalendarDays, MessageSquare, Sparkles, BarChart3 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import redditLogo from "@/assets/reddit-logo.png";
import xLogo from "@/assets/x-logo.png";
import linkedinLogo from "@/assets/linkedin-logo.png";
import facebookLogo from "@/assets/facebook-logo.png";

const LogoImage = ({ src, alt }: { src: string; alt: string }) => (
  <img
    src={src}
    alt={alt}
    className="h-6 w-6 object-contain opacity-80"
    loading="lazy"
    decoding="async"
  />
);

const Landing = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-surface-1/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
              <span className="text-primary-foreground font-bold">W</span>
            </div>
            <span className="text-foreground text-lg font-bold">WunPub</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild variant="default">
                <Link to="/app">Open App</Link>
              </Button>
            ) : (
              <Button asChild variant="default">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground shadow-wun-sm">
              Social publishing, unified
            </div>
            <h1 className="mt-4 bg-gradient-primary bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent md:text-5xl">
              Plan, create and publish across platforms—without the chaos
            </h1>
            <p className="mt-4 text-muted-foreground md:text-lg">
              WunPub brings content calendars, templates, inbox, and analytics together so your team can ship social content faster across Reddit, X/Twitter, Facebook, and LinkedIn.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="shadow-wun-brand">
                <Link to={user ? "/app" : "/auth"}>{user ? "Open the App" : "Get Started Free"}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#features">Explore features</a>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4 opacity-80">
              <LogoImage src={redditLogo} alt="Reddit" />
              <LogoImage src={xLogo} alt="X/Twitter" />
              <LogoImage src={facebookLogo} alt="Facebook" />
              <LogoImage src={linkedinLogo} alt="LinkedIn" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-2xl bg-brand-gradient opacity-20 blur-2xl" />
            <div className="rounded-xl border border-border/60 bg-card/70 p-4 shadow-wun-lg">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-surface-1 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CalendarDays className="h-4 w-4 text-brand" />
                    Content Calendar
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Plan posts, manage cadence, and keep your schedule on track.
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-surface-1 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-brand" />
                    Templates
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Reusable templates for campaigns, series, and repeating updates.
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-surface-1 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="h-4 w-4 text-brand" />
                    Unified Inbox
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Reply from one place. Stay on top of mentions and DMs.
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-surface-1 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <BarChart3 className="h-4 w-4 text-brand" />
                    Analytics
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Measure engagement and growth across networks with clear insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border/50 bg-surface-1/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold tracking-tight">Everything you need to run social</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            From drafting to publishing to analysis, WunPub keeps your workflows simple and collaborative.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-card/70 p-6 shadow-wun-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CalendarDays className="h-4 w-4 text-brand" /> Plan ahead
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Visual calendar with drag-and-drop scheduling across platforms.
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card/70 p-6 shadow-wun-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-brand" /> Create fast
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Save time with templates, media reuse, and post previews.
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card/70 p-6 shadow-wun-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="h-4 w-4 text-brand" /> Learn what works
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Get engagement insights and growth trends at a glance.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Button asChild size="lg" className="shadow-wun-brand">
              <Link to={user ? "/app" : "/auth"}>{user ? "Go to your Dashboard" : "Start publishing"}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-surface-1/60">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
                <span className="text-primary-foreground font-bold">W</span>
              </div>
              <span className="text-foreground font-semibold">WunPub</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/auth" className="hover:text-foreground">Sign in</a>
              <a href="/settings" className="hover:text-foreground">Settings</a>
              <a href="/" className="hover:text-foreground">Home</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

