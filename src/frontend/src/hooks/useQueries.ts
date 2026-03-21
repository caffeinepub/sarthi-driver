import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DriverProfile,
  EarningsSummary,
  Location,
  Notification,
  RideRequest,
} from "../backend";
import { useActor } from "./useActor";

export type DriverStatus =
  | { pending: null }
  | { approved: null }
  | { rejected: null };
export interface DriverProfileWithStatus extends DriverProfile {
  status: DriverStatus;
  customDriverId?: string;
}

export interface AdminDriverRecord {
  customDriverId: string;
  name: string;
  vehicleType: string;
  phoneNumber: string;
  addedAt: bigint;
}

const ADMIN_KEY = "sarthi_admin_v1";

export function useGetProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<DriverProfileWithStatus | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return (await actor.getCallerUserProfile()) as DriverProfileWithStatus | null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEarnings() {
  const { actor, isFetching } = useActor();
  return useQuery<EarningsSummary | null>({
    queryKey: ["earnings"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getEarnings();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getNotifications();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingRides() {
  const { actor, isFetching } = useActor();
  return useQuery<RideRequest[]>({
    queryKey: ["pendingRides"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPendingRideRequests();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      vehicleType: string;
      phoneNumber: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProfile(data.name, data.vehicleType, data.phoneNumber);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useUpdateOnlineStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (isOnline: boolean) => {
      if (!actor) throw new Error("Not connected");
      try {
        return await actor.updateOnlineStatus(isOnline);
      } catch {
        // ignore if profile not yet created
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useAcceptRide() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rideId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.acceptRide(rideId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingRides"] });
      qc.invalidateQueries({ queryKey: ["earnings"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: DriverProfileWithStatus) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

// Admin hooks

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      // Check localStorage first (frontend password)
      if (localStorage.getItem(ADMIN_KEY) === "true") return true;
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      // Accept "admin" as the password (frontend check)
      if (token.trim().toLowerCase() === "admin") {
        localStorage.setItem(ADMIN_KEY, "true");
        return;
      }
      throw new Error(
        "Wrong password. Please enter the correct admin password.",
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useGetAllDrivers() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, DriverProfileWithStatus]>>({
    queryKey: ["allDrivers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await actor.getAllDrivers()) as Array<
          [Principal, DriverProfileWithStatus]
        >;
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingDriverRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, DriverProfileWithStatus]>>({
    queryKey: ["pendingDriverRegistrations"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const a = actor as any;
        if (typeof a.getPendingDriverRegistrations !== "function") return [];
        return (await a.getPendingDriverRegistrations()) as Array<
          [Principal, DriverProfileWithStatus]
        >;
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useApproveDriver() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (driverId: Principal) => {
      if (!actor) throw new Error("Not connected");
      const a = actor as any;
      if (typeof a.approveDriver !== "function")
        throw new Error("approveDriver not available");
      return a.approveDriver(driverId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingDriverRegistrations"] });
      qc.invalidateQueries({ queryKey: ["allDrivers"] });
    },
  });
}

export function useRejectDriver() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (driverId: Principal) => {
      if (!actor) throw new Error("Not connected");
      const a = actor as any;
      if (typeof a.rejectDriver !== "function")
        throw new Error("rejectDriver not available");
      return a.rejectDriver(driverId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingDriverRegistrations"] });
      qc.invalidateQueries({ queryKey: ["allDrivers"] });
    },
  });
}

export function useGetAllRideRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[bigint, RideRequest]>>({
    queryKey: ["allRideRequests"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllRideRequests();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateRideRequestAsAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      pickup: Location;
      drop: Location;
      fare: number;
      passenger: string;
      distance: number;
      driverId: Principal;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createRideRequestAsAdmin(
        data.pickup,
        data.drop,
        data.fare,
        data.passenger,
        data.distance,
        data.driverId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allRideRequests"] }),
  });
}

export function useSendNotification() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: { driverId: Principal; message: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendNotification(data.driverId, data.message);
    },
  });
}

// Admin-added driver hooks

export function useAddDriverAsAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      vehicleType: string;
      phoneNumber: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const a = actor as any;
      if (typeof a.addDriverAsAdmin !== "function") {
        // Fallback: generate a local SARTHI ID for demo
        const num = String(Math.floor(100000 + Math.random() * 900000));
        return `SARTHI${num}`;
      }
      return (await a.addDriverAsAdmin(
        data.name,
        data.vehicleType,
        data.phoneNumber,
      )) as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminAddedDrivers"] });
      qc.invalidateQueries({ queryKey: ["allDrivers"] });
    },
  });
}

export function useGetAllAdminAddedDrivers() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminDriverRecord[]>({
    queryKey: ["adminAddedDrivers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const a = actor as any;
        if (typeof a.getAllAdminAddedDrivers !== "function") return [];
        return (await a.getAllAdminAddedDrivers()) as AdminDriverRecord[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}
