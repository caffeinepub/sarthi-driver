import { Button } from "@/components/ui/button";
import { Car, Loader2, Shield, Star, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const features = [
    {
      icon: <Car size={20} />,
      title: "Smart Ride Matching",
      desc: "Get matched with riders near you instantly",
    },
    {
      icon: <TrendingUp size={20} />,
      title: "Real-time Earnings",
      desc: "Track your income daily, weekly, monthly",
    },
    {
      icon: <Shield size={20} />,
      title: "Safe & Secure",
      desc: "Verified riders, 24/7 support",
    },
    {
      icon: <Star size={20} />,
      title: "Build Your Rating",
      desc: "5-star service earns you more rides",
    },
  ];

  return (
    <div className="min-h-screen night-bg flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Left: brand + features */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left"
        >
          <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg">
              S
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Sarthi Driver
              </h1>
              <p className="text-xs text-muted-foreground">
                Professional Driver Platform
              </p>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            Drive. Earn.
            <span className="text-primary block">Succeed.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-sm">
            Join thousands of drivers earning ₹50,000+ monthly across India's
            top cities.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card/60 backdrop-blur-sm"
              >
                <span className="text-primary mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {f.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-6 justify-center md:justify-start">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">50K+</p>
              <p className="text-xs text-muted-foreground">Active Drivers</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">4.8★</p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">15</p>
              <p className="text-xs text-muted-foreground">Cities</p>
            </div>
          </div>
        </motion.div>

        {/* Right: login card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-glow rounded-2xl bg-card border border-border p-8 flex flex-col items-center gap-6"
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Car size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Driver Login</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to access your driver dashboard
            </p>
          </div>

          <div className="w-full space-y-3">
            <Button
              data-ocid="login.primary_button"
              className="w-full h-12 font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              onClick={() => login()}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />{" "}
                  Connecting...
                </>
              ) : (
                <>
                  <Shield size={18} className="mr-2" /> Login with Internet
                  Identity
                </>
              )}
            </Button>
          </div>

          <div className="w-full pt-4 border-t border-border">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Shield size={14} className="text-success" />
              Secured by Internet Computer blockchain
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            {[
              { city: "Delhi", drivers: "12K+" },
              { city: "Mumbai", drivers: "9K+" },
              { city: "Bangalore", drivers: "7K+" },
            ].map((c) => (
              <div
                key={c.city}
                className="text-center p-3 rounded-lg bg-secondary border border-border"
              >
                <p className="text-sm font-bold text-foreground">{c.drivers}</p>
                <p className="text-xs text-muted-foreground">{c.city}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
