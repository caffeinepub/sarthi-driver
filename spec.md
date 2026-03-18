# Sarthi Driver - Admin Panel

## Current State
App is a driver-facing dashboard with dashboard, rides, earnings, profile, and help pages. Authorization component is already integrated with role-based access. Backend has `createRideRequest` (admin only sends notifications, any user creates ride requests) and `sendNotification` (admin only).

## Requested Changes (Diff)

### Add
- Admin Panel page accessible from nav when user is an admin
- Admin can create new ride requests (set pickup, drop, fare, passenger name, distance, assign to a driver)
- Admin can view all ride requests (pending and accepted)
- Admin can send notifications to drivers
- Admin can view all drivers list
- Nav item for Admin visible only to admins

### Modify
- Layout.tsx: Add "Admin" nav item that appears only for admin users
- App.tsx: Add "admin" page type and render AdminPage
- Backend: Add admin-only query to get all drivers and all ride requests

### Remove
- Nothing removed

## Implementation Plan
1. Update backend to add `getAllDrivers` and `getAllRideRequests` admin-only queries
2. Add AdminPage frontend component with tabs: Trips (create + view), Drivers, Notifications
3. Update Layout to show Admin nav item for admins
4. Update App.tsx to handle admin page routing
