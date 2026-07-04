import { type RouteConfig, index, prefix, route, layout } from "@react-router/dev/routes";

const isDev = import.meta.env.MODE === "development";

export default [
  index("routes/home.tsx"),
  route("/features", "routes/features-page.tsx"),
  route("/pricing", "routes/pricing-page.tsx"),
  route("/faq", "routes/faq-page.tsx"),
  route("/blog", "routes/blog-index.tsx"),
  route("/blog/:slug", "routes/blog-post.tsx"),
  route("/changelog", "routes/changelog-page.tsx"),
  route("/privacy", "routes/privacy-policy.tsx"),
  route("/terms", "routes/terms-of-service.tsx"),
  
  ...prefix("/app", [
    layout("routes/app-layout.tsx", [
      route("dashboard", "routes/dashboard.tsx"),
      route("inventory", "routes/inventory-management.tsx"),
      route("inventory/:id", "routes/inventory-item-detail.tsx"),
      route("market-prices", "routes/market-prices.tsx"),
      route("sales", "routes/sales-log.tsx"),
      route("expenses", "routes/expenses-tracker.tsx"),
      route("income-statement", "routes/income-statement.tsx"),
      route("alerts", "routes/price-alerts.tsx"),
      route("ai-insights", "routes/ai-insights.tsx"),
      route("settings", "routes/settings.tsx"),
      route("settings/billing", "routes/billing-management.tsx"),
      route("tax-report", "routes/tax-report-export.tsx"),
    ]),
  ]),

  route("/auth/login", "routes/login-page.tsx"),
  route("/auth/callback", "routes/auth.callback.tsx"),
  route("/auth/signup", "routes/signup-page.tsx"),
  route("/auth/forgot-password", "routes/forgot-password-page.tsx"),
  route("/auth/reset-password", "routes/reset-password-page.tsx"),
  route("/auth/logout", "routes/auth.logout.ts"),
  route("/api/cron/refresh-prices", "routes/api.cron.prices.ts"),
  route("/api/webhooks/stripe", "routes/api.stripe.ts"),
  route("/api/ai/price-insight", "routes/api.ai.insights.ts"),
  route("/api/insights", "routes/api.insights.ts"),
  route("/api/export/tax", "routes/api.export.tax.ts"),
  route("/api/inventory/search", "routes/api.inventory.search.ts"),
] satisfies RouteConfig;
