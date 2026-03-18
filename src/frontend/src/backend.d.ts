import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    area: string;
    city: string;
}
export interface DriverProfile {
    vehicleType: string;
    name: string;
    isOnline: boolean;
    rating: number;
    phoneNumber: string;
    totalRides: bigint;
}
export type Time = bigint;
export interface Notification {
    message: string;
    timestamp: Time;
}
export interface RideRequest {
    driverId: Principal;
    isAccepted: boolean;
    distance: number;
    passengerName: string;
    fareAmount: number;
    dropLocation: Location;
    requestTime: Time;
    pickupLocation: Location;
}
export interface EarningsSummary {
    weeklyEarnings: Array<number>;
    totalTrips: bigint;
    todayEarnings: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptRide(rideId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelTrip(tripId: bigint): Promise<void>;
    completeTrip(tripId: bigint): Promise<void>;
    createProfile(name: string, vehicleType: string, phoneNumber: string): Promise<void>;
    createRideRequest(pickup: Location, drop: Location, fare: number, passenger: string, distance: number, driverId: Principal): Promise<bigint>;
    createRideRequestAsAdmin(pickup: Location, drop: Location, fare: number, passenger: string, distance: number, driverId: Principal): Promise<bigint>;
    getAllDrivers(): Promise<Array<[Principal, DriverProfile]>>;
    getAllRideRequests(): Promise<Array<[bigint, RideRequest]>>;
    getCallerUserProfile(): Promise<DriverProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEarnings(): Promise<EarningsSummary>;
    getNotifications(): Promise<Array<Notification>>;
    getPendingRideRequests(): Promise<Array<RideRequest>>;
    getProfile(): Promise<DriverProfile | null>;
    getUserProfile(user: Principal): Promise<DriverProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: DriverProfile): Promise<void>;
    sendNotification(driverId: Principal, message: string): Promise<void>;
    updateOnlineStatus(isOnline: boolean): Promise<void>;
}
