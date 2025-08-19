import type { Metadata } from "next";
import "./globals.css";
import { Mouse_Memoirs } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const mouseMemoirs = Mouse_Memoirs({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mouse-memoirs",
});

export const metadata: Metadata = {
  title: "WANKR - Shame-as-a-Service Token",
  description: "The world's first Shame-as-a-Service token. $WANKR",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={mouseMemoirs.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
