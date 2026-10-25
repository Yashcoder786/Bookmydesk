PRODUCT REQUIREMENTS DOCUMENT

Co-working Space Booking Platform

A BookMyShow-inspired marketplace for booking desks, dedicated seats and
private cabins

Version 1.0 \| 25 October 2026 Prepared for: Mini Project Development
Team Document status: Baseline product specification

## Document Control

| Field \| Details \|

| --- \| --- \|

| Product \| Co-working Space Booking Platform \|

| Document \| Product Requirements Document (PRD) \|

| Version / Date \| 1.0 / 25 October 2026 \|

| Primary model \| Multi-location workspace discovery, inventory and
  booking marketplace \|

| Primary inspiration \| BookMyShow discovery → session/date selection →
  seat map → checkout → ticket/booking confirmation \|

| Target platforms \| Responsive web application; mobile-first
  responsive experience \|

| Intended audience \| Product team, UI/UX designers, frontend/backend
  developers, QA and project evaluators \|

### Revision History

| Version \| Date \| Change \|

| --- \| --- \| --- \|

| 1.0 \| 25 Oct 2026 \| Initial product requirements baseline \|

## 1. Executive Summary

The platform enables individuals and businesses to discover and reserve
co-working spaces for a day, a week or a month. Customers can compare
locations, view facilities and pricing, select a date and duration,
inspect an interactive floor/seat map, choose available desks or cabins,
pay online or select an approved pay-later option, and receive a digital
booking pass.

The product borrows the familiar transaction journey of BookMyShow, but
adapts the inventory model from theatre seats and showtimes to physical
workspace assets, operating hours, booking durations and capacity. A
workspace partner portal allows operators to publish inventory and
manage operations. A central admin portal provides platform-level
oversight.

The product's differentiator is trustworthy availability: a desk or
cabin should not appear bookable if it is already reserved, blocked,
under maintenance or temporarily held by another customer during
checkout.

## 2. Product Vision, Goals and Non-goals

### 2.1 Vision

Make booking a professional workspace as easy and transparent as booking
a movie seat: find the right place, see exactly what is available,
choose your spot and confirm in a few steps.

### 2.2 Product goals

Let customers find suitable workspaces by location, date, duration,
price, capacity and amenities.

Show desk- and cabin-level availability through a clear interactive map.

Prevent overlapping confirmed bookings through server-side availability
checks and booking locks.

Support hourly/day-based inventory where enabled, plus monthly and
longer-term plans.

Give workspace partners control over listings, layouts, inventory,
pricing, schedules and reservations.

Give administrators tools to approve partners, resolve disputes, manage
refunds and monitor platform activity.

Deliver a responsive, accessible and trustworthy booking experience.

### 2.3 Non-goals for the first release

Native iOS and Android apps; the first release is a responsive website.

Complex enterprise access-control integrations, biometric entry or
smart-lock hardware.

Automated dynamic pricing using machine learning.

Full coworking operations software such as payroll, accounting or
visitor-management suites.

Guaranteed integration with every third-party workspace management
system.

## 3. Users and Personas

| Persona \| Needs \| Typical actions \|

| --- \| --- \| --- \|

| Freelancer / remote employee \| Reliable desk, Wi-Fi, convenient
  location, flexible duration \| Search nearby, compare prices, select a
  desk, book for a day \|

| Startup / small team \| Multiple seats together, meeting rooms,
  predictable monthly cost \| Filter by capacity, select adjacent desks
  or a cabin, request monthly plan \|

| Business traveller \| Workspace near a meeting or transit point, short
  booking window \| Search by area/date, inspect amenities, book quickly
  \|

| Workspace partner / manager \| Manage listings, occupancy, inventory
  and revenue \| Create property, draw map, set prices, block seats,
  manage bookings \|

| Platform administrator \| Trust, quality, support and marketplace
  health \| Approve partners, monitor bookings, handle disputes and
  refunds \|

## 4. Product Scope and Information Architecture

### 4.1 Customer-facing website

Home / discovery: location search, date and duration, featured spaces,
popular locations and categories.

Search results: map/list view, filters, sorting, cards with price,
rating, distance and key amenities.

Workspace details: photos, description, address/map, amenities,
policies, opening hours, pricing and floor/seat selection.

Booking flow: date → duration/time → inventory type → seat/cabin map →
booking summary → checkout → confirmation.

My bookings: upcoming, active, completed and cancelled bookings;
invoices and cancellation actions.

Account: profile, saved spaces, payment methods (through payment
provider), support and notifications.

### 4.2 Partner dashboard

Partner onboarding, business profile and verification documents.

Property and branch management.

Floor, zone and interactive seat-map editor.

Desk/cabin inventory management and asset status.

Availability calendar, recurring hours, blackout dates and maintenance
blocks.

Pricing plans, discounts, taxes and booking rules.

Reservation list, customer details, check-in/check-out and cancellation
handling.

Occupancy, revenue and booking analytics.

### 4.3 Admin dashboard

Partner and property review/approval.

User, booking, payment, refund and dispute management.

Content moderation, featured listings and platform configuration.

Commission and payout visibility.

Audit logs, reports, fraud flags and operational alerts.

## 5. Core Customer Journey --- BookMyShow-inspired

The experience should feel familiar to BookMyShow users. Keep the number
of steps low and show the total price before the customer commits.

Discover: user enters a city, locality or landmark and optionally
selects a date and duration.

Browse: user compares workspace cards and applies filters such as price,
desk/cabin, amenities and rating.

Select property: user opens a detail page and checks photos, facilities,
location, policies and pricing.

Choose booking period: user selects date, start/end time or a day/month
plan depending on the listing.

Choose inventory: user selects Desk, Dedicated Desk, Private Cabin or
other enabled inventory category.

Interactive map: user sees the floor plan with Available, Selected,
Held, Booked, Blocked and Maintenance states; taps a specific
desk/cabin.

Review: user sees selected asset(s), date, duration, price breakdown,
taxes, discount and cancellation policy.

Checkout: user signs in or verifies contact details, accepts terms and
pays through a payment gateway.

Confirmation: backend confirms payment and booking; user receives
booking ID, QR/digital pass and email/SMS/in-app confirmation.

Use workspace: partner checks the customer in; booking status changes
through the stay and eventually to completed.

Important difference from cinema booking: a workspace reservation can
span many hours or days and may repeat monthly. Availability must be
checked against the full requested time interval, not just a single
showtime.

## 6. Functional Requirements

### 6.1 Discovery and search

| ID \| Requirement \| Priority \| Acceptance criteria \|

| --- \| --- \| --- \| --- \|

| FR-01 \| Search by city, locality, landmark or address \| P0 \|
  Relevant published spaces are returned for the selected location. \|

| FR-02 \| Search by date and duration \| P0 \| Results can be checked
  for the requested date/time or plan. \|

| FR-03 \| Filter by inventory type, price, amenities, capacity and
  rating \| P1 \| Filters can be combined and cleared. \|

| FR-04 \| Sort by relevance, price, rating and distance \| P1 \| Sort
  order is reflected in results. \|

| FR-05 \| List/map result views \| P1 \| Selecting a result opens its
  workspace detail page. \|

### 6.2 Workspace detail and inventory

| ID \| Requirement \| Priority \| Acceptance criteria \|

| --- \| --- \| --- \| --- \|

| FR-06 \| Property profile with photos, description, address, map,
  hours, policies and amenities \| P0 \| Required listing fields are
  visible before booking. \|

| FR-07 \| Inventory categories: hot desk, dedicated desk, private cabin
  and optional meeting room \| P0 \| Only categories configured by the
  partner are displayed. \|

| FR-08 \| Seat map grouped by floor/zone \| P0 \| Map shows assets with
  labels and status legend. \|

| FR-09 \| Seat/cabin detail panel \| P0 \| Selecting an available asset
  shows type, capacity, features and price. \|

| FR-10 \| Partner can add/edit/disable inventory \| P0 \| Changes are
  validated and reflected in customer availability. \|

### 6.3 Availability and booking

| ID \| Requirement \| Priority \| Acceptance criteria \|

| --- \| --- \| --- \| --- \|

| FR-11 \| Availability calculated for complete requested interval \| P0
  \| Any overlapping active booking or block makes asset unavailable. \|

| FR-12 \| Temporary hold during checkout \| P0 \| Selected inventory is
  held for a configurable short period, e.g. 5 minutes. \|

| FR-13 \| Atomic booking confirmation \| P0 \| Two users cannot
  successfully confirm overlapping reservations for the same exclusive
  asset. \|

| FR-14 \| Booking for day and month plans \| P0 \| Plan rules,
  start/end dates and billing are clearly shown. \|

| FR-15 \| Multi-seat booking \| P1 \| User can select multiple seats;
  capacity and adjacency rules are enforced if configured. \|

| FR-16 \| Booking cancellation and refund rules \| P1 \| Eligibility
  and refund amount are calculated from policy and displayed before
  confirmation. \|

| FR-17 \| Booking modification \| P2 \| User can request/change dates
  or assets subject to availability and policy. \|

| FR-18 \| Booking QR/pass and check-in \| P1 \| Confirmed booking has
  unique reference and scannable or verifiable pass. \|

### 6.4 Payments and notifications

| ID \| Requirement \| Priority \| Acceptance criteria \|

| --- \| --- \| --- \| --- \|

| FR-19 \| Payment gateway integration \| P0 \| Successful, failed,
  cancelled and pending payment outcomes are handled. \|

| FR-20 \| Price breakdown \| P0 \| Subtotal, duration, discount, taxes,
  fees and total are visible. \|

| FR-21 \| Payment reconciliation/webhook handling \| P0 \| Server
  verifies gateway callback before confirming a paid booking. \|

| FR-22 \| Email and in-app confirmation \| P0 \| Booking confirmation
  includes booking ID, property, selected asset and schedule. \|

| FR-23 \| Reminder notifications \| P2 \| Reminder can be sent before
  check-in, subject to notification configuration. \|

### 6.5 Partner and admin

| ID \| Requirement \| Priority \| Acceptance criteria \|

| --- \| --- \| --- \| --- \|

| FR-24 \| Partner onboarding and verification \| P0 \| Unapproved
  partners/listings are not publicly bookable. \|

| FR-25 \| Floor-plan/seat-map management \| P0 \| Partner can create
  floors/zones and place named inventory items. \|

| FR-26 \| Pricing and availability calendar \| P0 \| Partner can set
  operating hours, prices, blackout dates and maintenance blocks. \|

| FR-27 \| Booking operations and check-in \| P1 \| Partner can view,
  search and update eligible booking statuses. \|

| FR-28 \| Admin approval and moderation \| P0 \| Admin can approve,
  reject, suspend or request changes. \|

| FR-29 \| Admin booking/payment/refund support tools \| P1 \| Admin can
  inspect booking and payment history with audit trail. \|

| FR-30 \| Partner analytics \| P2 \| Partner sees bookings, occupancy
  and revenue for a selected period. \|

## 7. Interactive Seat Map --- Key Product Feature

This is the signature experience. It should be inspired by the clarity
of BookMyShow's seat selector, but use a floor-plan metaphor rather than
theatre rows.

### 7.1 Map layout

Show floor selector (Ground Floor, First Floor, etc.) and optional zone
selector.

Render desks as small numbered rectangles/circles and cabins as larger
outlined areas with capacity labels.

Provide zoom, pan and fit-to-screen controls for larger floors.

Show a legend that remains visible on desktop and is accessible on
mobile.

On selection, open a side panel (desktop) or bottom sheet (mobile) with
asset name, type, capacity, facilities, price and selection action.

For group bookings, optionally highlight adjacent desks or cabins that
satisfy requested capacity.

### 7.2 Seat status and visual language

| Status \| Meaning \| Customer interaction \|

| --- \| --- \| --- \|

| Available \| Can be selected for chosen period \| Selectable \|

| Selected \| Chosen by current user \| Can deselect \|

| Held \| Temporarily reserved during another checkout \| Disabled; show
  unavailable/held \|

| Booked \| Confirmed overlapping reservation \| Disabled \|

| Blocked \| Partner/admin has blocked the asset \| Disabled \|

| Maintenance \| Not usable due to maintenance \| Disabled \|

| Not applicable \| Decorative area, walkway or non-bookable space \|
  Not selectable \|

Do not rely on colour alone. Add text labels, icons, patterns or
accessible tooltips so users with colour-vision deficiencies can
understand states.

### 7.3 Map behaviour

Changing the date, time or duration must refresh availability for every
asset on the map.

The map is a view of server-authoritative inventory; client-side status
is never sufficient to guarantee a booking.

When a user selects a seat, the UI should show it as selected but should
acquire a server-side hold when the user proceeds to reserve/checkout.

If another user books the seat first, refresh the map and explain that
the seat is no longer available.

For monthly plans, show availability across the entire requested period;
do not mark an asset available based only on the first day.

## 8. Booking Rules and State Model

### 8.1 Booking lifecycle

| Status \| Description \| Allowed next states \|

| --- \| --- \| --- \|

| Draft \| User has started but not submitted a booking \| Held /
  Abandoned \|

| Held \| Inventory is temporarily locked during checkout \| Confirmed /
  Payment Pending / Expired / Cancelled \|

| Payment Pending \| Payment initiated; awaiting verified result \|
  Confirmed / Failed / Expired \|

| Confirmed \| Payment/approved booking is complete \| Checked In /
  Cancelled / No-show \|

| Checked In \| Customer has arrived and is using the space \| Completed
  \|

| Completed \| Reservation period has ended \| Closed \|

| Cancelled \| Reservation cancelled under policy \| Refund Pending /
  Refunded / Closed \|

| Expired \| Temporary hold or payment window elapsed \| Closed \|

| No-show \| Customer did not arrive within configured grace period \|
  Closed \|

### 8.2 Availability logic

For an exclusive desk or cabin, a requested interval is available only
if it does not overlap any active confirmed booking, unexpired hold,
partner block or maintenance block. Use half-open intervals \[start,
end) so a booking ending at 12:00 does not conflict with a new booking
starting at 12:00, if the property's turnover rules allow it.

Conceptual overlap condition: existing_start \< requested_end AND
existing_end \> requested_start. Apply this check on the server within a
database transaction or equivalent concurrency-safe operation.

Hold expiry: configure a short checkout hold (recommended initial
default: 5 minutes); show a countdown.

Expired holds must be released automatically and must not block future
bookings.

Revalidate availability immediately before confirmation, even if the UI
previously showed the asset as available.

Use database constraints, transaction locks or an equivalent
concurrency-safe mechanism to prevent double booking.

For payment gateway redirects/webhooks, make booking confirmation
idempotent so duplicate callbacks cannot create duplicate reservations.

For shared hot-desk pools, manage capacity per time interval rather than
treating every booking as a named exclusive seat.

### 8.3 Day and monthly plan rules

| Plan \| Suggested behaviour \| Decisions to configure per property \|

| --- \| --- \| --- \|

| Hourly (optional) \| Select date, start time and duration \| Minimum
  duration, time slots, buffers, operating hours \|

| Day pass \| Select a date; booking covers configured day hours \| Day
  definition, check-in window, late arrival and overrun policy \|

| Monthly \| Select start date and monthly term; reserve a seat/cabin
  for the term \| Calendar-month vs rolling 30 days, renewal, deposit,
  cancellation notice, prorating \|

| Custom multi-day \| Select start/end date \| Maximum duration, weekly
  pricing, closed days and partial-day handling \|

Product decision required: monthly bookings should initially be treated
as a fixed-term reservation with a clear start date, end date, renewal
policy and payment schedule. Avoid implying automatic recurring billing
unless that is deliberately implemented and supported by the payment
provider.

## 9. Pricing, Checkout and Payments

### 9.1 Price components

Base rate: per hour, day, week or month according to the inventory plan.

Quantity: number of desks/seats or cabins.

Optional add-ons: locker, monitor, meeting-room credits or parking if
supported.

Discount/promo code, platform fee or service fee if applicable.

Applicable taxes and final payable amount.

### 9.2 Checkout screen

Property name and address.

Selected floor, desk/cabin ID, inventory type and capacity.

Booking dates, start/end time and timezone.

Itemised price, tax, discounts, fees and total.

Cancellation and refund policy with acknowledgement.

Customer name, email and phone; login/OTP verification as appropriate.

Payment method and clear payment status.

Use a payment provider that supports the project's country, business
model, refunds and webhook verification. Never store raw card numbers or
CVV. Store provider references and transaction status only. For a
student demo, a sandbox payment flow is acceptable; label it clearly as
test mode.

## 10. UI/UX Requirements and Visual Direction

### 10.1 Design principles

Familiar marketplace experience: search first, compare options, then
book.

Trust through transparency: show real photos, verified partner status,
amenities, policies and complete price.

Low-friction booking: keep progress visible and avoid asking for
unnecessary details too early.

Map-first selection: make the interactive floor map the central decision
point on the property page.

Responsive by default: seat map and checkout must work on phone, tablet
and desktop.

Accessible states: keyboard navigation, focus indicators, readable
contrast and non-colour status cues.

### 10.2 Suggested visual system

| Element \| Recommendation \|

| --- \| --- \|

| Brand feel \| Modern, professional, calm and productivity-focused \|

| Primary colour \| Deep navy or indigo for trust and navigation \|

| Accent \| Teal or bright blue for primary actions and selected
  inventory \|

| Background \| Warm light grey/white with clear card surfaces \|

| Typography \| Readable sans-serif such as Inter, system UI or similar
  \|

| Cards \| Large workspace photo, title, locality, rating, key amenities
  and from-price \|

| Buttons \| One strong primary action per screen; consistent labels \|

| Mobile navigation \| Compact header and bottom navigation for Home,
  Search, Bookings and Profile \|

### 10.3 Key screens to design

| Screen \| Core content / actions \|

| --- \| --- \|

| Home \| Location search, date/duration, popular spaces, categories and
  featured properties \|

| Search results \| Filters, sorting, list/map toggle, workspace cards
  \|

| Workspace details \| Gallery, location, amenities, policies, pricing
  and availability CTA \|

| Date & plan selector \| Date picker, time/duration or day/month plan
  \|

| Seat map \| Floor tabs, legend, zoom/pan, selectable desks/cabins and
  details panel \|

| Booking review \| Selected assets, schedule, price breakdown and
  policy \|

| Checkout \| Contact details, payment method and final confirmation \|

| Booking success \| Booking ID, QR pass, directions, schedule and
  manage booking \|

| My bookings \| Upcoming/active/past/cancelled tabs and booking detail
  \|

| Partner dashboard \| Occupancy overview, booking calendar, inventory
  and revenue \|

| Map editor \| Floor/zone creation and drag/drop placement of assets \|

| Admin dashboard \| Approvals, users, listings, bookings, payments and
  reports \|

## 11. Recommended Technical Architecture

For a mini project, use a modular monolith rather than microservices. It
is easier to build, test and deploy while keeping clear separation
between modules. The architecture can be split into services later if
the product grows.

| Layer \| Recommended option \| Responsibilities \|

| --- \| --- \| --- \|

| Frontend \| Next.js (React) + TypeScript \| Responsive pages, search,
  seat map, dashboards and client state \|

| UI styling \| Tailwind CSS + a component library \| Design system,
  responsive layout and reusable components \|

| Backend \| Node.js + NestJS or Express + TypeScript \| Authentication,
  listings, availability, booking, payments and admin APIs \|

| Database \| PostgreSQL \| Users, properties, inventory, bookings,
  pricing, payments and audit records \|

| ORM \| Prisma or TypeORM \| Schema management, migrations and typed
  database access \|

| Realtime updates \| WebSockets / Socket.IO or server-sent events \|
  Push seat status changes to active viewers \|

| Cache / hold expiry \| Redis (optional for MVP) \| Short-lived holds,
  rate limits and event distribution \|

| Media storage \| Cloud object storage \| Workspace photos, floor-plan
  images and verification files \|

| Maps \| Map provider such as Google Maps or Mapbox \| Address search,
  geocoding and property location \|

| Payments \| India-supported gateway in test mode initially \| Payment
  initiation, verification, refunds and webhooks \|

| Notifications \| Email provider; SMS/WhatsApp integration optional \|
  Booking confirmations, reminders and status updates \|

| Deployment \| Frontend/backend hosting + managed PostgreSQL \|
  Environments, HTTPS, backups and deployment pipeline \|

### 11.1 High-level architecture

CUSTOMER WEB \| PARTNER DASHBOARD \| ADMIN DASHBOARD ↓ FRONTEND / API
CLIENT ↓ BACKEND APPLICATION
┌────────────┬────────────┬─────────────┬────────────┐ │ Auth/User │
Search │ Inventory │ Booking │ │ Module │ Module │ & Map │ & Holds │
├────────────┼────────────┼─────────────┼────────────┤ │ Payments │
Pricing │ Partner │ Admin │ │ Module │ Module │ Module │ Module │
└────────────┴────────────┴─────────────┴────────────┘ ↓ POSTGRESQL \|
REDIS (OPTIONAL) \| FILE STORAGE ↓ PAYMENT GATEWAY \| EMAIL/SMS \| MAP
PROVIDER

### 11.2 Core backend modules

Identity and access: registration, login, OTP/email verification,
role-based permissions.

Workspace catalogue: properties, branches, photos, amenities, policies
and publication status.

Inventory: floors, zones, desks, cabins, capacities, features and
status.

Availability: interval overlap checks, opening hours, blocks,
maintenance and temporary holds.

Booking: booking lifecycle, booking items, cancellation and check-in.

Pricing: rate plans, discounts, taxes, fees and price snapshots.

Payments: payment intents/orders, gateway callbacks, refunds and
reconciliation.

Notifications: transactional email/SMS/in-app events.

Partner operations and admin: approval, reports, audit logs and support
actions.

## 12. Data Model --- Initial Database Entities

| Entity \| Important fields / relationships \|

| --- \| --- \|

| User \| id, name, email, phone, password_hash/provider_id, role,
  verification_status, created_at \|

| Partner \| id, owner_user_id, business_name, verification_status,
  payout_profile_reference \|

| Property \| id, partner_id, name, description, address, latitude,
  longitude, timezone, opening_hours, status \|

| Amenity \| id, name, icon; many-to-many with Property \|

| Floor \| id, property_id, name, sort_order, optional_map_asset \|

| Zone \| id, floor_id, name, type \|

| InventoryItem \| id, zone_id, code, name, type, capacity, features,
  map_x, map_y, width, height, active_status \|

| RatePlan \| id, inventory_type/property_id, billing_unit, price,
  minimum_duration, rules, valid_from/to \|

| AvailabilityBlock \| id, inventory_item_id or zone_id, start_at,
  end_at, reason, created_by \|

| Booking \| id, user_id, property_id, start_at, end_at, status,
  subtotal, tax, total, currency, policy_snapshot \|

| BookingItem \| id, booking_id, inventory_item_id or pool_id, quantity,
  unit_price_snapshot \|

| InventoryHold \| id, user_id, inventory_item_id, start_at, end_at,
  expires_at, status \|

| Payment \| id, booking_id, provider, provider_reference, amount,
  status, idempotency_key \|

| Refund \| id, payment_id, amount, status, provider_reference \|

| Review \| id, user_id, property_id, booking_id, rating, comment,
  moderation_status \|

| Notification \| id, user_id, type, channel, payload, delivery_status,
  created_at \|

| AuditLog \| id, actor_user_id, action, entity_type, entity_id,
  metadata, created_at \|

Important modelling note: use UTC timestamps for stored instants and
retain the property's IANA timezone (for example, Asia/Kolkata) for
display and business-hour calculations. A monthly booking should store
explicit start_at and end_at rather than only a month label. Save price
and policy snapshots on the booking so later partner price changes do
not rewrite historical reservations.

## 13. API Design --- Initial Endpoint Plan

| Method / Endpoint \| Purpose \| Access \|

| --- \| --- \| --- \|

| POST /api/auth/register \| Create customer/partner account \| Public
  \|

| POST /api/auth/login \| Authenticate user \| Public \|

| GET /api/properties \| Search and filter published properties \|
  Public \|

| GET /api/properties/:id \| Property details and amenities \| Public \|

| GET /api/properties/:id/floors \| Floor map and inventory metadata \|
  Public \|

| GET /api/availability \| Availability for property, inventory and
  interval \| Public \|

| POST /api/holds \| Create temporary inventory hold \| Authenticated
  customer \|

| POST /api/bookings \| Create booking against valid hold \|
  Authenticated customer \|

| GET /api/bookings/:id \| Booking detail/status \| Owner, partner,
  admin \|

| POST /api/payments/checkout \| Create payment order/session \| Booking
  owner \|

| POST /api/payments/webhook \| Verify payment provider event \|
  Provider signature verified \|

| POST /api/bookings/:id/cancel \| Request cancellation \| Booking owner
  / authorized partner \|

| POST /api/partner/properties \| Create property listing \| Partner \|

| POST /api/partner/inventory \| Create/update inventory items \|
  Partner \|

| POST /api/partner/blocks \| Block inventory interval \| Partner \|

| GET /api/partner/bookings \| Partner reservation list \| Partner \|

| GET /api/admin/approvals \| Review pending listings \| Admin \|

All endpoints require input validation, authorization checks, consistent
error formats, pagination for lists, and server-side validation of price
and availability. The frontend must not be trusted to send the final
price or booking status.

## 14. Real-time Availability and Concurrency

Real-time in this product means the user sees changes quickly, while the
server remains the source of truth. A practical implementation is:

Client requests availability for a property and requested interval.

Backend calculates current status using bookings, unexpired holds,
partner blocks and maintenance records.

Client subscribes to updates for that property/interval using WebSocket
or server-sent events.

When a hold, booking, cancellation or block changes, backend publishes
an inventory update event.

Connected clients update the affected map item without refreshing the
entire page.

Before hold creation and final confirmation, backend rechecks inventory
inside a concurrency-safe transaction.

For an MVP, polling every 10--20 seconds can be used before WebSockets
are implemented, but booking correctness must still be enforced by the
backend and database.

## 15. Security, Privacy and Reliability

Use HTTPS everywhere and secure password hashing (Argon2id or bcrypt
with appropriate settings).

Implement role-based access control for customer, partner staff and
admin roles.

Validate ownership: a partner can only edit their own properties and
bookings.

Rate-limit authentication, OTP, search and hold endpoints; protect
against brute force and abuse.

Validate payment webhooks using provider signatures; use idempotency
keys for payment and booking operations.

Do not store raw card data, CVV or unnecessary identity documents.

Use secure cookies/session handling, CSRF protection where applicable,
and output/input sanitization.

Maintain audit logs for partner/admin changes, booking overrides and
refunds.

Back up the database and define recovery procedures.

Collect only required personal data; publish privacy, cancellation and
terms policies.

## 16. Non-functional Requirements

| Area \| Target / requirement \|

| --- \| --- \|

| Performance \| Typical search/detail API response target under 2
  seconds at normal demo load; map should render progressively. \|

| Availability correctness \| No confirmed overlapping bookings for the
  same exclusive asset. \|

| Realtime freshness \| Seat changes should normally appear within a few
  seconds for connected users. \|

| Scalability \| Support multiple properties, floors and hundreds of
  inventory items per property without redesign. \|

| Accessibility \| Keyboard-accessible controls, visible focus,
  sufficient contrast and semantic labels. \|

| Responsive design \| Core journey works at mobile widths, tablet and
  desktop. \|

| Maintainability \| Modular code, typed APIs, migrations, linting and
  documented setup. \|

| Observability \| Structured logs for booking/payment failures and
  basic health checks. \|

| Compatibility \| Current versions of major desktop and mobile
  browsers. \|

## 17. Analytics and Success Metrics

| Metric \| Definition / purpose \|

| --- \| --- \|

| Search-to-detail rate \| Share of searches that lead to a workspace
  detail view \|

| Detail-to-booking conversion \| Share of detail views that start
  checkout or complete a booking \|

| Booking completion rate \| Confirmed bookings divided by checkout
  starts \|

| Search no-result rate \| Searches that return no suitable available
  spaces \|

| Seat-map interaction rate \| Share of property detail visitors who
  interact with the map \|

| Availability conflict rate \| Attempts rejected because inventory
  became unavailable \|

| Cancellation rate \| Cancelled bookings divided by confirmed bookings
  \|

| Partner activation \| Approved partners with at least one bookable
  listing \|

| Inventory utilization \| Booked time divided by bookable operating
  time \|

| Payment success rate \| Successful verified payments divided by
  payment attempts \|

## 18. MVP Prioritisation and Release Plan

| Phase \| Scope \| Exit criteria \|

| --- \| --- \| --- \|

| Phase 1 --- Foundation \| Brand/UI, auth, roles, property catalogue,
  partner listing creation, basic admin approval \| Users can register;
  partner can create a listing; admin can approve it. \|

| Phase 2 --- Discovery \| Home, search, filters, property details,
  photos, amenities and pricing display \| Customer can find and inspect
  published workspaces. \|

| Phase 3 --- Inventory map \| Floors, zones, desks/cabins, map editor
  and status legend \| Partner can create inventory; customer can view
  and select available assets. \|

| Phase 4 --- Booking engine \| Availability interval checks, holds,
  day/month plans, booking lifecycle \| No double booking under
  simultaneous attempts; hold expiry works. \|

| Phase 5 --- Payments \| Sandbox gateway, webhook verification,
  receipts, cancellation/refund basics \| Verified payment creates one
  confirmed booking; failure does not confirm. \|

| Phase 6 --- Operations \| Partner booking management, check-in, admin
  support and notifications \| Partner can manage reservations; customer
  receives booking confirmation. \|

| Phase 7 --- Polish \| Responsive QA, accessibility, analytics,
  security review and deployment \| End-to-end tests pass on mobile and
  desktop; demo environment is stable. \|

### 18.1 Must-have MVP features

Customer signup/login and role-based access.

Partner listing and inventory creation.

Admin listing approval.

Property search and detail page.

Interactive floor map with desks and cabins.

Date/day and monthly booking options with clearly defined rules.

Availability validation, temporary holds and double-booking prevention.

Booking summary, sandbox payment and confirmation page.

Customer booking history and partner booking dashboard.

### 18.2 Features to defer

Reviews and ratings, promo campaigns and loyalty points.

Recurring auto-renewal and complex subscription billing.

Advanced dynamic pricing and demand forecasting.

Native apps, access-control hardware and third-party operator
integrations.

Complex multi-property corporate accounts and invoicing workflows.

## 19. QA and Acceptance Test Scenarios

A customer can search by locality and see only published workspaces.

A customer can open a property and view photos, amenities, policies and
prices.

A customer can switch floors and see the correct seat map.

Available seats are selectable; booked, held, blocked and maintenance
seats are not.

Changing the date or duration recalculates all map statuses.

A seat booked by one user becomes unavailable to another user for an
overlapping period.

Two users attempting to reserve the same desk at the same time cannot
both confirm.

An expired hold releases inventory automatically.

A failed or cancelled payment does not create a confirmed paid booking.

A verified successful payment confirms exactly one booking, even if the
webhook is delivered more than once.

A monthly booking checks the entire requested term, not just its start
date.

Partner A cannot edit Partner B's property or booking.

Admin can reject or suspend a listing and it disappears from public
search.

Customer can view booking ID, dates, selected desk/cabin and
cancellation policy.

Core screens and seat selection work on mobile, tablet and desktop.

## 20. Risks, Open Decisions and Mitigations

| Risk / decision \| Why it matters \| Recommended approach \|

| --- \| --- \| --- \|

| Monthly availability semantics \| A seat may be free today but booked
  next week \| Check full interval; define monthly term and renewal
  clearly. \|

| Double booking \| Two customers may select the same desk concurrently
  \| Server-side holds, transaction-safe confirmation and database
  protection. \|

| Partner map setup complexity \| Accurate floor plans take effort to
  create \| Provide a simple drag/drop editor and a list-based fallback.
  \|

| Different inventory models \| Hot desks are pooled; dedicated desks
  are exclusive \| Support named assets first; add pooled capacity as a
  separate inventory model. \|

| Payment callback delays \| Gateway status may arrive asynchronously \|
  Use pending state, verified webhooks, idempotency and reconciliation.
  \|

| Cancellation disputes \| Policies vary by partner and duration \| Show
  policy before payment and store policy snapshot with booking. \|

| Map on small screens \| Large floor plans are difficult to use on
  mobile \| Zoom/pan, bottom-sheet details, accessible list alternative.
  \|

| Tax and invoicing \| Tax treatment may depend on partner and
  jurisdiction \| Keep tax configuration explicit; confirm
  legal/accounting rules before launch. \|

### 20.1 Product decisions to confirm before implementation

Will MVP support hourly bookings, or only day and month bookings?

Will monthly booking mean rolling 30 days or calendar month?

Will hot desks be assigned a specific seat, or will the user book a
capacity pool?

Can users book multiple desks in one checkout?

Will customers pay online only, or can partners approve pay-at-location?

What are the cancellation, refund, check-in grace-period and no-show
rules?

Will the platform charge a commission, listing fee or subscription to
workspace partners?

Which payment gateway and map provider will be used for the demo and
eventual launch?

## 21. Suggested Project Team Responsibilities

| Role \| Responsibilities \|

| --- \| --- \|

| Product manager / project lead \| Scope, user stories, priorities,
  acceptance criteria and coordination \|

| UI/UX designer \| User flows, wireframes, design system, responsive
  screens and seat-map usability \|

| Frontend developer \| Customer website, partner/admin dashboards, map
  interactions and API integration \|

| Backend developer \| Auth, database, search, availability, booking,
  payments and notifications \|

| QA / tester \| Functional, responsive, concurrency, payment and
  regression testing \|

| All team members \| Code reviews, documentation, demo preparation and
  issue tracking \|

## 22. Recommended Development Order

Finalise product decisions in Section 20.1 and lock the MVP scope.

Create user flows and low-fidelity wireframes for customer, partner and
admin journeys.

Design the database schema and booking/availability state model before
building the seat map.

Build authentication, roles, property catalogue and partner listing
workflows.

Build floor/zone/inventory management and the interactive map.

Implement server-side availability, temporary holds and concurrency
protection.

Build checkout, sandbox payments, webhooks and booking confirmation.

Complete partner operations, admin tools, notifications and QA.

Deploy a staging demo, seed realistic sample properties and run
end-to-end tests.

## 23. Definition of Done

The customer can complete a booking from search to confirmation without
manual database intervention.

Partner can publish an approved property and maintain its inventory and
availability.

Admin can approve listings and inspect bookings.

The map shows correct status for the selected booking interval.

Concurrent booking tests prove that exclusive inventory cannot be
double-booked.

Payment success/failure and duplicate webhook scenarios are tested.

Core journey works on mobile and desktop.

Setup instructions, environment variables, database migrations and API
documentation are available.

The deployed demo uses test payment credentials and clearly identifies
test-mode transactions.

## Appendix A --- Example Customer Booking

Example: A freelancer wants one desk in Andheri, Mumbai, for 27 October
2026, from 9:00 AM to 6:00 PM. They search for Andheri, filter for day
passes and Wi-Fi, open a workspace, select the date, inspect the floor
map and choose Desk D-08. The system creates a short hold, displays the
total and cancellation policy, accepts a sandbox payment, verifies the
payment callback and confirms booking CW-10482. The desk becomes
unavailable for overlapping times, and the customer sees a QR booking
pass.

## Appendix B --- Key Product Principle

The seat map is not merely a visual decoration. It is a live
representation of the booking inventory. Every displayed status must be
derived from the same backend rules used to create and confirm bookings.
The platform should never promise a seat based only on a stale frontend
state.

## Appendix C --- Glossary

| Term \| Meaning \|

| --- \| --- \|

| Hot desk \| Flexible seat selected for a booking period; may be
  allocated from a pool. \|

| Dedicated desk \| Specific desk reserved for one customer for a
  defined term. \|

| Private cabin \| Enclosed workspace, usually with capacity greater
  than one. \|

| Inventory item \| Bookable desk, cabin or other resource. \|

| Hold \| Temporary reservation preventing another user from taking
  inventory during checkout. \|

| Overlap \| Two time intervals that share any bookable time. \|

| Partner \| Workspace operator listing and managing a property on the
  platform. \|

| Webhook \| Server-to-server event from a payment provider or other
  external system. \|
