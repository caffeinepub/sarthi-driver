import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Car,
  ChevronDown,
  HelpCircle,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Shield,
  Star,
  User,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetProfile,
  useIsAdmin,
  useUpdateOnlineStatus,
} from "../hooks/useQueries";

type Page = "dashboard" | "rides" | "earnings" | "profile" | "help" | "admin";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { clear } = useInternetIdentity();
  const { data: profile } = useGetProfile();
  const { data: isAdmin } = useIsAdmin();
  const updateOnline = useUpdateOnlineStatus();
  const [isOnline, setIsOnline] = useState(profile?.isOnline ?? true);

  const handleToggleOnline = () => {
    const next = !isOnline;
    setIsOnline(next);
    updateOnline.mutate(next);
  };

  const navItems: {
    id: Page;
    label: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={15} />,
    },
    { id: "rides", label: "Rides", icon: <Car size={15} /> },
    { id: "earnings", label: "Earnings", icon: <IndianRupee size={15} /> },
    { id: "profile", label: "Profile", icon: <User size={15} /> },
    { id: "help", label: "Help", icon: <HelpCircle size={15} /> },
    {
      id: "admin",
      label: "Admin",
      icon: <Shield size={15} />,
      adminOnly: true,
    },
  ];

  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin === true,
  );

  const driverName = profile?.name || "Driver";
  const driverRating = profile?.rating;
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DR";

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mr-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              S
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">
              Sarthi Driver
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {visibleNavItems.map((item) => (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative
                  ${
                    currentPage === item.id
                      ? "text-primary nav-active"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            {/* Online toggle */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary">
              <div
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-success" : "bg-muted-foreground"}`}
              />
              <span
                className={`text-xs font-semibold ${isOnline ? "text-success" : "text-muted-foreground"}`}
              >
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
              <Switch
                data-ocid="header.online.switch"
                checked={isOnline}
                onCheckedChange={handleToggleOnline}
                className="scale-75 data-[state=checked]:bg-success"
              />
            </div>

            {/* Notification bell */}
            <button
              type="button"
              data-ocid="header.notifications.button"
              className="relative p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>

            {/* Profile chip */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  data-ocid="header.profile.button"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-border bg-secondary hover:bg-muted transition-colors"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-xs font-semibold text-foreground leading-tight">
                      {driverName}
                    </span>
                    {driverRating != null && (
                      <span className="text-xs text-primary flex items-center gap-0.5">
                        <Star size={9} fill="currentColor" />
                        {driverRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 bg-card border-border"
              >
                <DropdownMenuItem
                  data-ocid="header.profile.dropdown.link"
                  className="cursor-pointer"
                  onClick={() => onNavigate("profile")}
                >
                  <User size={14} className="mr-2" /> My Profile
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    data-ocid="header.admin.dropdown.link"
                    className="cursor-pointer text-primary focus:text-primary"
                    onClick={() => onNavigate("admin")}
                  >
                    <Shield size={14} className="mr-2" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  data-ocid="header.signout.button"
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => clear()}
                >
                  <LogOut size={14} className="mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex border-t border-border overflow-x-auto">
          {visibleNavItems.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`mobile.nav.${item.id}.link`}
              onClick={() => onNavigate(item.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition-colors
                ${
                  currentPage === item.id
                    ? "text-primary border-t-2 border-primary"
                    : "text-muted-foreground"
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 relative z-10">{children}</main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
