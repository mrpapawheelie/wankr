import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Hero() {
  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* soft gradient blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl"
             style={{background:'radial-gradient(circle,#F06BF2,transparent 60%)'}} />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl"
             style={{background:'radial-gradient(circle,#04588C,transparent 60%)'}} />
      </div>

      {/* Main Content */}
      <section className="w-full max-w-6xl mx-auto px-4 pt-32 pb-20 text-center md:px-6 md:pt-48 md:pb-40">
        {/* ALWAYS STACKED, CENTERED — sizes scale up on md+ */}
        <div className="flex flex-col items-center justify-center gap-6 md:gap-8">
          {/* Logo */}
          <div className="mb-2 md:mb-0">
            {/* make the logo big on md+ */}
            <Logo size="xxl" className="mx-auto scale-100 md:scale-125" />
          </div>

          {/* WANKR headline */}
          <h1
            className="
              font-extrabold tracking-tight
              text-6xl sm:text-6xl md:text-8xl lg:text-[10vw]
              leading-none
            "
          >
            Shame.
          </h1>

          {/* Subhead */}
          <p className="text-base sm:text-lg md:text-2xl text-foreground/90 max-w-[38rem]">
            $WANKR is the world’s first Shame-as-a-Service token.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 w-full max-w-[80%] mx-auto md:flex-row md:gap-8">
          <Button
            asChild
            size="lg"
            className="w-full h-14 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 md:w-64 md:h-16 md:text-xl"
            style={{ background: "linear-gradient(135deg,#7630D9 0%,#04588C 100%)" }}
          >
            <a
              target="_blank"
              href="https://github.com/mrpapawheelie/wankr/blob/main/assets/WANKR_Whitepaper.pdf"
            >
              Read Whitepaper
            </a>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="w-full h-14 text-lg font-bold rounded-lg border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all duration-300 md:w-64 md:h-16 md:text-xl"
          >
            <a target="_blank" href="https://swap.cow.fi/#/8453/swap/ETH/Wankr">
              BUY $WANKR
            </a>
          </Button>
        </div>

        {/* X (Twitter) Link */}
        <div className="mt-8 flex justify-center md:mt-12">
          <a
            href="https://x.com/wankergyatt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors duration-200"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-base font-medium md:text-lg">@wankergyatt</span>
          </a>
        </div>
      </section>
    </main>
  );
}