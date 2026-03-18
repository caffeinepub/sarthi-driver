import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { Layout } from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { AdminPage } from "./pages/AdminPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EarningsPage } from "./pages/EarningsPage";
import { HelpPage } from "./pages/HelpPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RidesPage } from "./pages/RidesPage";

type Page = "dashboard" | "rides" | "earnings" | "profile" | "help" | "admin";

export default function App() {
  const { isLoginSuccess, isInitializing } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  if (isInitializing) {
    return (
      <div className="min-h-screen night-bg flex items-center justify-center">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-3xl animate-pulse">
            S
          </div>
          <div className="space-y-2 text-center">
            <Skeleton className="h-3 w-32 bg-secondary" />
            <Skeleton className="h-3 w-24 bg-secondary mx-auto" />
          </div>
          <p className="text-muted-foreground text-sm">
            Loading Sarthi Driver...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoginSuccess) {
    return (
      <>
        <LoginPage />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "rides":
        return <RidesPage />;
      case "earnings":
        return <EarningsPage />;
      case "profile":
        return <ProfilePage />;
      case "help":
        return <HelpPage />;
      case "admin":
        return <AdminPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      <div className="night-bg">
        <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
          {renderPage()}
        </Layout>
      </div>
      <Toaster richColors position="top-right" />
    </>
  );
}
