import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Hero() {
  return (
    <main className="h-[100dvh] md:h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      {/* Theme Toggle */}
      <div className="absolute bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* soft gradient blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl"
             style={{background:'radial-gradient(circle,#F06BF2,transparent 60%)'}} />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl"
             style={{background:'radial-gradient(circle,#04588C,transparent 60%)'}} />
      </div>

      {/* Header Section */}
      <header className="flex-shrink-0 pt-2 md:py-4 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex justify-center">
          <Logo size="xl" />
        </div>
      </header>

      {/* Main Content Section - Centered */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 -mt-16 md:mt-0">
        <div className="max-w-6xl w-full text-center">
          {/* Hero Content */}
          <div className="mb-6 md:mb-16">
            {/* Main Headline */}
            <h1 className="font-extrabold tracking-tight text-8xl sm:text-9xl md:text-8xl lg:text-[12vw] leading-none mb-3 md:mb-2">
              Shame.
            </h1>
            
            {/* Subhead */}
            <p className="text-xl md:text-2xl text-center text-foreground/90 max-w-3xl mx-auto leading-relaxed">
              $WANKR is the world&apos;s first Shame-as-a-Service token.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-16 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
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
              className="w-full sm:w-auto h-16 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold rounded-lg border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
            >
              <a target="_blank" href="https://swap.cow.fi/#/8453/swap/ETH/Wankr">
                BUY $WANKR
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="flex-shrink-0 py-1 md:py-8 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex justify-center">
          <a
            href="https://x.com/wankergyatt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors duration-200"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-sm sm:text-base font-medium">@wankergyatt</span>
          </a>
        </div>
      </footer>
    </main>
  );
}