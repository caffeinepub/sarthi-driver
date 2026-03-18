import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Car,
  CheckCircle2,
  Edit2,
  Loader2,
  Navigation,
  Phone,
  Save,
  Shield,
  Star,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateProfile,
  useGetProfile,
  useSaveProfile,
} from "../hooks/useQueries";

export function ProfilePage() {
  const { data: profile } = useGetProfile();
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveProfile();
  const createProfile = useCreateProfile();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name ?? "Vikram Singh",
    phoneNumber: profile?.phoneNumber ?? "+91 98765 43210",
    vehicleType: profile?.vehicleType ?? "Sedan",
  });

  const handleSave = () => {
    if (profile) {
      saveProfile.mutate(
        {
          ...profile,
          name: form.name,
          phoneNumber: form.phoneNumber,
          vehicleType: form.vehicleType,
        },
        {
          onSuccess: () => {
            toast.success("Profile updated!");
            setEditing(false);
          },
          onError: () => toast.error("Failed to update profile"),
        },
      );
    } else {
      createProfile.mutate(form, {
        onSuccess: () => {
          toast.success("Profile created!");
          setEditing(false);
        },
        onError: () => toast.error("Failed to create profile"),
      });
    }
  };

  const displayProfile = profile ?? {
    name: "Vikram Singh",
    phoneNumber: "+91 98765 43210",
    vehicleType: "Sedan",
    rating: 4.5,
    totalRides: 143n,
    isOnline: true,
  };

  const initials = displayProfile.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isSaving = saveProfile.isPending || createProfile.isPending;

  const achievements = [
    { label: "5-Star Rides", value: "89", icon: "⭐" },
    { label: "Zero Cancels", value: "Week", icon: "🏆" },
    { label: "Super Driver", value: "Badge", icon: "🚗" },
    { label: "Top Earner", value: "Mar", icon: "💰" },
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-extrabold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your driver account and vehicle details
        </p>
      </motion.div>

      <div className="grid md:grid-cols-[320px_1fr] gap-6">
        {/* Left: avatar card */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-glow rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center"
          >
            <div className="relative mb-4">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-3xl font-extrabold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success border-2 border-card" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {displayProfile.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {displayProfile.vehicleType} Driver
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  className={
                    s <= Math.round(displayProfile.rating)
                      ? "text-primary fill-primary"
                      : "text-muted-foreground"
                  }
                />
              ))}
              <span className="ml-1 font-bold text-primary">
                {displayProfile.rating.toFixed(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mt-5">
              <div className="p-3 rounded-xl border border-border bg-secondary text-center">
                <p className="text-xl font-extrabold text-foreground">
                  {String(displayProfile.totalRides)}
                </p>
                <p className="text-xs text-muted-foreground">Total Rides</p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-secondary text-center">
                <p className="text-xl font-extrabold text-primary">₹1.52L</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </div>
            </div>

            {/* Principal */}
            {identity && (
              <div className="mt-4 w-full p-3 rounded-xl border border-border bg-secondary">
                <p className="text-xs text-muted-foreground mb-1">Wallet ID</p>
                <p className="text-xs font-mono text-foreground break-all">
                  {identity.getPrincipal().toString().slice(0, 20)}...
                </p>
              </div>
            )}
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card-glow rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield size={15} className="text-primary" /> Achievements
            </p>
            <div className="grid grid-cols-2 gap-2">
              {achievements.map((a) => (
                <div
                  key={a.label}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border bg-secondary"
                >
                  <span className="text-base">{a.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {a.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {a.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: editable form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glow rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-foreground">
              Driver Information
            </h3>
            {!editing ? (
              <Button
                data-ocid="profile.edit.button"
                variant="outline"
                size="sm"
                className="gap-2 border-border"
                onClick={() => setEditing(true)}
              >
                <Edit2 size={14} /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  data-ocid="profile.cancel.button"
                  variant="outline"
                  size="sm"
                  className="border-border text-muted-foreground"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="profile.save.button"
                  size="sm"
                  className="bg-primary text-primary-foreground gap-2"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>

          {isSaving && (
            <div
              data-ocid="profile.loading_state"
              className="text-center py-4 text-muted-foreground"
            >
              <Loader2 size={20} className="animate-spin mx-auto" />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <User size={12} /> Full Name
              </Label>
              {editing ? (
                <Input
                  data-ocid="profile.name.input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="bg-secondary border-border"
                />
              ) : (
                <p className="text-foreground font-semibold px-3 py-2 rounded-lg bg-secondary border border-border">
                  {displayProfile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Phone size={12} /> Phone Number
              </Label>
              {editing ? (
                <Input
                  data-ocid="profile.phone.input"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phoneNumber: e.target.value }))
                  }
                  className="bg-secondary border-border"
                />
              ) : (
                <p className="text-foreground font-semibold px-3 py-2 rounded-lg bg-secondary border border-border">
                  {displayProfile.phoneNumber}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Car size={12} /> Vehicle Type
              </Label>
              {editing ? (
                <Select
                  value={form.vehicleType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, vehicleType: v }))
                  }
                >
                  <SelectTrigger
                    data-ocid="profile.vehicle.select"
                    className="bg-secondary border-border"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {["Hatchback", "Sedan", "SUV", "Auto", "Electric"].map(
                      (v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground font-semibold px-3 py-2 rounded-lg bg-secondary border border-border">
                  {displayProfile.vehicleType}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Navigation size={12} /> Total Rides
              </Label>
              <p className="text-foreground font-semibold px-3 py-2 rounded-lg bg-secondary border border-border">
                {String(displayProfile.totalRides)} completed
              </p>
            </div>
          </div>

          {/* Vehicle details section */}
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-bold text-foreground mb-4">
              Vehicle Details
            </h4>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Model", value: "Maruti Swift Dzire" },
                { label: "Registration", value: "DL 5C 2019" },
                { label: "Year", value: "2022" },
                { label: "Fuel Type", value: "CNG + Petrol" },
                { label: "Color", value: "Pearl White" },
                { label: "Insurance", value: "Valid till Dec 2026" },
              ].map((detail) => (
                <div
                  key={detail.label}
                  className="p-3 rounded-xl border border-border bg-secondary"
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {detail.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification badges */}
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-bold text-foreground mb-4">
              Verification Status
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                "Aadhaar Verified",
                "Driving License",
                "Background Check",
                "Vehicle Docs",
                "Bank Account",
              ].map((v) => (
                <Badge
                  key={v}
                  className="bg-success/20 text-success border-success/30 gap-1"
                  variant="outline"
                >
                  <CheckCircle2 size={11} /> {v}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
