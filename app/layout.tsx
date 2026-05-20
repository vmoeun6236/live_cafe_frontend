import type { Metadata } from "next";
import { Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";

const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | LiveCafe POS",
    default: "LiveCafe - Premium Multi-Floor Restaurant POS",
  },
  description: "LiveCafe - Next-Generation Multi-Floor Point of Sale & Self-Service Ordering Platform",
};

import { AuthProvider } from "@/components/auth-provider";
import Providers from "@/context/Providers";
import RealTimeNotificationProvider from "@/components/RealTimeNotificationProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${kantumruy.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <Providers>
              <RealTimeNotificationProvider>
                {children}
              </RealTimeNotificationProvider>
            </Providers>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
