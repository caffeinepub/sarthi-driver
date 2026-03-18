import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  IndianRupee,
  MapPin,
  Navigation,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CityMapSvg, MapSvg } from "../components/MapSvg";
import {
  useAcceptRide,
  useGetEarnings,
  useGetNotifications,
  useGetPendingRides,
  useGetProfile,
  useUpdateOnlineStatus,
} from "../hooks/useQueries";

export function DashboardPage() {
  const { data: profile } = useGetProfile();
  const { data: earnings } = useGetEarnings();
  const { data: pendingRides } = useGetPendingRides();
  const { data: notifications } = useGetNotifications();
  const updateOnline = useUpdateOnlineStatus();
  const acceptRide = useAcceptRide();

  const [isOnline, setIsOnline] = useState(profile?.isOnline ?? false);
  const [dismissedRides, setDismissedRides] = useState<Set<number>>(new Set());

  const handleToggleOnline = () => {
    const next = !isOnline;
    setIsOnline(next);
    updateOnline.mutate(next);
    toast(next ? "Aap ab ONLINE hain" : "Aap ab OFFLINE hain", {
      icon: next ? "🟢" : "🔴",
    });
  };

  const handleAccept = (id: bigint) => {
    acceptRide.mutate(id, {
      onSuccess: () =>
        toast.success("Ride accept ki! Pickup ke liye ja rahe hain..."),
      onError: () =>
        toast.error("Ride accept nahi ho saki. Dobara try karein."),
    });
  };

  const handleReject = (idx: number): void => {
    setDismissedRides((prev) => new Set([...prev, idx]));
    toast("Ride request dismiss ki");
  };

  const rides = (pendingRides ?? [])
    .map((r, i) => ({ ...r, _idx: i }))
    .filter((r) => !dismissedRides.has(r._idx));
  const notifs = notifications ?? [];

  const todayEarnings = earnings?.todayEarnings ?? 0;
  const totalTrips = Number(earnings?.totalTrips ?? 0);
  const weeklyValues = earnings?.weeklyEarnings ?? [0, 0, 0, 0, 0, 0, 0];

  const statCards = [
    {
      label: "Aaj Ki Kamai",
      value: `₹${todayEarnings.toLocaleString("en-IN")}`,
      icon: <IndianRupee size={18} />,
      color: "text-primary",
    },
    {
      label: "Aaj Ke Trips",
      value: String(totalTrips),
      icon: <Navigation size={18} />,
      color: "text-success",
    },
    {
      label: "Is Hafte Ki Kamai",
      value: `₹${weeklyValues.reduce((a, b) => a + b, 0).toLocaleString("en-IN")}`,
      icon: <TrendingUp size={18} />,
      color: "text-chart-3",
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-extrabold text-foreground">
          Driver Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {profile?.name ?? "Driver"} 👋
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-5">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          {/* Online status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`card-glow rounded-2xl border p-5 bg-card ${
              isOnline ? "border-success/30 card-glow-green" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </span>
              <Badge
                className={
                  isOnline
                    ? "bg-success/20 text-success border-success/30"
                    : "bg-secondary text-muted-foreground border-border"
                }
                variant="outline"
              >
                {isOnline ? "Active" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-lg font-bold ${isOnline ? "text-success" : "text-muted-foreground"}`}
                >
                  {isOnline ? "Aap Online Hain" : "Aap Offline Hain"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isOnline
                    ? "Ride requests aa rahi hain"
                    : "Online hone ke liye toggle karein"}
                </p>
              </div>
              <Switch
                data-ocid="dashboard.online.switch"
                checked={isOnline}
                onCheckedChange={handleToggleOnline}
                className="data-[state=checked]:bg-success"
              />
            </div>
          </motion.div>

          {/* Stat cards */}
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="card-glow rounded-2xl border border-border p-5 bg-card"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <span className={card.color}>{card.icon}</span>
                <span className="text-xs font-medium uppercase tracking-wider">
                  {card.label}
                </span>
              </div>
              <p className={`text-3xl font-extrabold ${card.color}`}>
                {card.value}
              </p>
            </motion.div>
          ))}

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card-glow rounded-2xl border border-border p-5 bg-card"
            data-ocid="dashboard.notifications.panel"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Bell size={15} className="text-primary" /> Notifications
              </span>
              <Badge
                className="bg-primary/20 text-primary border-primary/30"
                variant="outline"
              >
                {notifs.length}
              </Badge>
            </div>
            {notifs.length === 0 ? (
              <div className="text-center py-4">
                <Bell
                  size={24}
                  className="mx-auto mb-2 text-muted-foreground opacity-30"
                />
                <p className="text-xs text-muted-foreground">
                  Abhi koi notification nahi
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifs.map((n) => (
                  <div key={n.message} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                      <Bell size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* CENTER COLUMN */}
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-foreground">
                Ride Requests
              </h2>
              {rides.length > 0 && (
                <Badge
                  className="bg-primary/20 text-primary border-primary/30 text-xs"
                  variant="outline"
                >
                  <Zap size={10} className="mr-1" /> Live
                </Badge>
              )}
            </div>

            {!isOnline ? (
              <div
                data-ocid="dashboard.rides.empty_state"
                className="rounded-2xl border border-border bg-card p-10 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Navigation size={24} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Ride requests pane ke liye online ho jayein
                </p>
              </div>
            ) : rides.length === 0 ? (
              <div
                data-ocid="dashboard.rides.empty_state"
                className="rounded-2xl border border-border bg-card p-10 text-center"
              >
                <CheckCircle2 size={32} className="text-success mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Abhi koi ride request nahi hai
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {rides.map((ride, i) => (
                  <motion.div
                    key={ride._idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                    data-ocid={`ride.item.${i + 1}`}
                    className="card-glow-orange rounded-2xl border border-primary/20 bg-card p-5 flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                            {ride.passengerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {ride.passengerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ride.distance} km
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-primary text-primary-foreground font-bold text-sm px-3 py-1">
                        ₹{ride.fareAmount}
                      </Badge>
                    </div>

                    <MapSvg className="w-full h-28 rounded-lg" animated />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-success flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Pickup
                          </p>
                          <p className="text-xs font-medium text-foreground truncate">
                            {ride.pickupLocation.area},{" "}
                            {ride.pickupLocation.city}
                          </p>
                        </div>
                      </div>
                      <div className="ml-1 w-px h-3 bg-border" />
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Drop</p>
                          <p className="text-xs font-medium text-foreground truncate">
                            {ride.dropLocation.area}, {ride.dropLocation.city}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        data-ocid={`ride.accept.button.${i + 1}`}
                        className="flex-1 bg-primary text-primary-foreground font-bold hover:bg-primary/90 h-9"
                        onClick={() => handleAccept(ride.requestTime)}
                      >
                        <CheckCircle2 size={15} className="mr-1" /> ACCEPT
                      </Button>
                      <Button
                        data-ocid={`ride.reject.button.${i + 1}`}
                        variant="outline"
                        className="flex-1 border-border text-muted-foreground hover:text-foreground h-9"
                        onClick={() => handleReject(ride._idx)}
                      >
                        <XCircle size={15} className="mr-1" /> REJECT
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* City Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-glow rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin size={15} className="text-primary" /> Current Location
              </h2>
              <Badge
                className="bg-success/20 text-success border-success/30"
                variant="outline"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-success mr-1 animate-pulse" />
                Live
              </Badge>
            </div>
            <CityMapSvg className="w-full rounded-xl" />
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Weekly earnings chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card-glow rounded-2xl border border-border bg-card p-5"
            data-ocid="dashboard.earnings.panel"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-foreground">
                Weekly Kamai
              </span>
              <span className="text-xs text-muted-foreground">Is Hafte</span>
            </div>
            <p className="text-3xl font-extrabold text-primary mb-4">
              ₹{weeklyValues.reduce((a, b) => a + b, 0).toLocaleString("en-IN")}
            </p>
            <div className="flex items-end justify-between gap-1.5 h-28 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, i) => {
                  const val = weeklyValues[i] ?? 0;
                  const max = Math.max(...weeklyValues, 1);
                  const pct = (val / max) * 100;
                  const isToday = i === new Date().getDay() - 1;
                  return (
                    <div
                      key={day}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full flex items-end"
                        style={{ height: "88px" }}
                      >
                        <div
                          className={`w-full rounded-t-md bar-animate ${isToday ? "bg-primary" : "bg-primary/40"}`}
                          style={{ height: `${Math.max(pct, 4)}%` }}
                          title={`₹${val}`}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {day}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </motion.div>

          {/* Recent trips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card-glow rounded-2xl border border-border bg-card p-5"
            data-ocid="dashboard.trips.panel"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-foreground">
                Trip History
              </span>
              <Badge
                className="bg-success/20 text-success border-success/30 text-xs"
                variant="outline"
              >
                Completed
              </Badge>
            </div>
            <div className="text-center py-6">
              <Navigation
                size={28}
                className="mx-auto mb-2 text-muted-foreground opacity-30"
              />
              <p className="text-xs text-muted-foreground">
                Abhi koi completed trip nahi
              </p>
            </div>
            <button
              type="button"
              data-ocid="dashboard.viewall.link"
              className="mt-2 w-full text-xs text-primary flex items-center justify-center gap-1 hover:underline"
            >
              Sab Trips Dekhein <ChevronRight size={12} />
            </button>
          </motion.div>

          {/* Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card-glow rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-sm font-bold text-foreground mb-3">
              Performance
            </p>
            <div className="space-y-3">
              {[
                {
                  label: "Acceptance Rate",
                  value: totalTrips > 0 ? "--" : "--",
                  good: true,
                },
                {
                  label: "Completion Rate",
                  value: totalTrips > 0 ? "--" : "--",
                  good: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Online Hours Today
                </span>
                <span className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Clock size={10} /> 0h 0m
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
