import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type DriverProfile = {
    name : Text;
    vehicleType : Text;
    rating : Float;
    totalRides : Nat;
    phoneNumber : Text;
    isOnline : Bool;
  };

  module DriverProfile {
    public func compare(p1 : DriverProfile, p2 : DriverProfile) : Order.Order {
      switch (Text.compare(p1.name, p2.name)) {
        case (#equal) { Text.compare(p1.phoneNumber, p2.phoneNumber) };
        case (order) { order };
      };
    };

    public func compareByRating(p1 : DriverProfile, p2 : DriverProfile) : Order.Order {
      Float.compare(p2.rating, p1.rating);
    };
  };

  type Location = {
    city : Text;
    area : Text;
  };

  type RideRequest = {
    pickupLocation : Location;
    dropLocation : Location;
    fareAmount : Float;
    passengerName : Text;
    distance : Float;
    isAccepted : Bool;
    requestTime : Time.Time;
    driverId : Principal;
  };

  type Trip = {
    pickupLocation : Location;
    dropLocation : Location;
    fareAmount : Float;
    passengerName : Text;
    distance : Float;
    startTime : Time.Time;
    endTime : ?Time.Time;
    driverId : Principal;
    tripId : Nat;
    isActive : Bool;
  };

  type EarningsSummary = {
    todayEarnings : Float;
    weeklyEarnings : [Float];
    totalTrips : Nat;
  };

  type Notification = {
    message : Text;
    timestamp : Time.Time;
  };

  let driverProfiles = Map.empty<Principal, DriverProfile>();
  let rideRequests = Map.empty<Nat, RideRequest>();
  let tripHistory = Map.empty<Principal, List.List<Trip>>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  var rideRequestCounter = 0;
  var tripIdCounter = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Required user profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?DriverProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    driverProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?DriverProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    driverProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : DriverProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    driverProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createProfile(name : Text, vehicleType : Text, phoneNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only drivers can create profiles");
    };

    if (driverProfiles.containsKey(caller)) {
      Runtime.trap("Profile already exists");
    };

    let profile : DriverProfile = {
      name;
      vehicleType;
      rating = 0.0;
      totalRides = 0;
      phoneNumber;
      isOnline = false;
    };

    driverProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateOnlineStatus(isOnline : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only drivers can update online status");
    };

    switch (driverProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedProfile : DriverProfile = {
          name = profile.name;
          vehicleType = profile.vehicleType;
          rating = profile.rating;
          totalRides = profile.totalRides;
          phoneNumber = profile.phoneNumber;
          isOnline;
        };
        driverProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func createRideRequest(pickup : Location, drop : Location, fare : Float, passenger : Text, distance : Float, driverId : Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create ride requests");
    };

    let request : RideRequest = {
      pickupLocation = pickup;
      dropLocation = drop;
      fareAmount = fare;
      passengerName = passenger;
      distance;
      isAccepted = false;
      requestTime = Time.now();
      driverId;
    };

    rideRequests.add(rideRequestCounter, request);
    rideRequestCounter += 1;
    rideRequestCounter - 1;
  };

  public shared ({ caller }) func acceptRide(rideId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only drivers can accept rides");
    };

    switch (rideRequests.get(rideId)) {
      case (null) { Runtime.trap("Ride request not found") };
      case (?request) {
        if (request.driverId != caller) {
          Runtime.trap("You are not authorized to accept this ride");
        };
        let updatedRequest : RideRequest = {
          pickupLocation = request.pickupLocation;
          dropLocation = request.dropLocation;
          fareAmount = request.fareAmount;
          passengerName = request.passengerName;
          distance = request.distance;
          isAccepted = true;
          requestTime = request.requestTime;
          driverId = request.driverId;
        };
        rideRequests.add(rideId, updatedRequest);

        let trip : Trip = {
          pickupLocation = request.pickupLocation;
          dropLocation = request.dropLocation;
          fareAmount = request.fareAmount;
          passengerName = request.passengerName;
          distance = request.distance;
          startTime = Time.now();
          endTime = null;
          driverId = caller;
          tripId = tripIdCounter;
          isActive = true;
        };
        tripIdCounter += 1;

        let currentHistory = switch (tripHistory.get(caller)) {
          case (null) { List.empty<Trip>() };
          case (?history) { history };
        };

        currentHistory.add(trip);
        tripHistory.add(caller, currentHistory);
      };
    };
  };

  public shared ({ caller }) func completeTrip(tripId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only drivers can complete trips");
    };

    let currentHistory = switch (tripHistory.get(caller)) {
      case (null) { Runtime.trap("No trip history found") };
      case (?history) { history };
    };

    var tripFound = false;
    let updatedHistory = currentHistory.map<Trip, Trip>(
      func(t) {
        if (t.tripId == tripId and t.isActive and t.driverId == caller) {
          tripFound := true;
          {
            pickupLocation = t.pickupLocation;
            dropLocation = t.dropLocation;
            fareAmount = t.fareAmount;
            passengerName = t.passengerName;
            distance = t.distance;
            startTime = t.startTime;
            endTime = ?Time.now();
            driverId = t.driverId;
            tripId = t.tripId;
            isActive = false;
          };
        } else {
          t;
        };
      }
    );

    if (not tripFound) {
      Runtime.trap("Active trip not found or you are not authorized");
    };

    tripHistory.add(caller, updatedHistory);
  };

  public shared ({ caller }) func cancelTrip(tripId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only drivers can cancel trips");
    };

    var tripFound = false;

    let currentHistory = switch (tripHistory.get(caller)) {
      case (null) { List.empty<Trip>() };
      case (?history) { history };
    };

    let updatedHistory = currentHistory.filter(
      func(t) {
        if (t.tripId == tripId and t.isActive and t.driverId == caller) {
          tripFound := true;
          false;
        } else {
          true;
        };
      }
    );

    if (not tripFound) {
      Runtime.trap("Active trip with ID " # tripId.toText() # " not found or you are not authorized");
    };

    tripHistory.add(caller, updatedHistory);
  };

  public query ({ caller }) func getPendingRideRequests() : async [RideRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only drivers can view ride requests");
    };
    rideRequests.values().toArray().filter(func(r) { not r.isAccepted and r.driverId == caller });
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view notifications");
    };
    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?driverNotifications) {
        driverNotifications.toArray();
      };
    };
  };

  public shared ({ caller }) func sendNotification(driverId : Principal, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can send notifications");
    };

    let notification : Notification = {
      message = message;
      timestamp = Time.now();
    };

    let currentNotifications = switch (notifications.get(driverId)) {
      case (null) { List.empty<Notification>() };
      case (?notifs) { notifs };
    };

    currentNotifications.add(notification);
    notifications.add(driverId, currentNotifications);
  };

  public query ({ caller }) func getProfile() : async ?DriverProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    driverProfiles.get(caller);
  };

  public query ({ caller }) func getEarnings() : async EarningsSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only drivers can view earnings");
    };

    let history = switch (tripHistory.get(caller)) {
      case (null) { List.empty<Trip>() };
      case (?trips) { trips };
    };

    let completedTrips = history.filter(
      func(trip) {
        not trip.isActive and trip.endTime != null
      }
    );

    let todayEarnings = completedTrips.foldLeft(
      0.0,
      func(acc, trip) {
        acc + trip.fareAmount;
      },
    );

    let weeklyEarnings = Array.tabulate(
      7,
      func(day) {
        0.0;
      },
    );

    {
      todayEarnings;
      weeklyEarnings;
      totalTrips = completedTrips.size();
    };
  };

  // New admin-only function to get all drivers with Principal IDs
  public query ({ caller }) func getAllDrivers() : async [(Principal, DriverProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };
    driverProfiles.toArray();
  };

  // New admin-only function to get all ride requests with IDs
  public query ({ caller }) func getAllRideRequests() : async [(Nat, RideRequest)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };
    rideRequests.toArray();
  };

  // Admin function to create ride request for any driver
  public shared ({ caller }) func createRideRequestAsAdmin(
    pickup : Location,
    drop : Location,
    fare : Float,
    passenger : Text,
    distance : Float,
    driverId : Principal,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can use this function");
    };

    let request : RideRequest = {
      pickupLocation = pickup;
      dropLocation = drop;
      fareAmount = fare;
      passengerName = passenger;
      distance;
      isAccepted = false;
      requestTime = Time.now();
      driverId;
    };

    rideRequests.add(rideRequestCounter, request);
    rideRequestCounter += 1;
    rideRequestCounter - 1;
  };
};
