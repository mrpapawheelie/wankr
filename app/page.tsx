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
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl" style={{background:'radial-gradient(circle,#F06BF2,transparent 60%)'}}></div>
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl" style={{background:'radial-gradient(circle,#04588C,transparent 60%)'}}></div>
      </div>

      {/* Main Content - Mobile First */}
      <section className="w-full max-w-6xl mx-auto px-4 pt-32 pb-20 text-center md:px-6 md:pt-48 md:pb-40">
        {/* Hero Section - Stacked on mobile, logo+WANKR at top on desktop */}
        <div className="flex flex-col items-center justify-center">
          {/* Logo + WANKR - Stacked on mobile, side-by-side on desktop */}
          <div className="flex flex-col items-center mb-8 md:flex-row md:gap-6 md:mb-12">
            <Logo size="xxl" className="mx-auto" />
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground mt-4 md:mt-0 md:text-6xl lg:text-8xl">
              WANKR
            </h2>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-6xl font-extrabold tracking-tight mb-4 text-foreground md:text-8xl lg:text-[12vw] md:mb-6">
            Shame.
          </h1>
          
          <p className="text-lg text-foreground/90 mb-8 max-w-[80%] mx-auto md:text-xl lg:text-3xl md:mb-12">
            $WANKR is the world&apos;s first Shame-as-a-Service token.
          </p>
        </div>

        {/* CTA Buttons - Stacked on mobile, row on desktop */}
        <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[80%] mx-auto md:flex-row md:gap-8">
          <Button 
            asChild
            size="lg"
            className="w-full h-14 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 md:w-64 md:h-16 md:text-xl"
            style={{background:'linear-gradient(135deg,#7630D9 0%,#04588C 100%)'}}
          >
            <a target="_blank" href="https://github.com/mrpapawheelie/wankr/blob/main/assets/WANKR_Whitepaper.pdf">
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
            <svg 
              className="w-5 h-5 fill-current" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-base font-medium md:text-lg">@wankergyatt</span>
          </a>
        </div>
      </section>
    </main>
  );
}
