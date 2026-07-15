# Flavours by DishDash — API Design Document

> **Maqsad:** Ye document poori app ko splash se lekar order tak analyze karke batata hai ki
> **kaun kaun se API banane hain**, har API mein **kya parameters** jaayenge aur **kya response**
> aayega. Abhi frontend poora **mock / local data** (`src/data/*`) aur React Context state pe chal
> raha hai — koi real backend nahi hai. `src/services/api.ts` sirf ek khaali axios instance hai.
> Ye doc us backend ka blueprint hai.

---

## 0. Current State — abhi kya hai

| Cheez | Status |
|---|---|
| `src/services/api.ts` | Sirf axios instance banaya hai (`baseURL`, `timeout: 15000`). Koi endpoint call nahi. |
| `.env` | `API_BASE_URL=https://api.example.com` (placeholder) |
| Data | Sab hardcoded: `data/menu.ts`, `data/reservations.ts`, `data/loyalty.ts`, `data/catering.ts`, `data/countries.ts` |
| State | React Context mein rehta hai (`CartContext`, `OrderContext`, `ReservationContext`, `LoyaltyContext`, `CateringContext`). App band → data gayab. |
| Auth | Sirf navigation. OTP screen mein already `// TODO: POST /auth/otp/verify` comment likha hai. |
| Order status | `OrderContext` fake timer se `placed → preparing → ready → pickedup` aage badhata hai (8 sec har step). Real backend/websocket nahi. |

**Matlab:** Backend ko in saare mock sources ko replace karna hai real REST API se.

---

## 1. Global Conventions — sab APIs pe laagu

Ye rules ek baar decide karo, saare endpoints follow karenge.

### Base URL
```
Production : https://api.dishdash.app/v1
Staging    : https://staging-api.dishdash.app/v1
```
Frontend mein `API_BASE_URL` env se aata hai (`src/config/env.ts`), toh sirf `.env` badalna hoga.

### Authentication
- Login ke baad backend **JWT access token + refresh token** dega.
- Har protected request mein header: `Authorization: Bearer <accessToken>`
- Access token short-lived (e.g. 15 min), refresh token long-lived (e.g. 30 days).
- Frontend token ko `AsyncStorage` mein save karega (abhi wahi onboarding flag ke liye use ho raha hai).

### Standard Headers
```
Authorization: Bearer <token>      (protected routes)
Content-Type: application/json
Accept-Language: en | ar           (app UAE-focused, Arabic future ke liye)
X-Device-Id: <uuid>                (push notifications + fraud)
```

### Standard Response Envelope
Har response ek jaisa dikhe:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 42 }
}
```
Error:
```json
{
  "success": false,
  "error": {
    "code": "OTP_INVALID",
    "message": "That didn't match. 2 tries left.",
    "field": "otp"
  }
}
```
> `message` ko frontend seedha toast/helper text mein dikha sakta hai (jaise OTP screen ka
> "That didn't match. N tries left." — error-matrix #5/#6 pehle se code mein referenced hai).

### Common HTTP Codes
| Code | Kab |
|---|---|
| 200 | OK |
| 201 | Ban gaya (order/booking/inquiry created) |
| 400 | Galat input |
| 401 | Token nahi / expire |
| 403 | Allowed nahi |
| 404 | Nahi mila |
| 409 | Conflict (slot already booked, promo already used) |
| 422 | Validation fail |
| 429 | Too many requests (OTP spam) |

### Money
- Sari currency **AED**, integer ya 2-decimal. Frontend `Dirham` icon dikhata hai.
- VAT = 5% (`VAT_RATE` cart & payment dono mein hardcoded hai — backend authoritative ho).
- Service fee = 6.00 AED (Payment screen). Ye backend se aana chahiye, hardcode nahi.

---

## 2. Auth & Onboarding APIs

**Flow (screens):** `Splash → SignIn → (Google/Apple Handoff) → PhoneVerify → OTP → ProfileSetup → Location → Notifications → WelcomeCelebration → WelcomeVoucher → MainTabs`

Do raste hain:
1. **Phone path:** SignIn → OTP (fromSso=false) → ProfileSetup (blank form)
2. **SSO path:** SignIn → Handoff(google/apple) → PhoneVerify → OTP (fromSso=true) → ProfileSetup (prefilled naam/email)

### 2.1 `POST /auth/otp/request`
WhatsApp/SMS pe 6-digit code bhejo. (SignIn + PhoneVerify dono se call)

**Request:**
```json
{
  "phone": "+971 50 1234567",
  "countryIso": "AE",
  "channel": "whatsapp",          // "whatsapp" | "sms"
  "provider": "google"            // optional: SSO path mein linking ke liye
}
```
**Response 200:**
```json
{
  "success": true,
  "data": { "requestId": "otp_a3f2k9", "expiresInSec": 45, "resendAfterSec": 45 }
}
```
> Frontend mein resend timer `RESEND_SECONDS = 45` hai — backend `resendAfterSec` de.
> Validation: UAE = 9 digits after +971, baaki >= 6 digits (SignIn screen logic).

**Errors:** `429 RATE_LIMITED`, `400 PHONE_INVALID`

### 2.2 `POST /auth/otp/verify`
Code verify karo, session banao. (OTP screen — `verify()` mein `// TODO` yahi hai)

**Request:**
```json
{
  "requestId": "otp_a3f2k9",
  "phone": "+971 50 1234567",
  "code": "123456",
  "fromSso": false,
  "provider": null                // "google" | "apple" | null
}
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "isNewUser": true,            // true → ProfileSetup pe bhejo
    "user": {
      "id": "usr_123",
      "phone": "+971 50 1234567",
      "firstName": null,
      "profileComplete": false
    }
  }
}
```
**Errors:**
- `401 OTP_INVALID` → message: "That didn't match. 2 tries left." (frontend `setHelper` mein dikhata hai)
- `410 OTP_EXPIRED` → resend karwao
- `429 OTP_MAX_ATTEMPTS`

### 2.3 `POST /auth/sso`
Google/Apple ID token verify karo. (Handoff screen ke baad)

**Request:**
```json
{
  "provider": "google",           // "google" | "apple"
  "idToken": "<provider token>"
}
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "needsPhoneVerify": true,     // true → PhoneVerify screen
    "prefill": { "firstName": "Layla", "lastName": "Hassan", "email": "layla.hassan@gmail.com" }
  }
}
```
> `prefill` seedha `ProfileSetup` ke `route.params.prefill` mein use hota hai (type: `ProfilePrefill`).

### 2.4 `POST /auth/profile` (ya `PUT /users/me`)
Profile setup save karo. (ProfileSetup screen — `finish()` mein `// TODO: POST /auth/profile`)

**Request (multipart if avatar):**
```json
{
  "firstName": "Layla",
  "lastName": "Hassan",
  "email": "layla.hassan@gmail.com",
  "dob": "1999-01-15",            // ISO; app se "DD / MM / YYYY"
  "marketingOptIn": true,         // "Send me good stuff" checkbox
  "referralCode": "FRIEND50",     // optional, expandable field
  "avatar": "<file upload>"       // optional, ImagePicker se
}
```
**Response 200:** updated `user` object. `profileComplete: true`.
**Errors:** `422 EMAIL_INVALID`, referral galat → `404 REFERRAL_NOT_FOUND` (frontend "That code didn't work. Try another." toast dikhata hai).

### 2.5 `POST /auth/referral/validate` (optional, alag se)
Referral "Apply" button turant check kare (poora profile save kiye bina).
**Request:** `{ "code": "FRIEND50" }` → **Response:** `{ "valid": true, "reward": "You both get 100 pts" }`

### 2.6 `POST /auth/token/refresh`
**Request:** `{ "refreshToken": "eyJ..." }` → **Response:** naya `accessToken` (+ optionally rotate refresh).

### 2.7 `POST /auth/logout`
**Request:** `{ "refreshToken": "eyJ..." }` → token invalidate. (Profile/Settings se)

### 2.8 `POST /users/me/push-token` (Notifications screen)
Device push token register karo permission grant ke baad.
```json
{ "deviceId": "<uuid>", "pushToken": "<fcm/apns token>", "platform": "ios" }
```

### 2.9 `POST /users/me/location` (Location screen)
User ka last-known location save (nearest branch + delivery ke liye).
```json
{ "lat": 25.197, "lng": 55.279, "emirate": "Dubai" }
```

---

## 3. Home / Dashboard APIs

**Screen:** `HomeDashboardScreen` — teal header + rewards card + brand picker + promo carousel + Tonight's Picks + pinned Status Strip (active order).

### 3.1 `GET /home/dashboard`
Ek hi call mein poora home feed (network trips kam). Alternatively niche wale alag endpoints.
**Response:**
```json
{
  "success": true,
  "data": {
    "greeting": "Good evening, Layla",
    "loyalty": { "points": 1550, "tier": "savor", "nextTier": "feast", "progress": 0.275 },
    "brands": [ { "key": "Karaz", "name": "Karaz", "cuisine": "LEVANTINE · MEZZE & GRILL", "rating": 4.7 } ],
    "promos": [ { "id": "promo1", "title": "...", "image": "https://...", "cta": "BrandPage", "brand": "Karaz" } ],
    "tonightsPicks": [ /* MenuItem[] */ ],
    "activeOrder": { "id": "CRV-00123", "brand": "Karaz", "status": "preparing", "itemCount": 3, "total": 246.8 }
  }
}
```
> `activeOrder` null bhi ho sakta hai. Ye Status Strip aur Orders tab dono feed karta hai (`OrderContext.active`).

### 3.2 `GET /promos` (agar alag chahiye)
PromoCarousel ke banners. Params: `?location=Dubai`

### 3.3 `GET /branches?lat=&lng=`
Home location sheet + Cart "Switch branch" + nearest branch. Har brand ke branches, distance ke saath.

---

## 4. Menu / Catalog APIs (Brand → Dish → Search)

**Screens:** `BrandPageScreen`, `DishDetailScreen`, `SearchScreen`, `ExploreScreen`.
**Model source:** `data/menu.ts` (`MenuItem`, `BrandInfo`, `BrandKey = 'Karaz' | 'Jade'`).

### 4.1 `GET /brands`
Saari brands list. **Response:** `BrandInfo[]` — `{ key, name, cuisine, tagline, rating, ratingCount, priceLevel, tags, color, branch, distance, address, prepTime, categories[] }`

### 4.2 `GET /brands/{brandKey}`
Ek brand ka detail (BrandPage header). Path param: `brandKey` = `Karaz` | `Jade`.

### 4.3 `GET /brands/{brandKey}/menu`
Brand ka poora menu, category-wise. (BrandPage)
**Query:** `?category=Mezze` (optional), `?category=Most Ordered` → popular items (frontend `itemsForCategory` ye logic karta hai).
**Response:** `MenuItem[]`:
```json
{
  "id": "k-truffle-hummus",
  "brand": "Karaz",
  "name": "Truffle Hummus",
  "desc": "Chickpea purée · black truffle · olive oil · pine nuts...",
  "price": 65,
  "oldPrice": 78,          // optional (discount dikhane ke liye)
  "discountPct": 30,       // optional
  "category": "Mezze",
  "image": "https://cdn.dishdash.app/dishes/hummus.jpg",
  "popular": true,
  "soldOut": false
}
```
> Abhi `image` local `require()` hai — backend CDN URL de, aur frontend ko `FastImage` pe move karna hoga (already `react-native-fast-image` installed hai).

### 4.4 `GET /items/{itemId}`
Single dish detail (DishDetail screen). Path param `itemId` (e.g. `k-mansaf`).
Response mein extra ho sakta: ingredients, allergens, addons/modifiers, calories.

### 4.5 `GET /search`
Search screen. **Query:** `?q=hummus&brand=Karaz` → matching `MenuItem[]`.
> Optional: recent searches, popular searches endpoints.

---

## 5. Cart & Order APIs ⭐ (Core Flow)

**Screens:** `CartScreen → PaymentScreen → OrderSuccessScreen → OrderStatusScreen`, aur `OrdersHomeScreen`.
**State:** `CartContext` (lines, qty, subtotal), `OrderContext` (active order, status stages).

Do design options — recommend **Option A**:

- **Option A (Recommended):** Cart client-side hi rahe (jaise abhi hai), sirf **checkout/order pe** backend hit ho. Simple, offline-friendly.
- **Option B:** Server-side cart (`/cart` CRUD). Tab kaam ka jab multi-device sync chahiye. Abhi zaroorat nahi.

### 5.1 `POST /cart/validate` (checkout se pehle — recommended)
Cart bhejo, backend prices/stock/fees verify karke bill wapas de. (Cart → Payment jaate waqt)
**Request:**
```json
{
  "brandKey": "Karaz",
  "branchId": "karaz-dubai-mall",
  "items": [ { "itemId": "k-mansaf", "qty": 2 }, { "itemId": "addon-fries", "qty": 1 } ],
  "pickup": { "type": "now" },              // { "type": "later", "at": "2026-07-06T19:30:00Z" }
  "tip": 20,
  "skipCutlery": false,
  "promoCode": "WELCOME10",
  "note": "No onion, allergies"
}
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "subtotal": 156.00,
    "serviceFee": 6.00,
    "vat": 7.80,
    "tip": 20.00,
    "discount": 15.60,          // promo laga toh
    "total": 174.20,
    "pointsToEarn": 12,         // "Earn +12 pts on this order"
    "unavailableItems": []      // agar koi sold out ho gaya
  }
}
```
> Ye endpoint se hi frontend ka hardcoded `SERVICE_FEE = 6.0`, `VAT_RATE = 0.05` aur `+12 pts`
> backend-authoritative ban jaate hain.

### 5.2 `POST /promos/apply` (Cart & Payment "Apply" button)
**Request:** `{ "code": "WELCOME10", "cartSubtotal": 156.00, "brandKey": "Karaz" }`
**Response:** `{ "valid": true, "discount": 15.60, "label": "10% off" }`
**Errors:** `404 PROMO_NOT_FOUND`, `409 PROMO_ALREADY_USED`, `422 PROMO_MIN_NOT_MET`

### 5.3 `POST /orders` ⭐ (Pay button — OrderSuccess trigger)
Order place karo. (PaymentScreen `onPay()` — abhi `placeOrder()` local context call karta hai)
**Request:**
```json
{
  "brandKey": "Karaz",
  "branchId": "karaz-dubai-mall",
  "items": [ { "itemId": "k-mansaf", "qty": 2, "note": "" } ],
  "pickup": { "type": "now" },
  "tip": 20,
  "skipCutlery": false,
  "promoCode": "WELCOME10",
  "note": "No onion",
  "payment": {
    "method": "card",                     // "apple" | "google" | "card"
    "token": "<gateway payment token>",   // Network International / Stripe token
    "saveCard": false
  }
}
```
**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "CRV-00123",
    "brand": "Karaz",
    "branch": "Dubai Mall",
    "status": "placed",                   // placed | preparing | ready | pickedup
    "itemCount": 3,
    "total": 174.20,
    "items": [ { "qty": 2, "name": "Mansaf Royale", "price": 78 } ],
    "estimatedReady": "2026-07-06T19:56:00Z",
    "paymentStatus": "paid"
  }
}
```
> Ye response exactly `ActiveOrder` type (OrderContext) ko feed karta hai. Card details app ke server
> pe kabhi store nahi (Payment screen ka trust note: "Encrypted via Network International").

### 5.4 `GET /orders/{orderId}` (OrderStatus screen)
Live status poll. `status`, `timeline`, `items`, `total`, `estimatedReady`.
Timeline stages: `placed → preparing → ready → pickedup` (`ORDER_STAGES`, `STATUS_META`).

> **Recommended:** Real-time ke liye **WebSocket** ya **push notification** — abhi frontend fake
> 8-second timer (`ADVANCE_MS`) use karta hai. Real backend chef/POS se status update karega.
> Simple shuruaat: har 10-15 sec `GET /orders/{id}` poll karo.

### 5.5 `GET /orders`
Order history + active order (OrdersHome tab). **Query:** `?status=active|past&page=1&limit=20`

### 5.6 `GET /orders/{orderId}/invoice` (OrderStatus "Download invoice")
PDF/receipt. Abhi frontend text invoice khud banata hai — backend authoritative PDF de.

### 5.7 `POST /orders/{orderId}/cancel` (agar cancel allowed)
Sirf `placed` stage se pehle.

---

## 6. Reservation APIs

**Screens:** `ReservationsHome → NewReservation → Place → WhenTable → When → ConfirmBooking → ReservationSuccess`, aur `BookingDetail`.
**Model:** `data/reservations.ts` (`Branch`, `Booking`, `SeatingArea`, `ShishaPref`, `TimeSegment`, `TimeSlot`). **State:** `ReservationContext` (`draft` + `bookings`).

### 6.1 `GET /reservation/branches`
3 reservable branches (Place screen card stack). **Response:** `Branch[]` — `{ key, name, area, rating, ratingCount, tags[], highlight, mostLoved, facts[], photos[] }`.

### 6.2 `GET /reservation/availability`
Kis din/time slot available hai. (When & WhenTable screens)
**Query:** `?branch=dubai-mall&date=2026-06-12&guests=2&seating=indoor&shisha=non`
**Response:**
```json
{
  "data": {
    "segments": {
      "Dinner": [ { "label": "19:00", "available": true }, { "label": "19:30", "available": true, "popular": true } ]
    }
  }
}
```
> Frontend `SLOTS_BY_SEGMENT`, `TIME_SEGMENTS`, guests range `MIN_GUESTS=2 / MAX_GUESTS=10` yahi backend deta hai.

### 6.3 `POST /reservation/bookings` ⭐ (ConfirmBooking → Success)
Booking banao. (`ReservationContext.createBooking()`)
**Request:**
```json
{
  "restaurant": "Karaz",
  "branch": "dubai-mall",
  "date": "2026-06-12",
  "time": "19:30",
  "guests": 2,
  "seating": "indoor",          // "indoor" | "terrace"
  "shisha": "non",              // "shisha" | "non"
  "note": "A birthday surprise — discreet candle, no song"
}
```
**Response 201:** `Booking` object with `id` (e.g. `BR-DJM-4083`), `status: "awaiting"`, `seatingLabel: "Indoor · Non-Shisha Lounge"`, `timeLabel: "7:30 PM"`.
**Errors:** `409 SLOT_TAKEN`

### 6.4 `GET /reservation/bookings`
User ki saari bookings (ReservationsHome tabs: Upcoming / Completed / Cancelled). Status: `awaiting | confirmed | completed | cancelled`.

### 6.5 `GET /reservation/bookings/{bookingId}` (BookingDetail)

### 6.6 `PATCH /reservation/bookings/{bookingId}` (ModifyBookingSheet)
Date/time/guests/seating badlo. Partial update.

### 6.7 `POST /reservation/bookings/{bookingId}/cancel`
`status → cancelled`. (`cancelBooking`)

---

## 7. Loyalty APIs

**Screens:** `LoyaltyHome, MyVouchers, WelcomeReveal, GenerateCelebration, CelebrationGenerated, MembershipTiers, ExperienceHome, ExperienceDetail, ExperienceBooked, LoyaltyBookings, PointHistory`.
**Model:** `data/loyalty.ts` (`Tier`, `Voucher`, `Experience`, `PointEntry`). **State:** `LoyaltyContext`.

### 7.1 `GET /loyalty/summary` (LoyaltyHome + home rewards card)
```json
{
  "data": {
    "points": 1550,
    "tier": { "key": "savor", "name": "Savor", "perk": "5% OFF" },
    "nextTier": { "key": "feast", "name": "Feast", "min": 3000 },
    "progress": 0.275
  }
}
```
> Tiers: taste(0) → savor(1000) → feast(3000) → gourmet(7000). Frontend `tierForPoints`, `nextTier`,
> `tierProgress` calculate karta hai — ya backend directly de.

### 7.2 `GET /loyalty/vouchers` (MyVouchers)
`Voucher[]` — `{ id, kind, label, title, discount, scope, sub, status, code, guests? }`. Status: `pending | available | claimed | used`.

### 7.3 `POST /loyalty/vouchers/{id}/claim` (WelcomeReveal "Unlock")
`status → claimed`, code reveal.

### 7.4 `POST /loyalty/vouchers/{id}/redeem`
Staff verify ke baad `status → used`.

### 7.5 `POST /loyalty/celebration` (GenerateCelebration)
Party of 10+ celebration code generate. **Request:** `{ "guests": 12 }` → **Response:** `Voucher` (kind `celebration`, unique `code`, `status: claimed`).

### 7.6 `GET /loyalty/experiences` (ExperienceHome)
`Experience[]` — `{ id, brand, title, location, desc, pts, value, tags[], eligible, needMore? }`.

### 7.7 `POST /loyalty/experiences/{id}/book` (ExperienceDetail → Booked)
Points redeem karke experience book. **Errors:** `422 NOT_ENOUGH_POINTS` (needMore pts).

### 7.8 `GET /loyalty/bookings` (LoyaltyBookings)
`LoyaltyBooking[]`.

### 7.9 `GET /loyalty/points-history` (PointHistory)
`PointEntry[]` — `{ id, title, sub, delta (+/-), icon }`. Paginated.

### 7.10 `GET /loyalty/tiers` (MembershipTiers)
Tier overview copy + user ka current tier state.

---

## 8. Catering APIs

**Screens:** `CateringHome → Step1 → Step2 → Success`, aur `MyCateringInquiries`.
**Model:** `data/catering.ts` (`EventType`, `CateringInquiry`). **State:** `CateringContext`.

### 8.1 `GET /catering/content` (CateringHome)
Landing content: features, reviews (`CATERING_FEATURES`, `CATERING_REVIEWS`, rating). Ye mostly static/CMS.

### 8.2 `POST /catering/inquiries` ⭐ (Step2 → Success)
Inquiry submit. (`CateringContext.createInquiry()`)
**Request:**
```json
{
  "eventType": "Corporate",      // Wedding|Corporate|Iftar|Private Event|Birthday|Other
  "date": "2026-04-15",
  "guests": 80,
  "budget": "AED 15000",         // optional, free-form
  "location": "Abu Dhabi",
  "requirements": "Vegetarian options needed",
  "name": "Layla Ahmed",
  "email": "layla.ahmad@gmail.com",
  "phone": "+971 50 123 4567"
}
```
**Response 201:** `CateringInquiry` — `{ id: "#CRV-1043", title: "Corporate Dinner · 80 guests", status: "awaiting" }`.

### 8.3 `GET /catering/inquiries` (MyCateringInquiries)
`CateringInquiry[]`. Status: `awaiting | received` (team replied).

### 8.4 `GET /catering/inquiries/{id}`

---

## 9. Profile / User APIs

**Screen:** `ProfileScreen` (abhi placeholder hai, mostly permission demos).

| Endpoint | Kaam |
|---|---|
| `GET /users/me` | Profile fetch |
| `PUT /users/me` | Profile edit (naam, email, dob, avatar, marketing opt-in) |
| `GET /users/me/addresses` | Saved addresses (delivery) |
| `POST /users/me/addresses` | Naya address |
| `GET /users/me/cards` | Saved payment cards (jo "Save card" se aaye) |
| `DELETE /users/me/cards/{id}` | Card hatao |
| `GET /users/me/notifications` | Notification settings |
| `PATCH /users/me/notifications` | Toggle marketing/order/reservation alerts |

---

## 10. Priority — kya pehle banao

Splash → home → order core flow chalane ke liye **minimum** ye chahiye:

**Phase 1 — Auth + Order (MVP):**
1. `POST /auth/otp/request`
2. `POST /auth/otp/verify`
3. `POST /auth/profile`
4. `GET /brands` + `GET /brands/{key}/menu`
5. `POST /cart/validate`
6. `POST /orders`
7. `GET /orders/{id}` (status)

**Phase 2 — Support:**
8. `POST /auth/sso`, token refresh, logout
9. `GET /home/dashboard`, `GET /promos`, `GET /branches`
10. `POST /promos/apply`
11. Loyalty summary + vouchers

**Phase 3 — Full:**
12. Reservations (poora)
13. Catering (poora)
14. Experiences, point history, saved cards/addresses
15. Real-time order status (WebSocket / push)

---

## 11. Endpoint Summary Table

| # | Method | Endpoint | Screen | Auth |
|---|---|---|---|---|
| 1 | POST | `/auth/otp/request` | SignIn, PhoneVerify | ✗ |
| 2 | POST | `/auth/otp/verify` | OTP | ✗ |
| 3 | POST | `/auth/sso` | Handoff | ✗ |
| 4 | POST | `/auth/profile` | ProfileSetup | ✓ |
| 5 | POST | `/auth/referral/validate` | ProfileSetup | ✓ |
| 6 | POST | `/auth/token/refresh` | — | ✗ |
| 7 | POST | `/auth/logout` | Profile | ✓ |
| 8 | POST | `/users/me/push-token` | Notifications | ✓ |
| 9 | POST | `/users/me/location` | Location | ✓ |
| 10 | GET | `/home/dashboard` | HomeDashboard | ✓ |
| 11 | GET | `/branches` | Home, Cart | ✓ |
| 12 | GET | `/brands` / `/brands/{key}` | BrandPage | ✓ |
| 13 | GET | `/brands/{key}/menu` | BrandPage | ✓ |
| 14 | GET | `/items/{id}` | DishDetail | ✓ |
| 15 | GET | `/search` | Search | ✓ |
| 16 | POST | `/cart/validate` | Cart→Payment | ✓ |
| 17 | POST | `/promos/apply` | Cart, Payment | ✓ |
| 18 | POST | `/orders` | Payment | ✓ |
| 19 | GET | `/orders` / `/orders/{id}` | Orders, OrderStatus | ✓ |
| 20 | GET | `/orders/{id}/invoice` | OrderStatus | ✓ |
| 21 | GET/POST | `/reservation/branches`, `/availability`, `/bookings` | Reservation flow | ✓ |
| 22 | PATCH/POST | `/reservation/bookings/{id}` (modify/cancel) | BookingDetail | ✓ |
| 23 | GET | `/loyalty/summary`, `/vouchers`, `/experiences`, `/points-history` | Loyalty flow | ✓ |
| 24 | POST | `/loyalty/vouchers/{id}/claim`, `/celebration`, `/experiences/{id}/book` | Loyalty flow | ✓ |
| 25 | GET/POST | `/catering/inquiries` | Catering flow | ✓ |
| 26 | GET/PUT | `/users/me` (+ addresses, cards, notifications) | Profile | ✓ |

---

## 12. Recommendations — mere suggestions

1. **REST + JWT** shuruaat ke liye kaafi. GraphQL ki zaroorat abhi nahi.
2. **Backend authoritative rakho** prices, fees, VAT, points — frontend ke hardcoded numbers
   (`SERVICE_FEE`, `VAT_RATE`, `+12 pts`) hata do.
3. **Idempotency key** `POST /orders` pe (double-tap se double order na ho): header `Idempotency-Key`.
4. **Payment gateway** — trust note "Network International" bolta hai. Card app server pe store mat karo,
   sirf gateway token lo.
5. **Images CDN** — local `require()` ki jagah CDN URLs, frontend `FastImage` pe.
6. **Real-time order status** — Phase 1 mein polling chalega, Phase 3 mein WebSocket/push.
7. **`src/services/api.ts`** mein request interceptor add karo jo `Authorization` header + 401 pe
   auto token-refresh handle kare.
8. **OpenAPI/Swagger** spec likho — is doc ko machine-readable banao, frontend types auto-generate ho.
