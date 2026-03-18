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

// Sample ride requests for initial display
const SAMPLE_RIDES = [
  {
    id: 1n,
    passengerName: "Arjun Sharma",
    pickupLocation: { area: "Connaught Place", city: "Delhi" },
    dropLocation: { area: "Karol Bagh", city: "Delhi" },
    fareAmount: 180,
    distance: 7.2,
    requestTime: BigInt(Date.now()) * 1000000n,
    isAccepted: false,
    driverId: {} as never,
  },
  {
    id: 2n,
    passengerName: "Priya Patel",
    pickupLocation: { area: "Lajpat Nagar", city: "Delhi" },
    dropLocation: { area: "Saket Metro", city: "Delhi" },
    fareAmount: 220,
    distance: 9.8,
    requestTime: BigInt(Date.now()) * 1000000n,
    isAccepted: false,
    driverId: {} as never,
  },
];

const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    message: "New ride request in your area!",
    time: "2 min ago",
    type: "ride",
  },
  {
    id: 2,
    message: "Payment of ₹340 credited to your account",
    time: "1 hr ago",
    type: "payment",
  },
  {
    id: 3,
    message: "You received a 5-star rating from Rahul K.",
    time: "3 hr ago",
    type: "rating",
  },
  {
    id: 4,
    message: "Surge pricing active in Gurugram — 1.8x",
    time: "5 hr ago",
    type: "surge",
  },
];

const TRIP_HISTORY = [
  {
    id: 1,
    passenger: "Rahul Kumar",
    from: "Dwarka",
    to: "IGI Airport",
    fare: 450,
    time: "9:30 AM",
  },
  {
    id: 2,
    passenger: "Sunita Verma",
    from: "Rohini",
    to: "Connaught Place",
    fare: 310,
    time: "11:15 AM",
  },
  {
    id: 3,
    passenger: "Mohit Jain",
    from: "Laxmi Nagar",
    to: "Noida Sec 18",
    fare: 290,
    time: "1:45 PM",
  },
];

export function DashboardPage() {
  const { data: profile } = useGetProfile();
  const { data: earnings } = useGetEarnings();
  const { data: pendingRides } = useGetPendingRides();
  const { data: notifications } = useGetNotifications();
  const updateOnline = useUpdateOnlineStatus();
  const acceptRide = useAcceptRide();

  const [isOnline, setIsOnline] = useState(profile?.isOnline ?? true);
  const [dismissedRides, setDismissedRides] = useState<Set<number>>(new Set());

  const handleToggleOnline = () => {
    const next = !isOnline;
    setIsOnline(next);
    updateOnline.mutate(next);
    toast(next ? "You are now ONLINE" : "You are now OFFLINE", {
      icon: next ? "🟢" : "🔴",
    });
  };

  const handleAccept = (id: bigint) => {
    acceptRide.mutate(id, {
      onSuccess: () => toast.success("Ride accepted! Navigating to pickup..."),
      onError: () => toast.error("Could not accept ride. Try again."),
    });
  };

  const handleReject = (numId: number) => {
    setDismissedRides((prev) => new Set([...prev, numId]));
    toast("Ride request dismissed");
  };

  // Use backend data or fall back to sample data
  const rides =
    pendingRides && pendingRides.length > 0
      ? pendingRides.map((r, i) => ({ ...r, id: BigInt(i) }))
      : SAMPLE_RIDES;

  const visibleRides = rides.filter((r) => !dismissedRides.has(Number(r.id)));
  const notifs =
    notifications && notifications.length > 0
      ? notifications
      : SAMPLE_NOTIFICATIONS.map((n) => ({
          message: n.message,
          timestamp: BigInt(0),
        }));

  const todayEarnings = earnings?.todayEarnings ?? 1840;
  const totalTrips = Number(earnings?.totalTrips ?? 7);
  const todayDistance = 62.4;

  const statCards = [
    {
      label: "Today's Earnings",
      value: `₹${todayEarnings.toLocaleString("en-IN")}`,
      icon: <IndianRupee size={18} />,
      color: "text-primary",
    },
    {
      label: "Trips Today",
      value: String(totalTrips),
      icon: <Navigation size={18} />,
      color: "text-success",
    },
    {
      label: "Distance (km)",
      value: `${todayDistance}`,
      icon: <TrendingUp size={18} />,
      color: "text-chart-3",
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-extrabold text-foreground">
          Driver Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {profile?.name ?? "Vikram Singh"} 👋
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-5">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-4">
          {/* Online status card */}
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
                  {isOnline ? "You're Online" : "You're Offline"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isOnline ? "Receiving ride requests" : "Toggle to go online"}
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
            <div className="space-y-3">
              {SAMPLE_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className="flex gap-3 items-start"
                  data-ocid={`notification.item.${n.id}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs
                    ${
                      n.type === "ride"
                        ? "bg-primary/20 text-primary"
                        : n.type === "payment"
                          ? "bg-success/20 text-success"
                          : n.type === "rating"
                            ? "bg-chart-3/20 text-chart-3"
                            : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {n.type === "ride" ? (
                      <Navigation size={12} />
                    ) : n.type === "payment" ? (
                      <IndianRupee size={12} />
                    ) : n.type === "rating" ? (
                      "★"
                    ) : (
                      <Zap size={12} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {n.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── CENTER COLUMN ── */}
        <div className="space-y-5">
          {/* Ride requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-foreground">
                Ride Requests
              </h2>
              <Badge
                className="bg-primary/20 text-primary border-primary/30 text-xs"
                variant="outline"
              >
                <Zap size={10} className="mr-1" /> Live Today
              </Badge>
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
                  Go online to receive ride requests
                </p>
              </div>
            ) : visibleRides.length === 0 ? (
              <div
                data-ocid="dashboard.rides.empty_state"
                className="rounded-2xl border border-border bg-card p-10 text-center"
              >
                <CheckCircle2 size={32} className="text-success mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No pending ride requests right now
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {SAMPLE_RIDES.filter(
                  (r) => !dismissedRides.has(r.id as unknown as number),
                ).map((ride, i) => (
                  <motion.div
                    key={Number(ride.id)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                    data-ocid={`ride.item.${i + 1}`}
                    className="card-glow-orange rounded-2xl border border-primary/20 bg-card p-5 flex flex-col gap-4"
                  >
                    {/* Rider info */}
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
                            {ride.distance} km away
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-primary text-primary-foreground font-bold text-sm px-3 py-1">
                        ₹{ride.fareAmount}
                      </Badge>
                    </div>

                    {/* Route map */}
                    <MapSvg className="w-full h-28 rounded-lg" animated />

                    {/* Locations */}
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

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        data-ocid={`ride.accept.button.${i + 1}`}
                        className="flex-1 bg-primary text-primary-foreground font-bold hover:bg-primary/90 h-9"
                        onClick={() => handleAccept(ride.id)}
                      >
                        <CheckCircle2 size={15} className="mr-1" /> ACCEPT
                      </Button>
                      <Button
                        data-ocid={`ride.reject.button.${i + 1}`}
                        variant="outline"
                        className="flex-1 border-border text-muted-foreground hover:text-foreground h-9"
                        onClick={() => handleReject(Number(ride.id))}
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

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-4">
          {/* Earnings summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card-glow rounded-2xl border border-border bg-card p-5"
            data-ocid="dashboard.earnings.panel"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-foreground">
                Earnings Summary
              </span>
              <span className="text-xs text-muted-foreground">This Week</span>
            </div>
            <p className="text-3xl font-extrabold text-primary mb-4">
              ₹
              {(
                earnings?.weeklyEarnings?.reduce((a, b) => a + b, 0) ?? 11240
              ).toLocaleString("en-IN")}
            </p>

            {/* Bar chart */}
            <div className="flex items-end justify-between gap-1.5 h-28 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, i) => {
                  const values = earnings?.weeklyEarnings ?? [
                    1200, 1800, 980, 2100, 1640, 2200, 1320,
                  ];
                  const val = values[i] ?? 0;
                  const max = Math.max(
                    ...(earnings?.weeklyEarnings ?? [
                      1200, 1800, 980, 2100, 1640, 2200, 1320,
                    ]),
                  );
                  const pct = max > 0 ? (val / max) * 100 : 0;
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
                          className={`w-full rounded-t-md bar-animate ${
                            isToday ? "bg-primary" : "bg-primary/40"
                          }`}
                          style={{ height: `${Math.max(pct, 8)}%` }}
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

          {/* Trip history */}
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
            <div className="space-y-3">
              {TRIP_HISTORY.map((trip, i) => (
                <div
                  key={trip.id}
                  className="flex items-center gap-3"
                  data-ocid={`trip.item.${i + 1}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-[10px] font-bold bg-secondary text-foreground">
                      {trip.passenger
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {trip.passenger}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {trip.from} → {trip.to}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary">
                      ₹{trip.fare}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {trip.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              data-ocid="dashboard.viewall.link"
              className="mt-4 w-full text-xs text-primary flex items-center justify-center gap-1 hover:underline"
            >
              View All Trips <ChevronRight size={12} />
            </button>
          </motion.div>

          {/* Quick stats */}
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
                { label: "Acceptance Rate", value: "87%", good: true },
                { label: "Completion Rate", value: "94%", good: true },
                { label: "Cancellation Rate", value: "6%", good: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                  <span
                    className={`text-xs font-bold ${item.good ? "text-success" : "text-destructive"}`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Online Hours Today
                </span>
                <span className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Clock size={10} /> 6h 42m
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
