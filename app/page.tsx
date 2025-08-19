import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Hero() {
  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Simple Theme Toggle for Testing */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Header with Logo - Mobile First */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-8">
        <div className="flex items-center justify-center">
          <Logo size="xxl" />
        </div>
      </header>
      
      {/* soft gradient blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl" style={{background:'radial-gradient(circle,#F06BF2,transparent 60%)'}}></div>
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl" style={{background:'radial-gradient(circle,#04588C,transparent 60%)'}}></div>
      </div>

      {/* center hero - Mobile First Layout */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 sm:pt-48 pb-20 sm:pb-40 text-center">
        {/* Logo at Top */}
        <div className="mb-8 sm:mb-12">
          <Logo size="xl" className="mx-auto" />
        </div>
        
        {/* WANKR Text */}
        <h2 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-4 sm:mb-6 text-foreground">
          WANKR
        </h2>
        
        {/* Shame Statement */}
        <h1 className="text-6xl sm:text-8xl md:text-[14vw] leading-none font-extrabold tracking-tight mb-4 sm:mb-6 text-foreground">
          Shame.
        </h1>
        
        <p className="text-lg sm:text-xl md:text-3xl text-foreground/90 mb-8 sm:mb-12 max-w-[80%] mx-auto">
          $WANKR is the world&apos;s first Shame-as-a-Service token.
        </p>

        {/* CTA Buttons - Stacked on Mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 w-full max-w-[80%] mx-auto">
          <Button 
            asChild
            size="lg"
            className="w-full sm:w-64 h-14 sm:h-16 text-lg sm:text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
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
            className="w-full sm:w-64 h-14 sm:h-16 text-lg sm:text-xl font-bold rounded-lg border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
          >
            <a target="_blank" href="https://swap.cow.fi/#/8453/swap/ETH/Wankr">
              BUY $WANKR
            </a>
          </Button>
        </div>

        {/* X (Twitter) Link */}
        <div className="mt-8 sm:mt-12 flex justify-center">
          <a 
            href="https://x.com/wankergyatt" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors duration-200"
          >
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6" 
              fill="currentColor" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-base sm:text-lg font-medium">@wankergyatt</span>
          </a>
        </div>
      </section>
    </main>
  );
}
