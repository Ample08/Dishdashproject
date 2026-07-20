/* ============================================================
   RBAC — driven by the API, not by hardcoded roles.

   The server is the source of truth: /api/admin/login and
   /api/admin/profile return `effectivePermissions`, a flat list
   like ['orders.view', 'menu.manage', ...]. Everything here
   filters against that list.

   Module keys below mirror the groups from GET /api/admin/permissions.
   ============================================================ */

export const ROLES = {
  super_admin: {
    key: 'super_admin',
    name: 'Super Admin',
    short: 'Platform Owner',
    scope: 'System Level',
    icon: 'las la-crown',
    color: 'grape',
    desc: 'Full access across every brand and branch.',
  },
  brand_manager: {
    key: 'brand_manager',
    name: 'Brand Manager',
    short: 'Brand Manager',
    scope: 'Brand Level',
    icon: 'las la-store',
    color: 'info',
    desc: 'Runs one assigned brand.',
  },
  location_staff: {
    key: 'location_staff',
    name: 'Location Staff',
    short: 'Staff',
    scope: 'Branch Level',
    icon: 'las la-user-tag',
    color: 'warning',
    desc: 'Day-to-day floor access for a single branch.',
  },
}

export const ROLE_ORDER = ['super_admin', 'brand_manager', 'location_staff']

// Unknown role from the API shouldn't crash the header/sidebar.
export function roleMetaFor(role) {
  return (
    ROLES[role] || {
      key: role,
      name: role ? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Staff',
      short: 'Staff',
      scope: 'Assigned Scope',
      icon: 'las la-user',
      color: 'info',
      desc: '',
    }
  )
}

/* Permission modules — mirrors the `groups` from GET /api/admin/permissions.
   Each has a .view and a .manage variant server-side (reports/audit are view-only). */
export const PERMISSIONS = [
  { key: 'orders', label: 'Orders', icon: 'las la-receipt' },
  { key: 'menu', label: 'Menu & Brands', icon: 'las la-utensils' },
  { key: 'reservations', label: 'Reservations', icon: 'las la-calendar-check' },
  { key: 'catering', label: 'Catering', icon: 'las la-concierge-bell' },
  { key: 'loyalty', label: 'Loyalty', icon: 'las la-medal' },
  { key: 'vouchers', label: 'Vouchers', icon: 'las la-ticket-alt' },
  { key: 'offers', label: 'Experience Offers', icon: 'las la-star' },
  { key: 'users', label: 'User CRM', icon: 'las la-user-friends' },
  { key: 'staff', label: 'Staff & Access', icon: 'las la-user-shield' },
  { key: 'settings', label: 'Settings', icon: 'las la-cog' },
  { key: 'reports', label: 'Reporting', icon: 'las la-chart-pie' },
  { key: 'audit', label: 'Audit Log', icon: 'las la-clipboard-list' },
]

// Loyalty tier → badge class (tiers come from the API: Member/Bronze/Silver/Gold/Platinum).
const TIER_BADGE = {
  Member: 'badge-neutral', Bronze: 'badge-warning', Silver: 'badge-info',
  Gold: 'badge-warning', Platinum: 'badge-grape',
}
export function tierBadge(tier) {
  return TIER_BADGE[tier] || 'badge-neutral'
}

// These modules have only a .view permission server-side (no .manage variant).
export const VIEW_ONLY_MODULES = ['reports', 'audit']

// The permission strings a module actually supports, e.g. 'orders' -> ['orders.view','orders.manage'].
export function variantsFor(moduleKey) {
  return VIEW_ONLY_MODULES.includes(moduleKey)
    ? [`${moduleKey}.view`]
    : [`${moduleKey}.view`, `${moduleKey}.manage`]
}

/* Server-side defaults per role (from GET /api/admin/permissions -> roleDefaults).
   Reference only — a signed-in user is gated by their own effectivePermissions,
   which an admin can override per staff member. */
export const ROLE_DEFAULTS = {
  super_admin: PERMISSIONS.flatMap((p) =>
    p.key === 'reports' || p.key === 'audit' ? [`${p.key}.view`] : [`${p.key}.view`, `${p.key}.manage`],
  ),
  brand_manager: [
    'orders.view', 'menu.view', 'menu.manage', 'offers.view', 'offers.manage',
    'reservations.view', 'reservations.manage', 'catering.view', 'catering.manage',
    'loyalty.view', 'vouchers.view', 'reports.view',
  ],
  location_staff: [
    'orders.view', 'orders.manage', 'reservations.view', 'reservations.manage',
    'offers.view', 'vouchers.view',
  ],
}

// Module-level view of the defaults — used by the Staff roles matrix.
export const ROLE_PERMISSIONS = Object.fromEntries(
  Object.entries(ROLE_DEFAULTS).map(([role, perms]) => [
    role,
    [...new Set(perms.map((p) => p.split('.')[0]))],
  ]),
)

/* ---- The two checks every page should use ---- */

// Can the user see this module at all? (`orders.view` OR `orders.manage`)
export function can(user, moduleKey) {
  if (!user) return false
  if (!moduleKey) return true
  return (user.permissions || []).some((p) => p.split('.')[0] === moduleKey)
}

// Can the user change things here, or is it read-only?
export function canManage(user, moduleKey) {
  if (!user || !moduleKey) return false
  return (user.permissions || []).includes(`${moduleKey}.manage`)
}

/* ---- Permission-aware sidebar navigation ----
   `perm`   -> needs view access to that module
   `manage` -> needs manage access
   `roles`  -> restricted to specific roles (used where the API has no permission yet) */
const NAV = [
  { section: 'Overview' },
  { label: 'Dashboard', path: '/dashboard', icon: 'las la-th-large' },

  { section: 'Operations' },
  {
    label: 'Orders',
    icon: 'las la-receipt',
    perm: 'orders',
    badge: 'live',
    children: [
      { label: 'All Orders', path: '/orders' },
      { label: 'New', path: '/orders?status=new' },
      { label: 'Accepted', path: '/orders?status=accepted' },
      { label: 'Ready for Pickup', path: '/orders?status=ready' },
      { label: 'Collected', path: '/orders?status=collected' },
    ],
  },
  {
    label: 'Reservations',
    icon: 'las la-calendar-check',
    perm: 'reservations',
    children: [
      { label: 'Calendar View', path: '/reservations' },
      { label: 'List View', path: '/reservations?view=list' },
    ],
  },
  { label: 'Bait Um Abdallah', path: '/catering', icon: 'las la-concierge-bell', perm: 'catering' },
  {
    label: 'Menu',
    icon: 'las la-utensils',
    perm: 'menu',
    children: [
      { label: 'Food Items', path: '/menu' },
      { label: 'Menu Pages', path: '/menu?tab=pages' },
      { label: 'Categories', path: '/menu?tab=categories' },
      { label: 'Add-ons & Flavours', path: '/menu?tab=addons' },
    ],
  },
  { label: 'Customers / CRM', path: '/customers', icon: 'las la-user-friends', perm: 'users' },

  { section: 'Organization' },
  // The API groups brands under the menu permission ("Menu & Brands").
  { label: 'Brands', path: '/brands', icon: 'las la-store', perm: 'menu' },
  // No admin branches API exists yet — super admin only, still on mock data.
  { label: 'Branches', path: '/branches', icon: 'las la-map-marked-alt', roles: ['super_admin'] },
  {
    label: 'Staff & Roles',
    labelFor: { brand_manager: 'Staff', location_staff: 'Staff' },
    icon: 'las la-user-shield',
    perm: 'staff',
    children: [
      { label: 'All Staff', path: '/staff' },
      { label: 'Add Staff', path: '/staff?action=add', manage: 'staff' },
      { label: 'Roles & Permissions', path: '/staff?tab=roles', roles: ['super_admin'] },
    ],
  },

  { section: 'Growth' },
  { label: 'Experience Offers', path: '/offers', icon: 'las la-star', perm: 'offers' },
  {
    label: 'Vouchers',
    icon: 'las la-ticket-alt',
    perm: 'vouchers',
    children: [
      { label: 'All Vouchers', path: '/vouchers' },
      { label: 'Claimed Vouchers', path: '/vouchers?tab=claimed' },
    ],
  },
  {
    label: 'Loyalty',
    icon: 'las la-medal',
    perm: 'loyalty',
    children: [
      { label: 'Members', path: '/loyalty' },
      { label: 'Unmatched POS', path: '/loyalty?tab=unmatched' },
      { label: 'Point Adjustments', path: '/loyalty?tab=points' },
    ],
  },
  { label: 'Reports', path: '/reports', icon: 'las la-chart-pie', perm: 'reports' },

  { section: 'System' },
  {
    label: 'Audit Logs',
    icon: 'las la-clipboard-list',
    perm: 'audit',
    children: [
      { label: 'All Logs', path: '/audit' },
      { label: 'By User', path: '/audit?group=user' },
      { label: 'By Module', path: '/audit?group=module' },
    ],
  },
  { label: 'Settings', path: '/settings', icon: 'las la-cog', perm: 'settings' },
]

function allows(user, item) {
  if (item.roles && !item.roles.includes(user.role)) return false
  if (item.manage && !canManage(user, item.manage)) return false
  if (item.perm && !can(user, item.perm)) return false
  return true
}

export function navFor(user) {
  const out = []
  for (const item of NAV) {
    if (item.section) {
      out.push(item) // empty sections are dropped below
      continue
    }
    if (!allows(user, item)) continue

    const label = item.labelFor?.[user.role] || item.label
    if (item.children) {
      const children = item.children.filter((c) => allows(user, c))
      if (!children.length) continue
      out.push({ ...item, label, children })
    } else {
      out.push({ ...item, label })
    }
  }
  return out.filter((item, i) => {
    if (!item.section) return true
    const next = out[i + 1]
    return next && !next.section
  })
}

/* Where to land after login — dashboard is open to every signed-in admin,
   so this only matters if that ever changes. */
export function homePathFor(user) {
  const nav = navFor(user)
  const first = nav.find((item) => !item.section && (item.path || item.children))
  return first?.path || first?.children?.[0]?.path || '/dashboard'
}
