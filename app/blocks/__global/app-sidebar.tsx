import { Link, NavLink, useSubmit } from "react-router";
import {
  IconDashboard,
  IconBox,
  IconChartLine,
  IconReceipt,
  IconWallet,
  IconBrain,
  IconSettings,
  IconLogout,
  IconTrendingUp,
} from "@tabler/icons-react";
import styles from "./app-sidebar.module.css";

interface Props {
  user: {
    name?: string | null;
    email: string;
    plan?: string | null;
  };
}

export function AppSidebar({ user }: Props) {
  const submit = useSubmit();

  const handleLogout = () => {
    submit(null, { method: "post", action: "/auth/logout" });
  };

  const navLinks = [
    { to: "/app/dashboard", label: "Dashboard", icon: <IconDashboard size={20} /> },
    { to: "/app/inventory", label: "Inventory", icon: <IconBox size={20} /> },
    { to: "/app/market-prices", label: "Market Prices", icon: <IconChartLine size={20} /> },
    { to: "/app/sales", label: "Sales Log", icon: <IconReceipt size={20} /> },
    { to: "/app/expenses", label: "Expenses", icon: <IconWallet size={20} /> },
    { to: "/app/ai-insights", label: "AI Insights", icon: <IconBrain size={20} /> },
    { to: "/app/analytics", label: "Analytics & Insights", icon: <IconTrendingUp size={20} /> },
    { to: "/app/settings", label: "Settings", icon: <IconSettings size={20} /> },
  ];
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <Link to="/app/dashboard" className={styles.logo}>
          Flip<span className={styles.accent}>Track</span>
        </Link>
      </div>

      <nav className={styles.nav}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.navItemActive : ""].filter(Boolean).join(" ")
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name || "User"}</span>
            <span className={styles.userPlan}>{user.plan || "FREE PLAN"}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              const current = document.documentElement.getAttribute("data-theme") || "dark";
              const next = current === "dark" ? "light" : "dark";
              document.documentElement.setAttribute("data-theme", next);
              localStorage.setItem("fliptrack-theme", next);
            }}
            className={styles.logoutBtn}
            style={{ flex: 1, justifyContent: "center" }}
            title="Toggle Theme"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn} style={{ flex: 3 }}>
            <IconLogout size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
