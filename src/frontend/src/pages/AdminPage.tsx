import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  CheckCircle2,
  Loader2,
  Send,
  Shield,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddDriverAsAdmin,
  useApproveDriver,
  useCreateRideRequestAsAdmin,
  useGetAllAdminAddedDrivers,
  useGetAllDrivers,
  useGetAllRideRequests,
  useGetPendingDriverRegistrations,
  useRejectDriver,
  useSendNotification,
} from "../hooks/useQueries";

export function AdminPage() {
  const { data: allDrivers = [], isLoading: driversLoading } =
    useGetAllDrivers();
  const { data: allRides = [], isLoading: ridesLoading } =
    useGetAllRideRequests();
  const { data: pendingDrivers = [], isLoading: pendingLoading } =
    useGetPendingDriverRegistrations();
  const { data: adminAddedDrivers = [], isLoading: adminDriversLoading } =
    useGetAllAdminAddedDrivers();
  const createRide = useCreateRideRequestAsAdmin();
  const sendNotif = useSendNotification();
  const approveDriver = useApproveDriver();
  const rejectDriver = useRejectDriver();
  const addDriverAsAdmin = useAddDriverAsAdmin();

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

  const [addDriverForm, setAddDriverForm] = useState({
    name: "",
    phoneNumber: "",
    vehicleType: "Sedan",
  });

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const driverId = rideForm.driverId.trim();
      if (!driverId)
        throw new Error("Driver ID required. Select a driver from the list.");
      const driverPrincipal = Principal.fromText(driverId);
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
      const notifDriverId = notifForm.driverId.trim();
      if (!notifDriverId) throw new Error("Driver ID required.");
      const driverPrincipal = Principal.fromText(notifDriverId);
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

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const generatedId = await addDriverAsAdmin.mutateAsync(addDriverForm);
      toast.success(`Driver add ho gaya! ID: ${generatedId}`, {
        duration: 6000,
      });
      setAddDriverForm({ name: "", phoneNumber: "", vehicleType: "Sedan" });
    } catch (err) {
      toast.error(
        `Driver add nahi ho saka: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    }
  };

  const handleApprove = async (principal: Principal, name: string) => {
    try {
      await approveDriver.mutateAsync(principal);
      toast.success(`${name || "Driver"} ko approve kar diya gaya!`);
    } catch (err) {
      toast.error(
        `Approve nahi ho saka: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleReject = async (principal: Principal, name: string) => {
    try {
      await rejectDriver.mutateAsync(principal);
      toast.error(`${name || "Driver"} ki registration reject kar di gayi.`);
    } catch (err) {
      toast.error(
        `Reject nahi ho saka: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const truncatePrincipal = (p: Principal) => {
    const str = p.toText();
    return str.length > 16 ? `${str.slice(0, 8)}...${str.slice(-6)}` : str;
  };

  const driverOptions = allDrivers.map(([principal, driver]) => ({
    value: principal.toText(),
    label: `${driver.name || "Unnamed"} (${truncatePrincipal(principal)})`,
  }));

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

      <Tabs defaultValue="registrations" data-ocid="admin.tab">
        <TabsList className="bg-secondary border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger
            value="registrations"
            data-ocid="admin.registrations.tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
          >
            <UserCheck size={14} className="mr-1" />
            Registration Requests
            {pendingDrivers.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                {pendingDrivers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="add-driver"
            data-ocid="admin.add_driver.tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <UserPlus size={14} className="mr-1" /> Add Driver
          </TabsTrigger>
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

        {/* REGISTRATION REQUESTS TAB */}
        <TabsContent value="registrations" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserCheck size={15} className="text-primary" />
                Pending Driver Registrations
                {pendingDrivers.length > 0 && (
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 ml-1">
                    {pendingDrivers.length} pending
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pendingLoading ? (
                <div
                  data-ocid="admin.registrations.loading_state"
                  className="flex items-center justify-center py-10"
                >
                  <Loader2 size={20} className="animate-spin text-primary" />
                </div>
              ) : pendingDrivers.length === 0 ? (
                <div
                  data-ocid="admin.registrations.empty_state"
                  className="text-center py-12 text-muted-foreground text-sm"
                >
                  <UserCheck size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">
                    Koi pending registration nahi hai
                  </p>
                  <p className="text-xs mt-1 opacity-60">
                    Nayi driver registrations yahan dikhenge
                  </p>
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
                          Principal ID
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody data-ocid="admin.registrations.table">
                      {pendingDrivers.map(([principal, driver], idx) => (
                        <TableRow
                          key={principal.toText()}
                          data-ocid={`admin.registrations.item.${idx + 1}`}
                          className="border-border hover:bg-secondary/50"
                        >
                          <TableCell>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {driver.name || "Unnamed Driver"}
                              </p>
                              <Badge
                                variant="outline"
                                className="mt-1 text-[10px] bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                              >
                                Pending Approval
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {driver.vehicleType || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {driver.phoneNumber || "—"}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {truncatePrincipal(principal)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                data-ocid={`admin.registrations.approve.${idx + 1}`}
                                size="sm"
                                className="bg-green-600 hover:bg-green-500 text-white h-8 px-3 gap-1"
                                onClick={() =>
                                  handleApprove(principal, driver.name)
                                }
                                disabled={
                                  approveDriver.isPending ||
                                  rejectDriver.isPending
                                }
                              >
                                <CheckCircle2 size={13} />
                                Approve
                              </Button>
                              <Button
                                data-ocid={`admin.registrations.reject.${idx + 1}`}
                                size="sm"
                                variant="outline"
                                className="border-red-500/40 text-red-400 hover:bg-red-500/10 h-8 px-3 gap-1"
                                onClick={() =>
                                  handleReject(principal, driver.name)
                                }
                                disabled={
                                  approveDriver.isPending ||
                                  rejectDriver.isPending
                                }
                              >
                                <XCircle size={13} />
                                Reject
                              </Button>
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

        {/* ADD DRIVER TAB */}
        <TabsContent value="add-driver" className="space-y-6 mt-4">
          <Card className="bg-card border-border card-glow max-w-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserPlus size={15} className="text-primary" /> Driver Directly
                Add Karein
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Driver ko add karne par automatically SARTHI ID generate hogi
                (e.g. SARTHI000001)
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDriver} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="add-driver-name"
                    className="text-xs text-muted-foreground"
                  >
                    Driver Ka Naam
                  </Label>
                  <Input
                    id="add-driver-name"
                    data-ocid="admin.add_driver.name.input"
                    placeholder="e.g. Ramesh Kumar"
                    value={addDriverForm.name}
                    onChange={(e) =>
                      setAddDriverForm((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="add-driver-phone"
                    className="text-xs text-muted-foreground"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="add-driver-phone"
                    data-ocid="admin.add_driver.phone.input"
                    placeholder="+91 XXXXX XXXXX"
                    value={addDriverForm.phoneNumber}
                    onChange={(e) =>
                      setAddDriverForm((p) => ({
                        ...p,
                        phoneNumber: e.target.value,
                      }))
                    }
                    required
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Vehicle Type
                  </Label>
                  <Select
                    value={addDriverForm.vehicleType}
                    onValueChange={(v) =>
                      setAddDriverForm((p) => ({ ...p, vehicleType: v }))
                    }
                    required
                  >
                    <SelectTrigger
                      data-ocid="admin.add_driver.vehicle.select"
                      className="bg-secondary border-border"
                    >
                      <SelectValue placeholder="Vehicle select karein" />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-border">
                      {["Sedan", "SUV", "Auto", "Bike"].map((v) => (
                        <SelectItem
                          key={v}
                          value={v}
                          className="text-sm hover:bg-primary/20 focus:bg-primary/20"
                        >
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  data-ocid="admin.add_driver.submit_button"
                  disabled={addDriverAsAdmin.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  {addDriverAsAdmin.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UserPlus size={14} />
                  )}
                  {addDriverAsAdmin.isPending
                    ? "Add ho raha hai..."
                    : "Driver Add Karein"}
                </Button>

                {addDriverAsAdmin.isSuccess && (
                  <div
                    data-ocid="admin.add_driver.success_state"
                    className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3"
                  >
                    <CheckCircle2 size={16} className="text-green-400" />
                    <p className="text-sm text-green-400 font-medium">
                      Driver successfully add ho gaya!
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* List of admin-added drivers */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users size={15} className="text-primary" />
                Admin Dwara Add Kiye Gaye Drivers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {adminDriversLoading ? (
                <div
                  data-ocid="admin.added_drivers.loading_state"
                  className="flex items-center justify-center py-10"
                >
                  <Loader2 size={20} className="animate-spin text-primary" />
                </div>
              ) : adminAddedDrivers.length === 0 ? (
                <div
                  data-ocid="admin.added_drivers.empty_state"
                  className="text-center py-12 text-muted-foreground text-sm"
                >
                  <UserPlus size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Abhi koi driver add nahi kiya</p>
                  <p className="text-xs mt-1 opacity-60">
                    Upar form se driver add karein
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-xs">
                          Driver ID
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Naam
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Phone
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Vehicle
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody data-ocid="admin.added_drivers.table">
                      {adminAddedDrivers.map((driver, idx) => (
                        <TableRow
                          key={driver.customDriverId}
                          data-ocid={`admin.added_drivers.item.${idx + 1}`}
                          className="border-border hover:bg-secondary/50"
                        >
                          <TableCell>
                            <Badge className="bg-primary/15 text-primary border-primary/30 font-mono text-xs font-bold">
                              {driver.customDriverId}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-foreground">
                            {driver.name || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {driver.phoneNumber || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {driver.vehicleType || "—"}
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
                    <Label className="text-xs text-muted-foreground">
                      Select Driver
                    </Label>
                    <Select
                      value={rideForm.driverId}
                      onValueChange={(val) =>
                        setRideForm((p) => ({ ...p, driverId: val }))
                      }
                      disabled={driversLoading || driverOptions.length === 0}
                      required
                    >
                      <SelectTrigger
                        data-ocid="admin.driver.select"
                        className="bg-secondary border-border"
                      >
                        <SelectValue
                          placeholder={
                            driversLoading
                              ? "Loading drivers..."
                              : driverOptions.length === 0
                                ? "No drivers registered yet"
                                : "Select a driver"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-secondary border-border">
                        {driverOptions.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="text-sm hover:bg-primary/20 focus:bg-primary/20"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        setRideForm((p) => ({
                          ...p,
                          dropArea: e.target.value,
                        }))
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
                        setRideForm((p) => ({
                          ...p,
                          dropCity: e.target.value,
                        }))
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
                        setRideForm((p) => ({
                          ...p,
                          distance: e.target.value,
                        }))
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
                  disabled={createRide.isPending || !rideForm.driverId}
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
                                className={`w-1.5 h-1.5 rounded-full ${
                                  driver.isOnline
                                    ? "bg-green-500"
                                    : "bg-muted-foreground"
                                }`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  driver.isOnline
                                    ? "text-green-500"
                                    : "text-muted-foreground"
                                }`}
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
                  <Label className="text-xs text-muted-foreground">
                    Select Driver
                  </Label>
                  <Select
                    value={notifForm.driverId}
                    onValueChange={(val) =>
                      setNotifForm((p) => ({ ...p, driverId: val }))
                    }
                    disabled={driversLoading || driverOptions.length === 0}
                    required
                  >
                    <SelectTrigger
                      data-ocid="admin.notif_driver.select"
                      className="bg-secondary border-border"
                    >
                      <SelectValue
                        placeholder={
                          driversLoading
                            ? "Loading drivers..."
                            : driverOptions.length === 0
                              ? "No drivers registered yet"
                              : "Select a driver"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-border">
                      {driverOptions.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="text-sm hover:bg-primary/20 focus:bg-primary/20"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  disabled={sendNotif.isPending || !notifForm.driverId}
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
