"use client";
import "@/app/globals.css"
import { Metadata } from "next"
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import Providers from "./Providers"
import { AuthOptions, Connect } from "@stacks/connect-react";
import { UserSession, AppConfig } from "@stacks/auth";
import { useEffect } from "react"
import { AppContextProvider } from "../components/AppContext";
import { useState } from "react";
import { BasketProvider } from "@/context/BasketContext";


const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'sBTC Portfolio',
//   description: 'Track and manage your sBTC positions on the Stacks blockchain',
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon-16x16.png",
//     apple: "/apple-touch-icon.png",
//   },
// }

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {

  const [userData, setUserData] = useState({});
  
  const appConfig = new AppConfig(
    ["store_write", "publish_data"],
    "https://app.stackingdao.com"
  );
  const userSession = new UserSession({ appConfig });
  const authOptions: AuthOptions = {
    redirectTo: "/",
    userSession,
    onFinish: ({ userSession }) => {
      const userData = userSession.loadUserData();
      setUserData(userData);
    },
    appDetails: {
      name: "Stacking Tracker - All your PoX needs in one place",
      icon: "https://stackingdao.com/_next/static/media/logo.00ae0d9a.png",
    },
  };

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setUserData(userData);
    }
  }, []);

  const signOut = () => {
    userSession.signUserOut();
    localStorage.removeItem("stacking-tracker-sign-provider");
    window.location.href = "/";
  };

  const handleRedirectAuth = async () => {
    if (userSession.isSignInPending()) {
      const userData = await userSession.handlePendingSignIn();
      setUserData(userData);
    }
  };

  useEffect(() => {
    void handleRedirectAuth();
  }, []);


  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
          inter.className
        )}
      >

          <Connect authOptions={authOptions}>

            <AppContextProvider userData={userData}>
      <Providers>
        <BasketProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <div className="flex-1">{children}</div>
            </div>
            <TailwindIndicator />
          </ThemeProvider>
          </BasketProvider>
        </Providers>
            </AppContextProvider>
          
        </Connect>

      </body>
    </html>
  )
}
