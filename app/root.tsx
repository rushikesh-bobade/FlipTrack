import { useEffect } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { ErrorBoundary as ErrorBoundaryRoot } from "~/components/error-boundary/error-boundary";
import "./styles/reset.css";
import "./styles/global.css";
import "./styles/theme.css";
import favicon from "/favicon.svg";
import { NavigationBar } from "./blocks/__global/navigation-bar";
import { BreadcrumbNavigation } from "./blocks/__global/breadcrumb-navigation";
import { FooterLinksSection } from "./blocks/__global/footer-links-section";
import { FooterBottomBar } from "./blocks/__global/footer-bottom-bar";
import { useLocation } from "react-router";
import { Toaster } from "sonner";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: favicon, type: "image/svg+xml" },
  { rel: "manifest", href: "/manifest.json" },
  { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1f2937" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('fliptrack-theme');
                  var theme = saved || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <RootLayout>{children}</RootLayout>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function RootLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith("/app/");
  const isAuthRoute = location.pathname.startsWith("/auth/");
  const showPublicNav = !isAppRoute && !isAuthRoute;

  return (
    <>
      {showPublicNav && (
        <header>
          <NavigationBar />
        </header>
      )}

      <main>{children}</main>
      {showPublicNav && (
        <footer>
          <FooterLinksSection />
          <FooterBottomBar />
        </footer>
      )}
      <Toaster position="top-right" richColors theme="system" />
    </>
  );
}

export default function App() {
  return <Outlet />;
}

export const ErrorBoundary = ErrorBoundaryRoot;
