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

  type DriverStatus = { #pending; #approved; #rejected };

  type DriverProfileWithStatus = {
    name : Text;
    vehicleType : Text;
    rating : Float;
    totalRides : Nat;
    phoneNumber : Text;
    isOnline : Bool;
    status : DriverStatus;
    customDriverId : Text;
  };

  type AdminDriverRecord = {
    customDriverId : Text;
    name : Text;
    vehicleType : Text;
    phoneNumber : Text;
    addedAt : Time.Time;
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
  let driverStatuses = Map.empty<Principal, Text>();
  let driverCustomIds = Map.empty<Principal, Text>();
  let adminAddedDrivers = Map.empty<Nat, AdminDriverRecord>();
  let rideRequests = Map.empty<Nat, RideRequest>();
  let tripHistory = Map.empty<Principal, List.List<Trip>>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  var rideRequestCounter = 0;
  var tripIdCounter = 0;
  var driverIdCounter = 0;
  var adminDriverCounter = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func requireAuthenticated(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Please log in first");
    };
  };

  func padNat(n : Nat) : Text {
    let s = n.toText();
    let len = s.size();
    if (len >= 6) { s }
    else {
      var padding = "";
      var i = len;
      while (i < 6) {
        padding := padding # "0";
        i += 1;
      };
      padding # s;
    };
  };

  func generateNextDriverId() : Text {
    driverIdCounter += 1;
    "SARTHI" # padNat(driverIdCounter);
  };

  func getDriverStatus(p : Principal) : DriverStatus {
    switch (driverStatuses.get(p)) {
      case (null) { #pending };
      case (?s) {
        if (s == "approved") { #approved }
        else if (s == "rejected") { #rejected }
        else { #pending };
      };
    };
  };

  func getCustomDriverId(p : Principal) : Text {
    switch (driverCustomIds.get(p)) {
      case (null) { "" };
      case (?id) { id };
    };
  };

  func toProfileWithStatus(p : Principal, profile : DriverProfile) : DriverProfileWithStatus {
    {
      name = profile.name;
      vehicleType = profile.vehicleType;
      rating = profile.rating;
      totalRides = profile.totalRides;
      phoneNumber = profile.phoneNumber;
      isOnline = profile.isOnline;
      status = getDriverStatus(p);
      customDriverId = getCustomDriverId(p);
    };
  };

  func assignCustomIdIfNeeded(p : Principal) {
    switch (driverCustomIds.get(p)) {
      case (null) {
        let newId = generateNextDriverId();
        driverCustomIds.add(p, newId);
      };
      case (_) {};
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?DriverProfileWithStatus {
    requireAuthenticated(caller);
    switch (driverProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?toProfileWithStatus(caller, profile) };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?DriverProfileWithStatus {
    requireAuthenticated(caller);
    switch (driverProfiles.get(user)) {
      case (null) { null };
      case (?profile) { ?toProfileWithStatus(user, profile) };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : DriverProfileWithStatus) : async () {
    requireAuthenticated(caller);
    switch (driverStatuses.get(caller)) {
      case (null) { driverStatuses.add(caller, "pending") };
      case (_) {};
    };
    assignCustomIdIfNeeded(caller);
    let stored : DriverProfile = {
      name = profile.name;
      vehicleType = profile.vehicleType;
      rating = profile.rating;
      totalRides = profile.totalRides;
      phoneNumber = profile.phoneNumber;
      isOnline = profile.isOnline;
    };
    driverProfiles.add(caller, stored);
  };

  public shared ({ caller }) func createProfile(name : Text, vehicleType : Text, phoneNumber : Text) : async () {
    requireAuthenticated(caller);
    switch (driverStatuses.get(caller)) {
      case (null) { driverStatuses.add(caller, "pending") };
      case (_) {};
    };
    assignCustomIdIfNeeded(caller);
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
    requireAuthenticated(caller);
    let existing = switch (driverProfiles.get(caller)) {
      case (null) {
        {
          name = "";
          vehicleType = "Sedan";
          rating = 0.0;
          totalRides = 0;
          phoneNumber = "";
          isOnline;
        };
      };
      case (?profile) {
        {
          name = profile.name;
          vehicleType = profile.vehicleType;
          rating = profile.rating;
          totalRides = profile.totalRides;
          phoneNumber = profile.phoneNumber;
          isOnline;
        };
      };
    };
    driverProfiles.add(caller, existing);
  };

  public shared ({ caller }) func createRideRequest(pickup : Location, drop : Location, fare : Float, passenger : Text, distance : Float, driverId : Principal) : async Nat {
    requireAuthenticated(caller);
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
    requireAuthenticated(caller);
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
    requireAuthenticated(caller);
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
        } else { t };
      }
    );
    if (not tripFound) {
      Runtime.trap("Active trip not found or you are not authorized");
    };
    tripHistory.add(caller, updatedHistory);
  };

  public shared ({ caller }) func cancelTrip(tripId : Nat) : async () {
    requireAuthenticated(caller);
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
        } else { true };
      }
    );
    if (not tripFound) {
      Runtime.trap("Active trip not found or you are not authorized");
    };
    tripHistory.add(caller, updatedHistory);
  };

  public query ({ caller }) func getPendingRideRequests() : async [RideRequest] {
    requireAuthenticated(caller);
    rideRequests.values().toArray().filter(func(r) { not r.isAccepted and r.driverId == caller });
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    requireAuthenticated(caller);
    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?driverNotifications) { driverNotifications.toArray() };
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

  public query ({ caller }) func getProfile() : async ?DriverProfileWithStatus {
    requireAuthenticated(caller);
    switch (driverProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?toProfileWithStatus(caller, profile) };
    };
  };

  public query ({ caller }) func getEarnings() : async EarningsSummary {
    requireAuthenticated(caller);
    let history = switch (tripHistory.get(caller)) {
      case (null) { List.empty<Trip>() };
      case (?trips) { trips };
    };
    let completedTrips = history.filter(
      func(trip) { not trip.isActive and trip.endTime != null }
    );
    let todayEarnings = completedTrips.foldLeft(
      0.0,
      func(acc, trip) { acc + trip.fareAmount },
    );
    let weeklyEarnings = Array.tabulate(7, func(day) { 0.0 });
    {
      todayEarnings;
      weeklyEarnings;
      totalTrips = completedTrips.size();
    };
  };

  public query ({ caller }) func getAllDrivers() : async [(Principal, DriverProfileWithStatus)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };
    driverProfiles.toArray()
      .filter(func(pair) { getDriverStatus(pair.0) == #approved })
      .map(func(pair) { (pair.0, toProfileWithStatus(pair.0, pair.1)) });
  };

  public query ({ caller }) func getPendingDriverRegistrations() : async [(Principal, DriverProfileWithStatus)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };
    driverProfiles.toArray()
      .filter(func(pair) { getDriverStatus(pair.0) == #pending })
      .map(func(pair) { (pair.0, toProfileWithStatus(pair.0, pair.1)) });
  };

  public shared ({ caller }) func approveDriver(driverId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve drivers");
    };
    driverStatuses.add(driverId, "approved");
  };

  public shared ({ caller }) func rejectDriver(driverId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject drivers");
    };
    driverStatuses.add(driverId, "rejected");
  };

  public query ({ caller }) func getAllRideRequests() : async [(Nat, RideRequest)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };
    rideRequests.toArray();
  };

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

  // Admin: manually add a driver (no Internet Identity needed)
  public shared ({ caller }) func addDriverAsAdmin(
    name : Text,
    vehicleType : Text,
    phoneNumber : Text,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add drivers directly");
    };
    let newId = generateNextDriverId();
    let record : AdminDriverRecord = {
      customDriverId = newId;
      name;
      vehicleType;
      phoneNumber;
      addedAt = Time.now();
    };
    adminAddedDrivers.add(adminDriverCounter, record);
    adminDriverCounter += 1;
    newId;
  };

  // Admin: get all manually added drivers
  public query ({ caller }) func getAllAdminAddedDrivers() : async [AdminDriverRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };
    adminAddedDrivers.values().toArray();
  };
};
