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
      
      {/* Header with Logo */}
      <header className="absolute top-0 left-0 right-0 z-10 p-8">
        <div className="flex items-center justify-center">
          <Logo size="xxl" />
        </div>
      </header>
      
      {/* soft gradient blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl" style={{background:'radial-gradient(circle,#F06BF2,transparent 60%)'}}></div>
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl" style={{background:'radial-gradient(circle,#04588C,transparent 60%)'}}></div>
      </div>

      {/* center hero */}
      <section className="max-w-6xl mx-auto px-6 pt-48 pb-40 text-center">
        {/* Shame Statement */}
        <h1 className="text-[14vw] leading-none font-extrabold tracking-tight mb-0 text-foreground">
          Shame.
        </h1>
        <p className="text-xl md:text-3xl text-foreground/90 mb-12">
          $WANKR is the world&apos;s first Shame-as-a-Service token.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-12">
          <Button 
            asChild
            size="lg"
            className="w-64 h-16 text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
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
            className="w-64 h-16 text-xl font-bold rounded-lg border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
          >
            <a target="_blank" href="https://swap.cow.fi/#/8453/swap/ETH/Wankr">
              BUY $WANKR
            </a>
          </Button>
        </div>

        {/* X (Twitter) Link */}
        <div className="mt-12 flex justify-center">
          <a 
            href="https://x.com/wankergyatt" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors duration-200"
          >
            <svg 
              className="w-6 h-6" 
              fill="currentColor" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-lg font-medium">@wankergyatt</span>
          </a>
        </div>
      </section>
    </main>
  );
}
