import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TOAST_DURATION } from "@/helpers/confirmableDelete";
import { ThemeProvider } from "@/components/ThemeProvider";
import CommandMenu from "@/components/CommandDialog";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ServiceProvider } from "@/components/ServicesProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat note",
  description: "Take notes in chat",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  async function redirectGuestToSignIn() {
    const { redirectToSignIn, userId } = await auth();

    if (!userId) {
      return redirectToSignIn();
    }
  }
  const rest = await auth();
  const token = await rest.getToken({ template: "convex" });
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#000000" />
          <link rel="apple-touch-icon" href="/logo.svg" />
          <meta name="apple-mobile-web-app-status-bar" content="#000000" />
          <link rel="icon" href="/logo-white.svg" type="image/svg+xml" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen`}
        >
          <ConvexClientProvider
            orgId={rest.orgId as string}
            orgRole={rest.orgRole as string}
            token={token as string}
          >
            {redirectGuestToSignIn()}
            <ServiceProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <CommandMenu />
                <Toaster position="top-right" duration={TOAST_DURATION} />
              </ThemeProvider>
            </ServiceProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
