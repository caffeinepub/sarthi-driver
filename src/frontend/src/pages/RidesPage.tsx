import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  Filter,
  IndianRupee,
  MapPin,
  Navigation,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { MapSvg } from "../components/MapSvg";
import { useAcceptRide, useGetPendingRides } from "../hooks/useQueries";

const ALL_RIDES = [
  {
    id: 1,
    status: "completed",
    passenger: "Rahul Kumar",
    pickup: "Dwarka Sector 10, Delhi",
    drop: "IGI Airport T3, Delhi",
    fare: 450,
    distance: 18.5,
    date: "Today",
    time: "9:30 AM",
    rating: 5,
  },
  {
    id: 2,
    status: "completed",
    passenger: "Sunita Verma",
    pickup: "Rohini East, Delhi",
    drop: "Connaught Place, Delhi",
    fare: 310,
    distance: 14.2,
    date: "Today",
    time: "11:15 AM",
    rating: 4,
  },
  {
    id: 3,
    status: "completed",
    passenger: "Mohit Jain",
    pickup: "Laxmi Nagar Metro, Delhi",
    drop: "Noida Sector 18",
    fare: 290,
    distance: 11.8,
    date: "Today",
    time: "1:45 PM",
    rating: 5,
  },
  {
    id: 4,
    status: "completed",
    passenger: "Deepika Singh",
    pickup: "Saket, Delhi",
    drop: "Faridabad NIT",
    fare: 520,
    distance: 22.3,
    date: "Yesterday",
    time: "8:00 AM",
    rating: 5,
  },
  {
    id: 5,
    status: "cancelled",
    passenger: "Amit Gupta",
    pickup: "Vasant Kunj, Delhi",
    drop: "Gurgaon Cyber Hub",
    fare: 380,
    distance: 16.0,
    date: "Yesterday",
    time: "3:20 PM",
    rating: null,
  },
  {
    id: 6,
    status: "completed",
    passenger: "Neha Kapoor",
    pickup: "Greater Noida",
    drop: "Hazrat Nizamuddin Station",
    fare: 680,
    distance: 31.4,
    date: "Mon, 16 Mar",
    time: "7:45 AM",
    rating: 4,
  },
  {
    id: 7,
    status: "pending",
    passenger: "Arjun Sharma",
    pickup: "Connaught Place, Delhi",
    drop: "Karol Bagh, Delhi",
    fare: 180,
    distance: 7.2,
    date: "Now",
    time: "Just now",
    rating: null,
  },
  {
    id: 8,
    status: "pending",
    passenger: "Priya Patel",
    pickup: "Lajpat Nagar, Delhi",
    drop: "Saket Metro, Delhi",
    fare: 220,
    distance: 9.8,
    date: "Now",
    time: "2 min ago",
    rating: null,
  },
];

const statusConfig = {
  completed: {
    label: "Completed",
    color: "bg-success/20 text-success border-success/30",
    icon: <CheckCircle2 size={12} />,
  },
  pending: {
    label: "Pending",
    color: "bg-primary/20 text-primary border-primary/30",
    icon: <Clock size={12} />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-destructive/20 text-destructive border-destructive/30",
    icon: <XCircle size={12} />,
  },
};

export function RidesPage() {
  const [tab, setTab] = useState("all");
  const acceptRide = useAcceptRide();

  const filtered =
    tab === "all" ? ALL_RIDES : ALL_RIDES.filter((r) => r.status === tab);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-extrabold text-foreground">Rides</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All your ride requests and history
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Rides",
            value: "143",
            icon: <Navigation size={16} />,
            color: "text-primary",
          },
          {
            label: "Completed",
            value: "134",
            icon: <CheckCircle2 size={16} />,
            color: "text-success",
          },
          {
            label: "Cancelled",
            value: "9",
            icon: <XCircle size={16} />,
            color: "text-destructive",
          },
          {
            label: "Total Earned",
            value: "₹62,450",
            icon: <IndianRupee size={16} />,
            color: "text-primary",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-glow rounded-xl border border-border bg-card p-4"
          >
            <div className={`flex items-center gap-2 mb-1 ${s.color}`}>
              {s.icon}
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger
              value="all"
              data-ocid="rides.all.tab"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              data-ocid="rides.pending.tab"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              data-ocid="rides.completed.tab"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              data-ocid="rides.cancelled.tab"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Cancelled
            </TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border text-muted-foreground"
          >
            <Filter size={14} /> Filter
          </Button>
        </div>

        <TabsContent value={tab} className="mt-0">
          {filtered.length === 0 ? (
            <div
              data-ocid="rides.empty_state"
              className="text-center py-20 text-muted-foreground"
            >
              <Navigation size={40} className="mx-auto mb-3 opacity-30" />
              <p>No rides found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((ride, i) => {
                const cfg =
                  statusConfig[ride.status as keyof typeof statusConfig];
                return (
                  <motion.div
                    key={ride.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    data-ocid={`rides.item.${i + 1}`}
                    className="card-glow rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex items-start gap-4">
                      {/* Mini map */}
                      <MapSvg className="w-32 h-20 rounded-lg flex-shrink-0 hidden sm:block" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                                {ride.passenger
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {ride.passenger}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {ride.date} · {ride.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                              className={`${cfg.color} flex items-center gap-1 text-xs`}
                              variant="outline"
                            >
                              {cfg.icon} {cfg.label}
                            </Badge>
                            <span className="font-bold text-primary">
                              ₹{ride.fare}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <div className="w-2 h-2 rounded-full bg-success" />
                            <span className="truncate">{ride.pickup}</span>
                          </div>
                          <span className="hidden sm:block text-muted-foreground">
                            →
                          </span>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin size={10} className="text-primary" />
                            <span className="truncate">{ride.drop}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {ride.distance} km
                          </span>
                          {ride.rating && (
                            <span className="text-xs text-primary">
                              {"★".repeat(ride.rating)}
                              {"☆".repeat(5 - ride.rating)}
                            </span>
                          )}
                          {ride.status === "pending" && (
                            <div className="flex gap-2 ml-auto">
                              <Button
                                data-ocid={`rides.accept.button.${i + 1}`}
                                size="sm"
                                className="h-7 bg-primary text-primary-foreground font-bold"
                                onClick={() =>
                                  acceptRide.mutate(BigInt(ride.id), {
                                    onSuccess: () =>
                                      toast.success("Ride accepted!"),
                                  })
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                data-ocid={`rides.reject.button.${i + 1}`}
                                variant="outline"
                                size="sm"
                                className="h-7 border-border text-muted-foreground"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
