import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DriverProfile,
  EarningsSummary,
  Location,
  Notification,
  RideRequest,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<DriverProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
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
      return actor.getEarnings();
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
      return actor.getNotifications();
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
      return actor.getPendingRideRequests();
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
      return actor.updateOnlineStatus(isOnline);
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
    mutationFn: async (profile: DriverProfile) => {
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
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimAdminRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).claimAdminRole(token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useGetAllDrivers() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, DriverProfile]>>({
    queryKey: ["allDrivers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDrivers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllRideRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[bigint, RideRequest]>>({
    queryKey: ["allRideRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRideRequests();
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
