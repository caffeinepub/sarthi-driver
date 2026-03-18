import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import { Loader2, Send, Shield, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateRideRequestAsAdmin,
  useGetAllDrivers,
  useGetAllRideRequests,
  useSendNotification,
} from "../hooks/useQueries";

export function AdminPage() {
  const { data: allDrivers = [], isLoading: driversLoading } =
    useGetAllDrivers();
  const { data: allRides = [], isLoading: ridesLoading } =
    useGetAllRideRequests();
  const createRide = useCreateRideRequestAsAdmin();
  const sendNotif = useSendNotification();

  const [rideForm, setRideForm] = useState({
    passengerName: "",
    pickupArea: "",
    pickupCity: "",
    dropArea: "",
    dropCity: "",
    fare: "",
    distance: "",
    driverId: "",
  });

  const [notifForm, setNotifForm] = useState({ driverId: "", message: "" });

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const driverPrincipal = Principal.fromText(rideForm.driverId);
      await createRide.mutateAsync({
        pickup: { area: rideForm.pickupArea, city: rideForm.pickupCity },
        drop: { area: rideForm.dropArea, city: rideForm.dropCity },
        fare: Number.parseFloat(rideForm.fare),
        passenger: rideForm.passengerName,
        distance: Number.parseFloat(rideForm.distance),
        driverId: driverPrincipal,
      });
      toast.success("Ride request created!");
      setRideForm({
        passengerName: "",
        pickupArea: "",
        pickupCity: "",
        dropArea: "",
        dropCity: "",
        fare: "",
        distance: "",
        driverId: "",
      });
    } catch (err) {
      toast.error(
        `Failed to create ride: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleSendNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const driverPrincipal = Principal.fromText(notifForm.driverId);
      await sendNotif.mutateAsync({
        driverId: driverPrincipal,
        message: notifForm.message,
      });
      toast.success("Notification sent!");
      setNotifForm({ driverId: "", message: "" });
    } catch (err) {
      toast.error(
        `Failed to send notification: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const truncatePrincipal = (p: Principal) => {
    const str = p.toText();
    return str.length > 16 ? `${str.slice(0, 8)}...${str.slice(-6)}` : str;
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Shield size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">
            Manage drivers, trips, and notifications
          </p>
        </div>
      </div>

      <Tabs defaultValue="trips" data-ocid="admin.tab">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger
            value="trips"
            data-ocid="admin.trips.tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Trips
          </TabsTrigger>
          <TabsTrigger
            value="drivers"
            data-ocid="admin.drivers.tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users size={14} className="mr-1" /> Drivers
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            data-ocid="admin.notifications.tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Send size={14} className="mr-1" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* TRIPS TAB */}
        <TabsContent value="trips" className="space-y-6 mt-4">
          {/* Create ride form */}
          <Card className="bg-card border-border card-glow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield size={15} className="text-primary" /> New Ride Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRide} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="passenger"
                      className="text-xs text-muted-foreground"
                    >
                      Passenger Name
                    </Label>
                    <Input
                      id="passenger"
                      data-ocid="admin.passenger.input"
                      placeholder="e.g. Rahul Sharma"
                      value={rideForm.passengerName}
                      onChange={(e) =>
                        setRideForm((p) => ({
                          ...p,
                          passengerName: e.target.value,
                        }))
                      }
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="driverId"
                      className="text-xs text-muted-foreground"
                    >
                      Driver Principal ID
                    </Label>
                    <Input
                      id="driverId"
                      data-ocid="admin.driverid.input"
                      placeholder="aaaaa-bbbbb-..."
                      value={rideForm.driverId}
                      onChange={(e) =>
                        setRideForm((p) => ({ ...p, driverId: e.target.value }))
                      }
                      required
                      className="bg-secondary border-border font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Pickup Area
                    </Label>
                    <Input
                      data-ocid="admin.pickup_area.input"
                      placeholder="e.g. Connaught Place"
                      value={rideForm.pickupArea}
                      onChange={(e) =>
                        setRideForm((p) => ({
                          ...p,
                          pickupArea: e.target.value,
                        }))
                      }
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Pickup City
                    </Label>
                    <Input
                      data-ocid="admin.pickup_city.input"
                      placeholder="e.g. New Delhi"
                      value={rideForm.pickupCity}
                      onChange={(e) =>
                        setRideForm((p) => ({
                          ...p,
                          pickupCity: e.target.value,
                        }))
                      }
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Drop Area
                    </Label>
                    <Input
                      data-ocid="admin.drop_area.input"
                      placeholder="e.g. Lajpat Nagar"
                      value={rideForm.dropArea}
                      onChange={(e) =>
                        setRideForm((p) => ({ ...p, dropArea: e.target.value }))
                      }
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Drop City
                    </Label>
                    <Input
                      data-ocid="admin.drop_city.input"
                      placeholder="e.g. New Delhi"
                      value={rideForm.dropCity}
                      onChange={(e) =>
                        setRideForm((p) => ({ ...p, dropCity: e.target.value }))
                      }
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Fare (₹)
                    </Label>
                    <Input
                      type="number"
                      data-ocid="admin.fare.input"
                      placeholder="e.g. 250"
                      value={rideForm.fare}
                      onChange={(e) =>
                        setRideForm((p) => ({ ...p, fare: e.target.value }))
                      }
                      required
                      min="0"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Distance (km)
                    </Label>
                    <Input
                      type="number"
                      data-ocid="admin.distance.input"
                      placeholder="e.g. 8.5"
                      value={rideForm.distance}
                      onChange={(e) =>
                        setRideForm((p) => ({ ...p, distance: e.target.value }))
                      }
                      required
                      min="0"
                      step="0.1"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  data-ocid="admin.create_ride.submit_button"
                  disabled={createRide.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {createRide.isPending ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : null}
                  {createRide.isPending ? "Creating..." : "Create Ride Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Rides list */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                All Ride Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {ridesLoading ? (
                <div
                  data-ocid="admin.rides.loading_state"
                  className="flex items-center justify-center py-10"
                >
                  <Loader2 size={20} className="animate-spin text-primary" />
                </div>
              ) : allRides.length === 0 ? (
                <div
                  data-ocid="admin.rides.empty_state"
                  className="text-center py-10 text-muted-foreground text-sm"
                >
                  No ride requests yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-xs">
                          ID
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Passenger
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Route
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Fare
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Driver
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody data-ocid="admin.rides.table">
                      {allRides.map(([id, ride], idx) => (
                        <TableRow
                          key={id.toString()}
                          data-ocid={`admin.rides.item.${idx + 1}`}
                          className="border-border hover:bg-secondary/50"
                        >
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            #{id.toString()}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {ride.passengerName}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <span className="text-foreground">
                              {ride.pickupLocation.area}
                            </span>
                            <span className="mx-1 text-primary">→</span>
                            <span className="text-foreground">
                              {ride.dropLocation.area}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-primary">
                            ₹{ride.fareAmount}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {truncatePrincipal(ride.driverId)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              data-ocid={`admin.rides.status.${idx + 1}`}
                              variant={
                                ride.isAccepted ? "default" : "secondary"
                              }
                              className={
                                ride.isAccepted
                                  ? "bg-success/20 text-success border-success/30"
                                  : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                              }
                            >
                              {ride.isAccepted ? "Accepted" : "Pending"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DRIVERS TAB */}
        <TabsContent value="drivers" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users size={15} className="text-primary" /> Registered Drivers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {driversLoading ? (
                <div
                  data-ocid="admin.drivers.loading_state"
                  className="flex items-center justify-center py-10"
                >
                  <Loader2 size={20} className="animate-spin text-primary" />
                </div>
              ) : allDrivers.length === 0 ? (
                <div
                  data-ocid="admin.drivers.empty_state"
                  className="text-center py-10 text-muted-foreground text-sm"
                >
                  No drivers registered yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-xs">
                          Driver
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Vehicle
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Phone
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Rating
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Rides
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody data-ocid="admin.drivers.table">
                      {allDrivers.map(([principal, driver], idx) => (
                        <TableRow
                          key={principal.toText()}
                          data-ocid={`admin.drivers.item.${idx + 1}`}
                          className="border-border hover:bg-secondary/50"
                        >
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">
                                {driver.name}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {truncatePrincipal(principal)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {driver.vehicleType}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {driver.phoneNumber}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-primary">
                            ⭐ {driver.rating.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {driver.totalRides.toString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${driver.isOnline ? "bg-green-500" : "bg-muted-foreground"}`}
                              />
                              <span
                                className={`text-xs font-medium ${driver.isOnline ? "text-green-500" : "text-muted-foreground"}`}
                              >
                                {driver.isOnline ? "Online" : "Offline"}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="mt-4">
          <Card className="bg-card border-border card-glow max-w-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserCheck size={15} className="text-primary" /> Send
                Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotif} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="notif-driver"
                    className="text-xs text-muted-foreground"
                  >
                    Driver Principal ID
                  </Label>
                  <Input
                    id="notif-driver"
                    data-ocid="admin.notif_driver.input"
                    placeholder="aaaaa-bbbbb-..."
                    value={notifForm.driverId}
                    onChange={(e) =>
                      setNotifForm((p) => ({ ...p, driverId: e.target.value }))
                    }
                    required
                    className="bg-secondary border-border font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="notif-msg"
                    className="text-xs text-muted-foreground"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="notif-msg"
                    data-ocid="admin.notif_message.textarea"
                    placeholder="Type your message to the driver..."
                    value={notifForm.message}
                    onChange={(e) =>
                      setNotifForm((p) => ({ ...p, message: e.target.value }))
                    }
                    required
                    rows={3}
                    className="bg-secondary border-border resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  data-ocid="admin.send_notif.submit_button"
                  disabled={sendNotif.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {sendNotif.isPending ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : (
                    <Send size={14} className="mr-2" />
                  )}
                  {sendNotif.isPending ? "Sending..." : "Send Notification"}
                </Button>
                {sendNotif.isSuccess && (
                  <p
                    data-ocid="admin.notif.success_state"
                    className="text-xs text-green-500 text-center"
                  >
                    Notification sent successfully!
                  </p>
                )}
                {sendNotif.isError && (
                  <p
                    data-ocid="admin.notif.error_state"
                    className="text-xs text-destructive text-center"
                  >
                    Failed to send notification.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
