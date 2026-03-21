# Sarthi Driver

## Current State
- Drivers self-register via Internet Identity and profile creation
- Driver status: pending/approved/rejected managed by admin
- Driver identification uses blockchain Principal ID only
- Admin panel has Registration Requests, Trips, Drivers, Notifications tabs

## Requested Changes (Diff)

### Add
- Custom Driver ID field: format SARTHI + 6-digit padded number (e.g., SARTHI000001)
- Auto-assign SARTHI ID when driver profile is first created (self-registration)
- Admin "Add Driver" tab in Admin Panel to manually add drivers by entering name, phone, vehicle type
- Manually admin-added drivers get SARTHI ID and are immediately approved
- Display SARTHI Driver ID on Profile page
- Admin-added drivers shown in Drivers list

### Modify
- Backend: add driverIdCounter stable var, driverCustomIds map (Principal -> Text), adminAddedDrivers map (Nat -> AdminDriverRecord)
- createProfile and saveCallerUserProfile: assign SARTHI ID on first creation
- getAllDrivers: include both principal-based approved drivers and admin-added drivers
- AdminPage: add new "Add Driver" tab with form and list of manually added drivers
- ProfilePage: display SARTHI Driver ID

### Remove
- Nothing removed

## Implementation Plan
1. Backend: add driverIdCounter, generateDriverId helper, driverCustomIds map
2. Backend: assign SARTHI ID in createProfile and saveCallerUserProfile (first time)
3. Backend: add AdminDriverRecord type and adminAddedDrivers map
4. Backend: add addDriverAsAdmin(name, vehicleType, phoneNumber) -> Text (returns SARTHI ID)
5. Backend: add getAdminAddedDrivers() query for admin
6. Backend: update DriverProfileWithStatus to include customDriverId field
7. Backend: populate customDriverId in toProfileWithStatus
8. Frontend: AdminPage gets new "Add Driver" tab with form
9. Frontend: ProfilePage shows SARTHI Driver ID badge
