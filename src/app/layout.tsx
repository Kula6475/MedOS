import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeInitializer } from "@/components/settings/theme-initializer";
import { MedOSCopilotProvider } from "@/components/copilot/medos-copilot";
import "@copilotkit/react-core/v2/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "MedOS",
    template: "%s | MedOS",
  },
  description:
    "A synthetic clinical decision support command center for emergency department operations.",
  keywords: [
    "emergency department operations",
    "clinical decision support",
    "trustworthy AI",
    "hospital operations",
    "AI observability",
  ],
  openGraph: {
    title: "MedOS — Emergency care, orchestrated",
    description:
      "An AI-powered emergency operations platform with evaluation built into every recommendation.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1672,
        height: 941,
        alt: "MedOS — Emergency care, orchestrated",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MedOS — Emergency care, orchestrated",
    description:
      "Fireworks powers the intelligence; Braintrust builds trust.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeInitializer />
        <MedOSCopilotProvider
          configured={Boolean(process.env.FIREWORKS_API_KEY)}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </MedOSCopilotProvider>
      </body>
    </html>
  );
}
