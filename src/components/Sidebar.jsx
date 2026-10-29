import { useEffect, useState } from "react";
import clinicLogo from "../assets/clinic.png";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  ClipboardCheck,
  FileText,
  Pill,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

function Sidebar({ currentPage, onNavigate, user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    const closeOnDesktop = (event) => {
      if (event.matches) setMobileOpen(false);
    };
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    document.addEventListener("keydown", closeOnEscape);
    desktopQuery.addEventListener("change", closeOnDesktop);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      desktopQuery.removeEventListener("change", closeOnDesktop);
    };
  }, [mobileOpen]);

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  const navigationItems = [
    { label: "Dashboard", page: "dashboard", icon: LayoutDashboard },
    { label: "Patients", page: "patients", icon: Users },
    { label: "Nurses", page: "nurses", icon: Stethoscope },
    { label: "Assessment", page: "assessment", icon: ClipboardCheck },
    { label: "Records", page: "records", icon: FileText },
    { label: "Medicine Inventory", page: "medicine-inventory", icon: Pill },
  ];

  const getInitials = (name) =>
    (name || "Clinic Staff")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

  const navigateTo = (page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 border-b border-green-700 px-5 py-6">
        <img
          src={clinicLogo}
          alt="UDM Clinic Logo"
          className="h-11 w-11 shrink-0 rounded-xl object-cover"
        />

        <div className="min-w-0">
          <h1 className="text-lg font-extrabold tracking-wide text-white">
            UDM CLINIC
          </h1>
          <p className="text-xs text-green-200">
            Health Care Monitoring
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-green-300">
          Main Menu
        </p>

        <div className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;

            return (
              <button
                key={item.page}
                type="button"
                onClick={() => navigateTo(item.page)}
                aria-current={isActive ? "page" : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-white text-green-900 shadow-md"
                    : "text-green-50 hover:bg-green-800"
                }`}
              >
                <Icon
                  size={19}
                  className={
                    isActive
                      ? "text-green-900"
                      : "text-green-200 group-hover:text-white"
                  }
                />

                <span className="flex-1">{item.label}</span>

                {isActive && (
                  <ChevronRight size={16} className="text-green-700" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 border-t border-green-700 pt-5">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-green-300">
            Account
          </p>

          <button
            type="button"
            onClick={() => navigateTo("settings")}
            aria-current={currentPage === "settings" ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${
              currentPage === "settings"
                ? "bg-white text-green-900"
                : "text-green-50 hover:bg-green-800"
            }`}
          >
            <Settings size={19} />
            <span className="flex-1">Settings</span>

            {currentPage === "settings" && (
              <ChevronRight size={16} />
            )}
          </button>
        </div>
      </nav>

      <div className="border-t border-green-700 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-green-800 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-green-900">
            {getInitials(currentUser.name)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs text-green-200">Logged in as</p>
            <p className="truncate text-sm font-bold text-white">
              {currentUser.name}
            </p>
            <p className="truncate text-xs capitalize text-green-200">
              {currentUser.role}
            </p>
          </div>

          <ShieldCheck
            size={18}
            className="shrink-0 text-green-200"
          />
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-green-600 px-3 py-3 text-sm font-semibold text-white transition-colors hover:border-red-400 hover:bg-red-600"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-green-100 bg-white px-4 shadow-sm lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={clinicLogo}
            alt="UDM Clinic Logo"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <span className="truncate font-extrabold text-green-900">
            UDM CLINIC
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-controls="staff-navigation"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          className="rounded-lg p-2 text-green-900 transition-colors hover:bg-green-50"
        >
          {mobileOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </header>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-green-900 text-white lg:flex">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        id="staff-navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-green-900 text-white shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div className="flex items-center justify-end px-4 pt-3">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-white hover:bg-green-800"
          >
            <X size={23} />
          </button>
        </div>

        {sidebarContent}
      </aside>
    </>
  );
}

export default Sidebar;