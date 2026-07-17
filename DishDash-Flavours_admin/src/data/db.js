/* ============================================================
   Mock data — Flavours by DishDash (UAE)
   Shape mirrors the master doc DB tables.
   ============================================================ */

// Real DishDash group brands (extracted from dishdashuae.com)
export const brands = [
  {
    id: 1, name: 'Karaz', tag: 'Levant Kitchen & Café', initials: 'KZ',
    logo: '/dishdash/brands/karaz.webp', cuisine: 'Lebanese · Levantine',
    banner: 'b1', status: 'active', branches: 3, staff: 28, rating: 4.8,
    revenue: 486200, orders: 5840, city: 'Dubai & Abu Dhabi',
  },
  {
    id: 2, name: 'Jade', tag: 'Asian Lounge & Shisha', initials: 'JD',
    logo: '/dishdash/brands/jade.webp', cuisine: 'Arabic Fusion Bites',
    banner: 'b2', status: 'active', branches: 1, staff: 12, rating: 4.6,
    revenue: 198400, orders: 2240, city: 'Khalifa City, AD',
  },
  {
    id: 3, name: 'Bait Um Abdallah', tag: 'Catering & Home Delivery', initials: 'BA',
    logo: '/dishdash/brands/bait.webp', cuisine: 'Home-cooked · Weddings · Events',
    banner: 'b3', status: 'active', branches: 1, staff: 9, rating: 4.9,
    revenue: 142800, orders: 1180, city: 'Etihad Plaza, AD', catering: true,
  },
]

// Real DishDash branches (name, area, city, phone, photo from the live site)
// SRS location fields added: hours (opening hours), gps {lat,lng}, maxConcurrent (max
// concurrent pickup orders the kitchen accepts), active (accepting orders toggle).
export const branches = [
  { id: 1, brandId: 1, name: 'Karaz Yas Mall', area: 'The Fountains, Ground Level, Yas Mall', city: 'Yas Island, Abu Dhabi', phone: '+971 50 928 8546', photo: '/dishdash/branches/karaz-yas.webp', status: 'open', staff: 11, rating: 4.9, revenue: 198400, orders: 2240, banner: 'b1', hours: '10:00 – 00:00', gps: { lat: 24.4886, lng: 54.6070 }, maxConcurrent: 20, active: true },
  { id: 2, brandId: 1, name: 'Karaz Dubai Mall', area: 'The Waterfall, Lower Ground, Unit LG-117', city: 'Downtown Dubai', phone: '+971 54 322 8926', photo: '/dishdash/branches/karaz-dubaimall.webp', status: 'open', staff: 9, rating: 4.7, revenue: 174300, orders: 2010, banner: 'b3', hours: '10:00 – 01:00', gps: { lat: 25.1972, lng: 55.2796 }, maxConcurrent: 25, active: true },
  { id: 3, brandId: 1, name: 'Karaz Dubai Creek', area: 'Al Kheeran First, Dubai Creek Harbour', city: 'Creek Harbour, Dubai', phone: '+971 54 322 9845', photo: '/dishdash/branches/karaz-creek.webp', status: 'busy', staff: 8, rating: 4.8, revenue: 113500, orders: 1590, banner: 'b4', hours: '11:00 – 23:30', gps: { lat: 25.1985, lng: 55.3512 }, maxConcurrent: 15, active: true },
  { id: 4, brandId: 2, name: 'Jade Khalifa City', area: '380 Al Mireef St, Khalifa City, SE45', city: 'Abu Dhabi', phone: '+971 50 933 0587', photo: '/dishdash/branches/jade.webp', status: 'open', staff: 12, rating: 4.6, revenue: 198400, orders: 2240, banner: 'b2', hours: '09:00 – 23:00', gps: { lat: 24.4198, lng: 54.5776 }, maxConcurrent: 18, active: true },
  { id: 5, brandId: 3, name: 'Bait Um Abdallah', area: 'Etihad Plaza, 380 Al Mireef St, Khalifa City', city: 'Abu Dhabi', phone: '+971 50 669 0052', photo: '/dishdash/branches/bait.webp', status: 'open', staff: 9, rating: 4.9, revenue: 142800, orders: 1180, banner: 'b1', hours: '12:00 – 22:00', gps: { lat: 24.4205, lng: 54.5810 }, maxConcurrent: 12, active: false },
]

export const staff = [
  { id: 1, name: 'Aarav Mehta', email: 'aarav@flavours.ae', phone: '+971 50 123 4567', brandId: 1, branchId: 1, role: 'Branch Manager', roleKey: 'branch_admin', status: 'active', joined: '2024-02-11' },
  { id: 2, name: 'Sara Khan', email: 'sara@flavours.ae', phone: '+971 52 998 2210', brandId: 1, branchId: 1, role: 'Cashier', roleKey: 'staff', status: 'active', joined: '2024-05-03' },
  { id: 3, name: 'Mohammed Ali', email: 'm.ali@flavours.ae', phone: '+971 55 441 8890', brandId: 1, branchId: 2, role: 'Kitchen Lead', roleKey: 'staff', status: 'active', joined: '2024-03-19' },
  { id: 4, name: 'Priya Nair', email: 'priya@flavours.ae', phone: '+971 50 776 1123', brandId: 1, branchId: 2, role: 'Branch Manager', roleKey: 'branch_admin', status: 'active', joined: '2023-11-28' },
  { id: 5, name: 'Yusuf Rahman', email: 'yusuf@flavours.ae', phone: '+971 54 220 7781', brandId: 1, branchId: 3, role: 'Delivery Lead', roleKey: 'staff', status: 'on_leave', joined: '2024-06-14' },
  { id: 6, name: 'Aisha Siddiqui', email: 'aisha@dashgrill.ae', phone: '+971 56 332 1190', brandId: 2, branchId: 4, role: 'Branch Manager', roleKey: 'branch_admin', status: 'active', joined: '2024-01-22' },
  { id: 7, name: 'Daniel Cruz', email: 'daniel@dashgrill.ae', phone: '+971 52 884 0091', brandId: 2, branchId: 4, role: 'Waiter', roleKey: 'staff', status: 'active', joined: '2024-07-09' },
  { id: 8, name: 'Fatima Noor', email: 'fatima@baitumabdallah.ae', phone: '+971 50 119 5567', brandId: 3, branchId: 5, role: 'Cashier', roleKey: 'staff', status: 'inactive', joined: '2024-04-02' },
]

// SRS CRM fields added: dob, preferredContact (WhatsApp/SMS/Email), referralCode,
// referredBy, welcomeVoucher status (pending/unlocked/claimed/none).
export const customers = [
  { id: 1, name: 'Hannah Lewis', mobile: '+971 50 884 1102', orders: 42, spent: 6820, status: 'vip', last: '2h ago', city: 'Marina', dob: '1990-03-14', preferredContact: 'WhatsApp', referralCode: 'HANNA-4821', referredBy: null, welcomeVoucher: 'unlocked' },
  { id: 2, name: 'Omar Farooq', mobile: '+971 55 220 7741', orders: 28, spent: 3940, status: 'active', last: '5h ago', city: 'Downtown', dob: '1988-11-02', preferredContact: 'SMS', referralCode: 'OMARF-1190', referredBy: null, welcomeVoucher: 'claimed' },
  { id: 3, name: 'Lena Schmidt', mobile: '+971 52 661 0098', orders: 19, spent: 2510, status: 'active', last: '1d ago', city: 'JBR', dob: '1995-06-27', preferredContact: 'Email', referralCode: 'LENAS-7734', referredBy: null, welcomeVoucher: 'none' },
  { id: 4, name: 'Rahul Verma', mobile: '+971 50 773 2218', orders: 11, spent: 1340, status: 'active', last: '2d ago', city: 'Business Bay', dob: '1992-01-09', preferredContact: 'WhatsApp', referralCode: 'RAHUL-2218', referredBy: null, welcomeVoucher: 'claimed' },
  { id: 5, name: 'Mariam Yusuf', mobile: '+971 56 901 4432', orders: 7, spent: 720, status: 'new', last: '3d ago', city: 'Deira', dob: '1998-09-21', preferredContact: 'WhatsApp', referralCode: 'MARIA-4432', referredBy: 'RAHUL-2218', welcomeVoucher: 'pending' },
  { id: 6, name: 'Jack Wilson', mobile: '+971 54 118 9023', orders: 3, spent: 280, status: 'blocked', last: '9d ago', city: 'Marina', dob: '1985-12-05', preferredContact: 'SMS', referralCode: 'JACKW-9023', referredBy: null, welcomeVoucher: 'expired' },
]

// Real DishDash/Karaz menu categories (from the live menu pages)
export const categories = ['Breakfast & Fatteh', 'Salad', 'Cold Appetizers', 'Hot Appetizers', 'International', 'Grills', 'Levant Main Course', 'Pottery & Trays', 'Kids Menu', 'Dessert', 'Mocktails', 'Coffee & Tea', 'Shisha']

// Structured dishes — real Levantine items + real food photos. Prices are representative
// (the live site publishes prices inside the menu-page images, see `menuPages` below).
export const menu = [
  { id: 1, name: 'Hummus Beiruti', cat: 'Cold Appetizers', price: 24, veg: true, rating: 4.8, status: 'available', emoji: '🫓', tone: 'green', orders: 820, brandId: 1, img: '/dishdash/food/dish-1.webp' },
  { id: 2, name: 'Moutabal', cat: 'Cold Appetizers', price: 24, veg: true, rating: 4.6, status: 'available', emoji: '🍆', tone: 'grape', orders: 540, brandId: 1, img: '/dishdash/food/dish-2.webp' },
  { id: 3, name: 'Fattoush', cat: 'Salad', price: 28, veg: true, rating: 4.7, status: 'available', emoji: '🥗', tone: 'green', orders: 690, brandId: 1, img: '/dishdash/food/salad.webp' },
  { id: 4, name: 'Tabbouleh', cat: 'Salad', price: 26, veg: true, rating: 4.7, status: 'available', emoji: '🌿', tone: 'green', orders: 610, brandId: 1, img: '/dishdash/food/dish-3.webp' },
  { id: 5, name: 'Manakeesh Zaatar', cat: 'Breakfast & Fatteh', price: 18, veg: true, rating: 4.5, status: 'available', emoji: '🫓', tone: 'warn', orders: 480, brandId: 1, img: '/dishdash/food/dish-4.webp' },
  { id: 6, name: 'Cheese Fatteh', cat: 'Breakfast & Fatteh', price: 34, veg: true, rating: 4.8, status: 'available', emoji: '🧀', tone: 'warn', orders: 520, brandId: 1, img: '/dishdash/food/dish-5.webp' },
  { id: 7, name: 'Kibbeh (4 pcs)', cat: 'Hot Appetizers', price: 30, veg: false, rating: 4.6, status: 'available', emoji: '🥟', tone: 'danger', orders: 410, brandId: 1, img: '/dishdash/food/dish-6.webp' },
  { id: 8, name: 'Falafel Platter', cat: 'Hot Appetizers', price: 22, veg: true, rating: 4.7, status: 'available', emoji: '🧆', tone: 'green', orders: 530, brandId: 1, img: '/dishdash/food/dish-7.webp' },
  { id: 9, name: 'Mixed Grill', cat: 'Grills', price: 89, veg: false, rating: 4.9, status: 'available', emoji: '🍢', tone: 'danger', orders: 910, brandId: 1, img: '/dishdash/food/dish-8.webp' },
  { id: 10, name: 'Shish Tawook', cat: 'Grills', price: 58, veg: false, rating: 4.8, status: 'available', emoji: '🍗', tone: 'warn', orders: 740, brandId: 1, img: '/dishdash/food/dish-9.webp' },
  { id: 11, name: 'Lamb Ouzi', cat: 'Levant Main Course', price: 95, veg: false, rating: 4.9, status: 'available', emoji: '🍖', tone: 'danger', orders: 380, brandId: 1, img: '/dishdash/food/dish-10.webp' },
  { id: 12, name: 'Chicken Fatteh', cat: 'Levant Main Course', price: 48, veg: false, rating: 4.7, status: 'available', emoji: '🍛', tone: 'warn', orders: 420, brandId: 1, img: '/dishdash/food/buffet.webp' },
  { id: 13, name: 'Pottery Lamb Tray', cat: 'Pottery & Trays', price: 120, veg: false, rating: 4.8, status: 'available', emoji: '🥘', tone: 'warn', orders: 260, brandId: 1, img: '/dishdash/food/dish-1.webp' },
  { id: 14, name: 'Knafeh Nabulsi', cat: 'Dessert', price: 32, veg: true, rating: 4.9, status: 'available', emoji: '🍮', tone: 'grape', orders: 580, brandId: 1, img: '/dishdash/food/dish-2.webp' },
  { id: 15, name: 'Lemon Mint Mocktail', cat: 'Mocktails', price: 22, veg: true, rating: 4.6, status: 'available', emoji: '🍹', tone: 'info', orders: 470, brandId: 2, img: '/dishdash/food/dish-3.webp' },
  { id: 16, name: 'Arabic Coffee', cat: 'Coffee & Tea', price: 14, veg: true, rating: 4.7, status: 'available', emoji: '☕', tone: 'warn', orders: 360, brandId: 1, img: '/dishdash/food/dish-4.webp' },
  { id: 17, name: 'Grape Shisha', cat: 'Shisha', price: 65, veg: true, rating: 4.8, status: 'available', emoji: '💨', tone: 'grape', orders: 690, brandId: 2, img: '/dishdash/food/dish-5.webp' },
  { id: 18, name: 'Kids Sliders', cat: 'Kids Menu', price: 28, veg: false, rating: 4.5, status: 'soldout', emoji: '🍔', tone: 'danger', orders: 190, brandId: 1, img: '/dishdash/food/dish-6.webp' },
]

// Real Karaz menu — the actual published menu pages (images) from dishdashuae.com
export const menuPages = [
  { n: 1, title: 'Cover', img: '/dishdash/menu/karaz-01.webp' },
  { n: 2, title: 'Our Story', img: '/dishdash/menu/karaz-02.webp' },
  { n: 3, title: 'Signature Breakfast Set', img: '/dishdash/menu/karaz-03.webp' },
  { n: 4, title: 'Breakfast & Fatteh', img: '/dishdash/menu/karaz-04.webp' },
  { n: 5, title: 'Manakeesh & Soup', img: '/dishdash/menu/karaz-05.webp' },
  { n: 6, title: 'Salad', img: '/dishdash/menu/karaz-06.webp' },
  { n: 7, title: 'Cold Appetizers', img: '/dishdash/menu/karaz-07.webp' },
  { n: 8, title: 'Hot Appetizers', img: '/dishdash/menu/karaz-08.webp' },
  { n: 9, title: 'Hot Appetizers (cont.)', img: '/dishdash/menu/karaz-09.webp' },
  { n: 10, title: 'International', img: '/dishdash/menu/karaz-10.webp' },
  { n: 11, title: 'Pottery & Trays', img: '/dishdash/menu/karaz-11.webp' },
  { n: 12, title: 'Grills', img: '/dishdash/menu/karaz-12.webp' },
  { n: 13, title: 'Levant Main Course', img: '/dishdash/menu/karaz-13.webp' },
  { n: 14, title: 'Kids Menu', img: '/dishdash/menu/karaz-14.webp' },
  { n: 15, title: 'Dessert', img: '/dishdash/menu/karaz-15.webp' },
  { n: 16, title: 'Mocktails', img: '/dishdash/menu/karaz-16.webp' },
  { n: 17, title: 'Fresh Juices & Shakes', img: '/dishdash/menu/karaz-17.webp' },
  { n: 18, title: 'Iced Coffee & Soft Drinks', img: '/dishdash/menu/karaz-18.webp' },
  { n: 19, title: 'Coffee & Tea', img: '/dishdash/menu/karaz-19.webp' },
  { n: 20, title: 'Shisha', img: '/dishdash/menu/karaz-20.webp' },
  { n: 21, title: 'Shisha Menu', img: '/dishdash/menu/karaz-21.webp' },
]

// SRS: DishDash is PICKUP ONLY. Order lifecycle:
//   New → Accepted (Preparing) → Ready for Pickup → Collected  (or Cancelled)
const STATUS = ['new', 'accepted', 'ready', 'collected', 'cancelled']
export const orderStatusMeta = {
  new: { label: 'New', badge: 'badge-warning', icon: 'las la-hourglass-half' },
  accepted: { label: 'Accepted', badge: 'badge-info', icon: 'las la-fire' },
  ready: { label: 'Ready for Pickup', badge: 'badge-grape', icon: 'las la-shopping-bag' },
  collected: { label: 'Collected', badge: 'badge-success', icon: 'las la-check-circle' },
  cancelled: { label: 'Cancelled', badge: 'badge-danger', icon: 'las la-times-circle' },
}

// SRS: only Pickup + Dine-in order types (no delivery).
export const ORDER_TYPES = ['Pickup', 'Dine-in']

// SRS: configurable prep-time buckets shown to the customer on acceptance.
export const PREP_TIME_OPTIONS = ['40–45 min', '45–60 min']

// Active (in-progress) statuses — used for live badges / kitchen queue.
export const ACTIVE_ORDER_STATUSES = ['new', 'accepted', 'ready']

// Cancellation policy (SRS): customer may cancel only while New;
// admin/staff may cancel while New, Accepted, or Ready.
export function canCancelOrder(order, byAdmin = true) {
  if (byAdmin) return ['new', 'accepted', 'ready'].includes(order.status)
  return order.status === 'new'
}

export const orders = [
  { id: '#FD-2841', customer: 'Hannah Lewis', brandId: 1, branchId: 1, items: 3, total: 124, status: 'accepted', type: 'Pickup', prep: '40–45 min', time: '2 min ago', pay: 'Card' },
  { id: '#FD-2840', customer: 'Omar Farooq', brandId: 1, branchId: 1, items: 2, total: 78, status: 'new', type: 'Pickup', prep: null, time: '6 min ago', pay: 'Cash' },
  { id: '#FD-2839', customer: 'Lena Schmidt', brandId: 1, branchId: 2, items: 5, total: 210, status: 'ready', type: 'Pickup', prep: '45–60 min', time: '12 min ago', pay: 'Card' },
  { id: '#FD-2838', customer: 'Rahul Verma', brandId: 1, branchId: 3, items: 1, total: 45, status: 'collected', type: 'Dine-in', prep: '40–45 min', time: '20 min ago', pay: 'Card' },
  { id: '#DG-1190', customer: 'Mariam Yusuf', brandId: 2, branchId: 4, items: 4, total: 168, status: 'accepted', type: 'Dine-in', prep: '40–45 min', time: '24 min ago', pay: 'Online' },
  { id: '#DG-1189', customer: 'Jack Wilson', brandId: 3, branchId: 5, items: 2, total: 62, status: 'cancelled', type: 'Pickup', prep: null, time: '31 min ago', pay: 'Cash' },
  { id: '#FD-2837', customer: 'Hannah Lewis', brandId: 1, branchId: 1, items: 6, total: 295, status: 'collected', type: 'Pickup', prep: '45–60 min', time: '40 min ago', pay: 'Card' },
  { id: '#DG-1188', customer: 'Daniel Cruz', brandId: 2, branchId: 4, items: 3, total: 132, status: 'collected', type: 'Pickup', prep: '40–45 min', time: '52 min ago', pay: 'Card' },
]

// 12-month revenue series (per brand for richer charts)
export const revenueSeries = {
  labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  brand1: [28, 32, 30, 38, 42, 48, 44, 52, 58, 55, 62, 68],
  brand2: [18, 21, 19, 24, 26, 30, 28, 33, 36, 34, 40, 44],
}

export const ordersByDay = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [120, 145, 132, 168, 220, 285, 240],
}

export const statusBreakdown = [
  { key: 'collected', label: 'Collected', value: 642, color: '#9ed387' },
  { key: 'accepted', label: 'Accepted', value: 128, color: '#3b82c4' },
  { key: 'ready', label: 'Ready for Pickup', value: 86, color: '#8b6fc7' },
  { key: 'new', label: 'New', value: 54, color: '#e6a020' },
  { key: 'cancelled', label: 'Cancelled', value: 22, color: '#e5484d' },
]

/* ---- scoping helpers (Super Admin sees all; everyone else = one branch) ---- */
export function scopeBranches(user) {
  if (user.role === 'super_admin') return branches
  return branches.filter((b) => b.id === user.branchId)
}
export function scopeOrders(user) {
  if (user.role === 'super_admin') return orders
  return orders.filter((o) => o.branchId === user.branchId)
}
export function scopeStaff(user) {
  if (user.role === 'super_admin') return staff
  return staff.filter((s) => s.branchId === user.branchId)
}
export function brandName(id) { return brands.find((b) => b.id === id)?.name || '—' }
export function branchName(id) { return branches.find((b) => b.id === id)?.name || '—' }
// A branch's parent brand — kept as an internal grouping key to surface the
// brand's logo/cuisine on the (now unified) branch cards.
export function brandForBranch(branch) { return brands.find((b) => b.id === branch?.brandId) || null }

/* ============================================================
   RESERVATIONS (table booking)
   ============================================================ */
export const reservationStatusMeta = {
  confirmed: { label: 'Confirmed', badge: 'badge-success' },
  pending: { label: 'Pending', badge: 'badge-warning' },
  seated: { label: 'Seated', badge: 'badge-info' },
  completed: { label: 'Completed', badge: 'badge-neutral' },
  cancelled: { label: 'Cancelled', badge: 'badge-danger' },
}
export const reservations = [
  { id: 'R-3012', name: 'Hannah Lewis', guests: 4, date: '2026-06-29', time: '13:00', table: 'T-08', brandId: 1, branchId: 1, status: 'confirmed', phone: '+971 50 884 1102' },
  { id: 'R-3013', name: 'Omar Farooq', guests: 2, date: '2026-06-29', time: '14:30', table: 'T-02', brandId: 1, branchId: 1, status: 'seated', phone: '+971 55 220 7741' },
  { id: 'R-3014', name: 'Lena Schmidt', guests: 6, date: '2026-06-29', time: '19:00', table: 'T-12', brandId: 1, branchId: 2, status: 'pending', phone: '+971 52 661 0098' },
  { id: 'R-3015', name: 'Rahul Verma', guests: 3, date: '2026-06-29', time: '20:15', table: 'T-05', brandId: 1, branchId: 3, status: 'confirmed', phone: '+971 50 773 2218' },
  { id: 'R-3016', name: 'Mariam Yusuf', guests: 5, date: '2026-06-30', time: '13:30', table: 'T-09', brandId: 2, branchId: 4, status: 'confirmed', phone: '+971 56 901 4432' },
  { id: 'R-3017', name: 'Jack Wilson', guests: 2, date: '2026-06-30', time: '21:00', table: 'T-03', brandId: 3, branchId: 5, status: 'cancelled', phone: '+971 54 118 9023' },
  { id: 'R-3018', name: 'Sofia Marin', guests: 8, date: '2026-07-01', time: '19:30', table: 'T-15', brandId: 1, branchId: 1, status: 'pending', phone: '+971 50 442 8810' },
  { id: 'R-3019', name: 'Karan Patel', guests: 4, date: '2026-07-01', time: '12:45', table: 'T-07', brandId: 1, branchId: 2, status: 'completed', phone: '+971 55 661 0033' },
]

/* ============================================================
   CATERING INQUIRIES (lead pipeline)
   ============================================================ */
export const cateringStages = [
  { key: 'new', label: 'Awaiting', badge: 'badge-info', icon: 'las la-inbox' },
  { key: 'contacted', label: 'Contacted', badge: 'badge-grape', icon: 'las la-phone' },
  { key: 'quoted', label: 'Quoted', badge: 'badge-warning', icon: 'las la-file-invoice-dollar' },
  { key: 'confirmed', label: 'Confirmed', badge: 'badge-pistachio', icon: 'las la-handshake' },
  { key: 'completed', label: 'Completed', badge: 'badge-success', icon: 'las la-check-circle' },
  { key: 'cancelled', label: 'Cancelled', badge: 'badge-danger', icon: 'las la-times-circle' },
]
// SRS catering-inquiry constraints
export const CATERING_EVENT_TYPES = ['Wedding', 'Corporate', 'Birthday', 'Other']
export const CATERING_GUEST_MIN = 20
export const CATERING_GUEST_MAX = 500
export const CATERING_LEAD_HOURS = 48 // event date must be ≥ 48h out
export const CATERING_MESSAGE_MIN = 50
export const CATERING_MESSAGE_MAX = 1000

// All catering leads belong to Bait Um Abdallah (brandId 3) — the group's catering brand.
// SRS fields: email, eventType, date, guests, budget, message + assignedTo + internal notes.
export const cateringInquiries = [
  { id: 'C-901', name: 'Etihad HR Team', email: 'events@etihad.ae', event: 'Corporate Lunch', eventType: 'Corporate', guests: 60, date: '2026-07-05', budget: 4500, value: 4200, status: 'new', brandId: 3, phone: '+971 50 111 2233', assignedTo: null, message: 'Quarterly team lunch for the HR department — mix of vegetarian and grilled mains, plus Arabic desserts.', notes: '' },
  { id: 'C-902', name: 'Al Noor Wedding', email: 'alnoor.family@gmail.com', event: 'Wedding Buffet', eventType: 'Wedding', guests: 220, date: '2026-07-12', budget: 20000, value: 18600, status: 'contacted', brandId: 3, phone: '+971 55 442 1180', assignedTo: 'Fatima Noor', message: 'Full wedding buffet with live grill station and a dedicated dessert table. Need setup by 5pm.', notes: 'Called 26 Jun — sending quote with two package tiers.' },
  { id: 'C-903', name: 'TechWave Summit', email: 'ops@techwave.io', event: 'Conference Catering', eventType: 'Corporate', guests: 150, date: '2026-07-20', budget: 13000, value: 12400, status: 'quoted', brandId: 3, phone: '+971 52 990 7741', assignedTo: 'Fatima Noor', message: 'Two coffee breaks and a working lunch across a full-day tech conference. Boxed options preferred.', notes: 'Quote v2 sent. Awaiting PO from finance.' },
  { id: 'C-904', name: 'Khalid Birthday', email: 'khalid.m@outlook.com', event: 'Private Party', eventType: 'Birthday', guests: 35, date: '2026-07-02', budget: 3000, value: 2800, status: 'confirmed', brandId: 3, phone: '+971 50 663 9921', assignedTo: 'Fatima Noor', message: '40th birthday dinner — mixed grill platters and a custom knafeh cake for the celebration.', notes: 'Deposit received. Cake ordered.' },
  { id: 'C-905', name: 'GEMS School', email: 'admin@gemsschool.ae', event: 'Sports Day Snacks', eventType: 'Other', guests: 400, date: '2026-06-28', budget: 10000, value: 9600, status: 'completed', brandId: 3, phone: '+971 56 220 4471', assignedTo: 'Fatima Noor', message: 'Individually packed snack boxes and juice for the annual school sports day. Nut-free required.', notes: 'Delivered on time. Client very happy — potential repeat annual booking.' },
  { id: 'C-906', name: 'Marina Yacht Club', email: 'concierge@marinayacht.ae', event: 'Sunset Canapés', eventType: 'Other', guests: 80, date: '2026-07-08', budget: 8000, value: 7200, status: 'contacted', brandId: 3, phone: '+971 54 771 2090', assignedTo: null, message: 'Passed canapés and mocktails for a sunset networking event on the marina deck.', notes: '' },
  { id: 'C-907', name: 'Rashid Group', email: 'pa@rashidgroup.ae', event: 'Iftar Gathering', eventType: 'Other', guests: 120, date: '2026-06-25', budget: 9000, value: 0, status: 'cancelled', brandId: 3, phone: '+971 50 882 1100', assignedTo: 'Fatima Noor', message: 'Corporate Iftar buffet for staff and partners with traditional Ramadan menu.', notes: 'Cancelled — event postponed to next year.' },
]

/* ============================================================
   LOYALTY
   ============================================================ */
// SRS: exactly three tiers, Silver is the default/entry tier. Bronze removed.
// Threshold = lifetime points required to reach the tier (Silver is the floor).
export const loyaltyTiers = {
  Platinum: 'badge-grape', Gold: 'badge-warning', Silver: 'badge-neutral',
}
export const loyaltyTierConfig = [
  { name: 'Platinum', threshold: 5000, badge: 'badge-grape' },
  { name: 'Gold', threshold: 2500, badge: 'badge-warning' },
  { name: 'Silver', threshold: 1000, badge: 'badge-neutral' }, // default/entry
]
export const DEFAULT_TIER = 'Silver'
// SRS earning rule: 1 point per AED 5 spent → FLOOR(amount / 5).
export const POINTS_PER_AED = 5
export function pointsForSpend(amount) { return Math.floor(amount / POINTS_PER_AED) }
// Natural (unoverridden) tier for a given lifetime points balance.
export function tierForPoints(points) {
  if (points >= 5000) return 'Platinum'
  if (points >= 2500) return 'Gold'
  return DEFAULT_TIER
}
// Effective tier respects a manual admin override when present.
export function effectiveTier(member) { return member.override || tierForPoints(member.points) }

// SRS points-ledger transaction types.
export const loyaltyLedgerTypeMeta = {
  EARNED_APP: { label: 'Earned · App', sign: 1, cls: 'badge-success', icon: 'las la-mobile' },
  EARNED_DINE_IN: { label: 'Earned · Dine-in', sign: 1, cls: 'badge-success', icon: 'las la-utensils' },
  EARNED_REFERRAL: { label: 'Earned · Referral', sign: 1, cls: 'badge-success', icon: 'las la-user-plus' },
  EARNED_REFERRED: { label: 'Earned · Referred', sign: 1, cls: 'badge-success', icon: 'las la-user-friends' },
  REDEEMED_OFFER: { label: 'Redeemed · Offer', sign: -1, cls: 'badge-grape', icon: 'las la-star' },
  ANNIVERSARY_RESET: { label: 'Anniversary Reset', sign: -1, cls: 'badge-neutral', icon: 'las la-history' },
  ADJUSTMENT: { label: 'Adjustment', sign: 0, cls: 'badge-info', icon: 'las la-sliders-h' },
}

export const loyaltyMembers = [
  { id: 'M-101', name: 'Hannah Lewis', points: 8420, spent: 6820, orders: 42, joined: '2023-08-14', override: null },
  { id: 'M-102', name: 'Omar Farooq', points: 4150, spent: 3940, orders: 28, joined: '2023-11-02', override: null },
  { id: 'M-103', name: 'Lena Schmidt', points: 3120, spent: 2510, orders: 19, joined: '2024-01-19', override: null },
  { id: 'M-104', name: 'Rahul Verma', points: 1380, spent: 1340, orders: 11, joined: '2024-03-22', override: null },
  { id: 'M-105', name: 'Mariam Yusuf', points: 720, spent: 720, orders: 7, joined: '2024-06-11', override: 'Gold' }, // manual override demo
]

// Typed points ledger (SRS). delta already carries sign.
export const pointsLedger = [
  { id: 'PL-8801', member: 'Hannah Lewis', type: 'EARNED_DINE_IN', delta: 64, note: 'Dine-in AED 320', time: '2026-06-29 20:14' },
  { id: 'PL-8802', member: 'Lena Schmidt', type: 'REDEEMED_OFFER', delta: -1500, note: 'Shisha Terrace Lounge Night', time: '2026-06-29 21:02' },
  { id: 'PL-8803', member: 'Omar Farooq', type: 'EARNED_APP', delta: 22, note: 'Pickup order #FD-2840', time: '2026-06-29 12:40' },
  { id: 'PL-8804', member: 'Rahul Verma', type: 'EARNED_REFERRAL', delta: 100, note: 'Referred Mariam Yusuf', time: '2026-06-28 18:30' },
  { id: 'PL-8805', member: 'Mariam Yusuf', type: 'EARNED_REFERRED', delta: 100, note: 'Joined via referral', time: '2026-06-28 18:30' },
  { id: 'PL-8806', member: 'Hannah Lewis', type: 'ANNIVERSARY_RESET', delta: -420, note: 'Yearly anniversary reset', time: '2026-06-27 00:00' },
  { id: 'PL-8807', member: 'Omar Farooq', type: 'ADJUSTMENT', delta: -200, note: 'Refunded order', time: '2026-06-27 09:11' },
]
export const unmatchedPos = [
  { id: 'U-5501', txn: 'POS-88213', amount: 142, time: '2h ago', branch: 'Karaz Yas Mall', reason: 'No member match' },
  { id: 'U-5502', txn: 'POS-88198', amount: 86, time: '4h ago', branch: 'Karaz Dubai Mall', reason: 'Phone mismatch' },
  { id: 'U-5503', txn: 'POS-88154', amount: 210, time: '6h ago', branch: 'Karaz Dubai Creek', reason: 'No member match' },
  { id: 'U-5504', txn: 'POS-88090', amount: 54, time: '1d ago', branch: 'Jade Khalifa City', reason: 'Invalid card' },
]
export const pointAdjustments = [
  { id: 'PA-21', member: 'Hannah Lewis', delta: 500, reason: 'Service recovery', by: 'Aarav Mehta', time: '1h ago' },
  { id: 'PA-22', member: 'Omar Farooq', delta: -200, reason: 'Refunded order', by: 'Aarav Mehta', time: '3h ago' },
  { id: 'PA-23', member: 'Rahul Verma', delta: 150, reason: 'Birthday bonus', by: 'System', time: '1d ago' },
]

/* ============================================================
   VOUCHERS
   ============================================================ */
// SRS Module: two voucher programs only, both percentage-discount (not AED credit).
//  • Welcome     — 10% off the FIRST dine-in, one-time, code WELCOME-XXXXXX.
//                  Lifecycle: PENDING (issued on signup) → UNLOCKED (eligible) → CLAIMED.
//  • Celebration — 20% off, requires a party of at least 10, code CELEB-XXXXXX.
//                  Lifecycle: UNLOCKED → CLAIMED (no pending state).
// A claim records the location (branchId) + bill amount, and derives the discount value.
export const voucherTypeMeta = {
  welcome: { label: 'Welcome', discount: 10, prefix: 'WELCOME', firstDineInOnly: true, minParty: null, icon: 'las la-gift', tone: 'pistachio' },
  celebration: { label: 'Celebration', discount: 20, prefix: 'CELEB', firstDineInOnly: false, minParty: 10, icon: 'las la-glass-cheers', tone: 'grape' },
}
export const voucherStatusMeta = {
  pending: { label: 'Pending', cls: 'badge-warning' },
  unlocked: { label: 'Unlocked', cls: 'badge-info' },
  claimed: { label: 'Claimed', cls: 'badge-success' },
  expired: { label: 'Expired', cls: 'badge-neutral' },
}

export const vouchers = [
  { code: 'WELCOME-782143', type: 'welcome', owner: 'Mariam Yusuf', status: 'pending', issued: '2026-06-24', expiry: '2026-07-24', claimedBy: null, claim: null },
  { code: 'WELCOME-559021', type: 'welcome', owner: 'Hannah Lewis', status: 'unlocked', issued: '2026-06-10', expiry: '2026-07-10', claimedBy: null, claim: null },
  { code: 'WELCOME-330188', type: 'welcome', owner: 'Omar Farooq', status: 'claimed', issued: '2026-05-22', expiry: '2026-06-22', claimedBy: 'Omar Farooq', claim: { branchId: 1, bill: 320, discount: 32, date: '2026-06-02' } },
  { code: 'CELEB-901337', type: 'celebration', owner: 'Lena Schmidt', status: 'unlocked', issued: '2026-06-18', expiry: '2026-07-18', claimedBy: null, claim: null, party: 12 },
  { code: 'CELEB-774520', type: 'celebration', owner: 'Rahul Verma', status: 'claimed', issued: '2026-05-30', expiry: '2026-06-30', claimedBy: 'Rahul Verma', claim: { branchId: 2, bill: 1180, discount: 236, date: '2026-06-14' }, party: 14 },
  { code: 'WELCOME-220110', type: 'welcome', owner: 'Jack Wilson', status: 'expired', issued: '2026-04-10', expiry: '2026-05-10', claimedBy: null, claim: null },
]

/* ============================================================
   EXPERIENCE OFFERS (SRS Module 8)
   Curated experiences a guest books by spending LOYALTY POINTS.
   A confirmed booking auto-creates a reservation for that slot.
   ============================================================ */
export const POINTS_MIN = 50
export const POINTS_MAX = 10000

export const experienceBookingStatusMeta = {
  upcoming: { label: 'Upcoming', cls: 'badge-info' },
  completed: { label: 'Completed', cls: 'badge-success' },
  no_show: { label: 'No-show', cls: 'badge-danger' },
  cancelled: { label: 'Cancelled', cls: 'badge-neutral' },
}

// availability: 'recurring' → repeats on `days`; 'specific_dates' → runs on `dates`.
export const experienceOffers = [
  {
    id: 'EXP-01', name: 'Chef’s Table Levant Tasting', brandId: 1,
    desc: 'A 7-course guided tasting at the pass with the head chef.',
    points: 4000, photo: '/dishdash/food/buffet.webp',
    partyMin: 2, partyMax: 6, availability: 'recurring',
    days: ['Thu', 'Fri', 'Sat'], slots: ['19:00', '20:30'], maxPerSlot: 2,
    start: '2026-06-01', end: '2026-09-30', active: true,
  },
  {
    id: 'EXP-02', name: 'Shisha Terrace Lounge Night', brandId: 2,
    desc: 'Reserved terrace lounge with premium shisha & mocktail flight.',
    points: 1500, photo: '/dishdash/food/dish-5.webp',
    partyMin: 2, partyMax: 8, availability: 'recurring',
    days: ['Fri', 'Sat'], slots: ['21:00', '22:30'], maxPerSlot: 3,
    start: '2026-06-01', end: '2026-12-31', active: true,
  },
  {
    id: 'EXP-03', name: 'Knafeh Masterclass', brandId: 1,
    desc: 'Hands-on dessert workshop — make & plate your own knafeh.',
    points: 800, photo: '/dishdash/food/dish-2.webp',
    partyMin: 1, partyMax: 10, availability: 'specific_dates',
    dates: ['2026-07-12', '2026-07-26'], slots: ['16:00'], maxPerSlot: 8,
    start: '2026-07-12', end: '2026-07-26', active: true,
  },
  {
    id: 'EXP-04', name: 'Family Ouzi Feast Experience', brandId: 3,
    desc: 'Private room whole-lamb Ouzi ceremony for the family.',
    points: 6500, photo: '/dishdash/food/dish-10.webp',
    partyMin: 6, partyMax: 20, availability: 'recurring',
    days: ['Sat', 'Sun'], slots: ['13:00', '19:00'], maxPerSlot: 1,
    start: '2026-06-01', end: '2026-10-31', active: false,
  },
]

export const experienceBookings = [
  { id: 'BK-5001', offerId: 'EXP-01', guest: 'Hannah Lewis', party: 4, date: '2026-07-01', slot: '19:00', points: 4000, status: 'upcoming', branchId: 1 },
  { id: 'BK-5002', offerId: 'EXP-02', guest: 'Lena Schmidt', party: 6, date: '2026-07-01', slot: '21:00', points: 1500, status: 'upcoming', branchId: 4 },
  { id: 'BK-5003', offerId: 'EXP-01', guest: 'Omar Farooq', party: 2, date: '2026-07-01', slot: '20:30', points: 4000, status: 'upcoming', branchId: 1 },
  { id: 'BK-5004', offerId: 'EXP-03', guest: 'Mariam Yusuf', party: 3, date: '2026-06-28', slot: '16:00', points: 800, status: 'completed', branchId: 1 },
  { id: 'BK-5005', offerId: 'EXP-02', guest: 'Jack Wilson', party: 4, date: '2026-06-27', slot: '22:30', points: 1500, status: 'no_show', branchId: 4 },
  { id: 'BK-5006', offerId: 'EXP-04', guest: 'Rahul Verma', party: 8, date: '2026-06-21', slot: '19:00', points: 6500, status: 'completed', branchId: 5 },
]

export function scopeExperienceOffers(user) {
  if (user.role === 'super_admin') return experienceOffers
  const b = branches.find((x) => x.id === user.branchId)
  return b ? experienceOffers.filter((o) => o.brandId === b.brandId) : []
}
export function experienceOfferById(id) { return experienceOffers.find((o) => o.id === id) }

/* ============================================================
   AUDIT LOGS
   ============================================================ */
export const auditLogs = [
  { id: 'L-9001', user: 'Yash Dhakad', role: 'Super Admin', action: 'UPDATE', module: 'Menu', entity: 'Mixed Grill', oldValue: 'AED 86', newValue: 'AED 89', time: '2026-06-29 12:41', ip: '94.200.11.4' },
  { id: 'L-9002', user: 'Aisha Siddiqui', role: 'Branch Manager', action: 'CREATE', module: 'Staff', entity: 'Daniel Cruz', oldValue: '—', newValue: 'Waiter @ Jade Khalifa City', time: '2026-06-29 11:58', ip: '94.200.11.9' },
  { id: 'L-9003', user: 'Aarav Mehta', role: 'Branch Manager', action: 'STATUS', module: 'Orders', entity: '#FD-2839', oldValue: 'Accepted', newValue: 'Ready for Pickup', time: '2026-06-29 11:30', ip: '188.241.5.22' },
  { id: 'L-9004', user: 'System', role: 'System', action: 'DELETE', module: 'Vouchers', entity: 'EXPIRED-2201', oldValue: 'Active', newValue: 'Expired', time: '2026-06-29 09:15', ip: '—' },
  { id: 'L-9005', user: 'Aarav Mehta', role: 'Branch Manager', action: 'UPDATE', module: 'Settings', entity: 'Prep Time', oldValue: '20 min', newValue: '18 min', time: '2026-06-28 18:02', ip: '94.200.11.9' },
  { id: 'L-9006', user: 'Yash Dhakad', role: 'Super Admin', action: 'CREATE', module: 'Brands', entity: 'Bait Um Abdallah', oldValue: '—', newValue: 'Active', time: '2026-06-28 15:44', ip: '94.200.11.4' },
  { id: 'L-9007', user: 'Aarav Mehta', role: 'Branch Manager', action: 'ADJUST', module: 'Loyalty', entity: 'Omar Farooq', oldValue: '4350 pts', newValue: '4150 pts', time: '2026-06-28 14:20', ip: '188.241.5.22' },
]
export const auditActionBadge = {
  CREATE: 'badge-success', UPDATE: 'badge-info', DELETE: 'badge-danger',
  STATUS: 'badge-grape', ADJUST: 'badge-warning',
}

/* ============================================================
   AGGREGATORS (delivery platform links)
   ============================================================ */
// `clicks` = SRS aggregator-click tracking (times guests tapped through to each platform).
export const aggregators = [
  { name: 'Talabat', url: 'https://talabat.com/uae/flavours-dishdash', status: 'connected', color: '#ff5a00', clicks: 1840 },
  { name: 'Noon Food', url: 'https://food.noon.com/flavours', status: 'connected', color: '#feee00', clicks: 1210 },
  { name: 'Deliveroo', url: 'https://deliveroo.ae/flavours', status: 'connected', color: '#00ccbc', clicks: 960 },
  { name: 'Careem', url: 'https://careem.com/food/flavours', status: 'pending', color: '#4bb543', clicks: 320 },
  { name: 'Keeta', url: '', status: 'disconnected', color: '#ffd100', clicks: 0 },
]

// SRS referral records — who referred whom, reward status.
export const referralRecords = [
  { id: 'REF-201', referrer: 'Rahul Verma', code: 'RAHUL-2218', referred: 'Mariam Yusuf', date: '2026-06-28', status: 'rewarded', points: 100 },
  { id: 'REF-202', referrer: 'Hannah Lewis', code: 'HANNA-4821', referred: 'Sofia Marin', date: '2026-06-24', status: 'pending', points: 0 },
  { id: 'REF-203', referrer: 'Omar Farooq', code: 'OMARF-1190', referred: 'Karan Patel', date: '2026-06-20', status: 'rewarded', points: 100 },
  { id: 'REF-204', referrer: 'Lena Schmidt', code: 'LENAS-7734', referred: 'Jack Wilson', date: '2026-06-12', status: 'expired', points: 0 },
]

/* ---- scoping for new modules ---- */
export function scopeReservations(user) {
  if (user.role === 'super_admin') return reservations
  return reservations.filter((r) => r.branchId === user.branchId)
}
export function scopeCatering(user) {
  // Only Super Admin & the catering account can open catering — both see all leads.
  return cateringInquiries
}
