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

      {/* soft gradient blobs (optional, keep or remove) */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl"
             style={{background:'radial-gradient(circle,#F06BF2,transparent 60%)'}} />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl"
             style={{background:'radial-gradient(circle,#04588C,transparent 60%)'}} />
      </div>

      <section className="w-full max-w-6xl mx-auto px-4 pt-28 pb-20 md:pt-40 md:pb-32">
        {/* HEADER: Desktop = Logo + WANKR on one line; Mobile = stacked */}
        <header className="flex flex-col items-center justify-center gap-4 md:gap-6">
          {/* Logo */}
          <div className="w-[80vw] md:w-auto flex justify-center">
            <Logo className="mx-auto scale-100 md:scale-125" size="xxl" />
          </div>

          {/* WANKR wordmark */}
          <h1
            className="
              text-white leading-none tracking-tight text-center
              w-[80vw] md:w-auto
              text-5xl sm:text-6xl md:text-8xl lg:text-9xl
              font-extrabold
            "
          >
            WANKR
          </h1>
        </header>

        {/* Big 'Shame.' line below header on all breakpoints */}
        <div className="mt-6 md:mt-10 flex flex-col items-center text-center">
          <h2
            className="
              text-white leading-none tracking-tight
              w-[80vw] md:w-full
              text-5xl sm:text-6xl md:text-8xl lg:text-[10vw]
              font-extrabold
            "
          >
            Shame.
          </h2>

          {/* Optional subhead; remove if you don't want any copy here */}
          <p className="mt-4 md:mt-6 text-foreground/90 w-[80vw] md:w-[42rem] text-base sm:text-lg md:text-xl">
            $WANKR is the world&apos;s first Shame-as-a-Service token.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-10 md:mt-12 flex flex-col items-center justify-center gap-4 w-[80vw] md:w-auto mx-auto md:flex-row md:gap-8">
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
      </section>
    </main>
  );
}