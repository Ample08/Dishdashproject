export const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'las la-home',
  },
  {
    label: 'Orders',
    icon: 'las la-shopping-bag',
    children: [
      { label: 'All Orders', path: '/dashboard' },
      { label: 'Pending Orders', path: '/dashboard' },
      { label: 'Preparing', path: '/dashboard' },
      { label: 'Out for Delivery', path: '/dashboard' },
      { label: 'Delivered', path: '/dashboard' },
      { label: 'Cancelled', path: '/dashboard' },
    ],
  },
  {
    label: 'Menu',
    icon: 'las la-utensils',
    children: [
      { label: 'Categories', path: '/dashboard' },
      { label: 'Dishes', path: '/dashboard' },
      { label: 'Flavours', path: '/dashboard' },
      { label: 'Add-ons', path: '/dashboard' },
      { label: 'Combos & Deals', path: '/dashboard' },
    ],
  },
  {
    label: 'Customers',
    icon: 'las la-user-friends',
    children: [
      { label: 'All Customers', path: '/dashboard' },
      { label: 'Active Customers', path: '/dashboard' },
      { label: 'Blocked Customers', path: '/dashboard' },
    ],
  },
  {
    label: 'Delivery',
    icon: 'las la-motorcycle',
    children: [
      { label: 'Delivery Boys', path: '/dashboard' },
      { label: 'Delivery Zones', path: '/dashboard' },
      { label: 'Delivery Charges', path: '/dashboard' },
    ],
  },
  {
    label: 'Offers & Coupons',
    icon: 'las la-tags',
    children: [
      { label: 'All Coupons', path: '/dashboard' },
      { label: 'Create Coupon', path: '/dashboard' },
      { label: 'Festival Offers', path: '/dashboard' },
    ],
  },
  {
    label: 'Payments',
    icon: 'las la-wallet',
    children: [
      { label: 'All Transactions', path: '/dashboard' },
      { label: 'COD Orders', path: '/dashboard' },
      { label: 'Online Payments', path: '/dashboard' },
    ],
  },
  {
    label: 'Reviews',
    path: '/dashboard',
    icon: 'las la-star',
  },
  {
    label: 'Reports',
    icon: 'las la-chart-bar',
    children: [
      { label: 'Sales Report', path: '/dashboard' },
      { label: 'Order Report', path: '/dashboard' },
      { label: 'Top Selling Dishes', path: '/dashboard' },
    ],
  },
  {
    label: 'Settings',
    icon: 'las la-cog',
    children: [
      { label: 'Restaurant Profile', path: '/dashboard' },
      { label: 'Order Settings', path: '/dashboard' },
      { label: 'Notification Settings', path: '/dashboard' },
    ],
  },
]
