/* ============================================================
   RBAC — roles, permissions & role-aware navigation
   Hierarchy: Super Admin -> Branch -> Staff
   (Brand layer removed — branches are the single location entity.)
   ============================================================ */

export const ROLES = {
  super_admin: {
    key: 'super_admin',
    name: 'Super Admin',
    short: 'Platform Owner',
    scope: 'System Level',
    icon: 'las la-crown',
    color: 'grape',
    desc: 'Sees & controls everything across all branches.',
  },
  branch_admin: {
    key: 'branch_admin',
    name: 'Branch Manager',
    short: 'Branch Manager',
    scope: 'Branch Level',
    icon: 'las la-map-marker',
    color: 'info',
    desc: 'Runs a single assigned branch.',
  },
  staff: {
    key: 'staff',
    name: 'Staff',
    short: 'Staff',
    scope: 'Branch Level',
    icon: 'las la-user-tag',
    color: 'warning',
    desc: 'Limited, permission-based access to one branch.',
  },
  catering_admin: {
    key: 'catering_admin',
    name: 'Bait Um Abdallah',
    short: 'Catering Brand',
    scope: 'Catering Only',
    icon: 'las la-concierge-bell',
    color: 'grape',
    desc: 'Sees only the Bait Um Abdallah catering inquiries.',
  },
}

export const ROLE_ORDER = ['super_admin', 'branch_admin', 'staff', 'catering_admin']

// Permission modules (from master doc)
export const PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard View', icon: 'las la-th-large' },
  { key: 'orders', label: 'Orders Manage', icon: 'las la-receipt' },
  { key: 'reservations', label: 'Reservations', icon: 'las la-calendar-check' },
  { key: 'catering', label: 'Bait Um Abdallah', icon: 'las la-concierge-bell' },
  { key: 'menu', label: 'Menu Manage', icon: 'las la-utensils' },
  { key: 'customers', label: 'Customers / CRM', icon: 'las la-user-friends' },
  { key: 'brands', label: 'Brand Management', icon: 'las la-store' },
  { key: 'branches', label: 'Branch Management', icon: 'las la-map-marked-alt' },
  { key: 'staff', label: 'Staff & Roles', icon: 'las la-user-shield' },
  { key: 'offers', label: 'Offers Manage', icon: 'las la-tags' },
  { key: 'vouchers', label: 'Voucher Manage', icon: 'las la-ticket-alt' },
  { key: 'loyalty', label: 'Loyalty Manage', icon: 'las la-medal' },
  { key: 'reports', label: 'Reports View', icon: 'las la-chart-pie' },
  { key: 'audit', label: 'Audit Logs', icon: 'las la-clipboard-list' },
  { key: 'settings', label: 'Settings Manage', icon: 'las la-cog' },
]

// What each role can access by default
export const ROLE_PERMISSIONS = {
  super_admin: PERMISSIONS.map((p) => p.key),
  branch_admin: ['dashboard', 'orders', 'reservations', 'menu', 'customers', 'staff', 'reports'],
  staff: ['dashboard', 'orders', 'menu'],
  catering_admin: ['catering'],
}

export function can(role, permission) {
  return (ROLE_PERMISSIONS[role] || []).includes(permission)
}

/* ---- Role-aware sidebar navigation ----
   Each item declares which permission it needs; sidebar filters by role. */
const NAV = [
  { section: 'Overview' },
  { label: 'Dashboard', path: '/dashboard', icon: 'las la-th-large', perm: 'dashboard' },

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
  { label: 'Customers / CRM', path: '/customers', icon: 'las la-user-friends', perm: 'customers' },

  { section: 'Organization' },
  { label: 'Brands', path: '/brands', icon: 'las la-store', perm: 'brands' },
  { label: 'Branches', path: '/branches', icon: 'las la-map-marked-alt', perm: 'branches' },
  {
    label: 'Staff & Roles',
    labelFor: { branch_admin: 'Staff' }, // no role management at branch level
    icon: 'las la-user-shield',
    perm: 'staff',
    children: [
      { label: 'All Staff', path: '/staff' },
      { label: 'Add Staff', path: '/staff?action=add', roles: ['branch_admin'] },
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

export function navForRole(role) {
  const allowed = new Set(ROLE_PERMISSIONS[role] || [])
  const out = []
  for (const item of NAV) {
    if (item.section) {
      out.push(item) // resolve later — drop empty sections after filtering
      continue
    }
    if (item.perm && !allowed.has(item.perm)) continue
    // per-role label override (e.g. "Staff & Roles" → "Staff" for branch managers)
    const label = item.labelFor?.[role] || item.label
    if (item.children) {
      // children may declare a `roles` whitelist — keep only those visible to this role
      const children = item.children.filter((c) => !c.roles || c.roles.includes(role))
      out.push({ ...item, label, children })
    } else {
      out.push({ ...item, label })
    }
  }
  // remove section headers that have no following items
  return out.filter((item, i) => {
    if (!item.section) return true
    const next = out[i + 1]
    return next && !next.section
  })
}

/* Landing page for a role after login — dashboard if allowed,
   otherwise the first nav destination the role can actually reach. */
export function homePathForRole(role) {
  if (can(role, 'dashboard')) return '/dashboard'
  const first = navForRole(role).find((item) => !item.section && (item.path || item.children))
  return first?.path || first?.children?.[0]?.path || '/dashboard'
}
