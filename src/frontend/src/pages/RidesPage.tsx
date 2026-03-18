import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
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

export function RidesPage() {
  const [tab, setTab] = useState("pending");
  const { data: pendingRides } = useGetPendingRides();
  const acceptRide = useAcceptRide();

  const pending = pendingRides ?? [];

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

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-extrabold text-foreground">Rides</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Aapke sabhi ride requests aur history
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Rides",
            value: "0",
            icon: <Navigation size={16} />,
            color: "text-primary",
          },
          {
            label: "Completed",
            value: "0",
            icon: <CheckCircle2 size={16} />,
            color: "text-success",
          },
          {
            label: "Cancelled",
            value: "0",
            icon: <XCircle size={16} />,
            color: "text-destructive",
          },
          {
            label: "Total Earned",
            value: "₹0",
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
              value="pending"
              data-ocid="rides.pending.tab"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Pending {pending.length > 0 && `(${pending.length})`}
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
        </div>

        <TabsContent value="pending" className="mt-0">
          {pending.length === 0 ? (
            <div
              data-ocid="rides.empty_state"
              className="text-center py-20 text-muted-foreground"
            >
              <Navigation size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Koi pending ride request nahi</p>
              <p className="text-sm mt-1">
                Online ho jayein toh ride requests milni shuru hongi
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((ride, i) => (
                <motion.div
                  key={String(ride.requestTime)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  data-ocid={`rides.item.${i + 1}`}
                  className="card-glow rounded-2xl border border-primary/20 bg-card p-5"
                >
                  <div className="flex items-start gap-4">
                    <MapSvg className="w-32 h-20 rounded-lg flex-shrink-0 hidden sm:block" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
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
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            className={`${statusConfig.pending.color} flex items-center gap-1 text-xs`}
                            variant="outline"
                          >
                            {statusConfig.pending.icon} Pending
                          </Badge>
                          <span className="font-bold text-primary">
                            ₹{ride.fareAmount}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <div className="w-2 h-2 rounded-full bg-success" />
                          <span className="truncate">
                            {ride.pickupLocation.area},{" "}
                            {ride.pickupLocation.city}
                          </span>
                        </div>
                        <span className="hidden sm:block text-muted-foreground">
                          →
                        </span>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin size={10} className="text-primary" />
                          <span className="truncate">
                            {ride.dropLocation.area}, {ride.dropLocation.city}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          data-ocid={`rides.accept.button.${i + 1}`}
                          size="sm"
                          className="h-7 bg-primary text-primary-foreground font-bold"
                          onClick={() =>
                            acceptRide.mutate(ride.requestTime, {
                              onSuccess: () => toast.success("Ride accept ki!"),
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
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          <div
            data-ocid="rides.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Koi completed trip nahi abhi tak</p>
            <p className="text-sm mt-1">
              Trips complete karne ke baad yahan dikhenge
            </p>
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-0">
          <div
            data-ocid="rides.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <XCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Koi cancelled trip nahi</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
