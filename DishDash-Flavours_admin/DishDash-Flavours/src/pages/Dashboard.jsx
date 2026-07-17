import { APP_NAME } from '../config/app.js'

const dashboardCards = [
  { title: 'Total Orders', count: 128, gradient: 'grad-1', icon: 'las la-shopping-bag' },
  { title: 'Menu Items', count: 45, gradient: 'grad-2', icon: 'las la-utensils' },
  { title: 'Flavours', count: 24, gradient: 'grad-3', icon: 'las la-pepper-hot' },
  { title: 'Customers', count: 312, gradient: 'grad-4', icon: 'las la-user-friends' },
  { title: 'Pending Orders', count: 8, gradient: 'grad-5', icon: 'las la-clock' },
  { title: "Today's Revenue", count: '₹4,250', gradient: 'grad-1', icon: 'las la-rupee-sign' },
  { title: 'Out for Delivery', count: 5, gradient: 'grad-2', icon: 'las la-motorcycle' },
  { title: 'Active Coupons', count: 6, gradient: 'grad-3', icon: 'las la-tags' },
]

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Restaurant Dashboard</h2>
        <p>Manage orders, menu, flavours & customers for {APP_NAME}</p>
      </div>

      <div className="dashboard-cards">
        {dashboardCards.map((card) => (
          <div key={card.title} className={`dashboard-card ${card.gradient}`}>
            <div className="card-content">
              <div className="card-top">
                <i className={`${card.icon} card-icon`} />
                <span className="card-title">{card.title}</span>
              </div>
              <div className="card-count">{card.count}</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="card-wave">
              <path fill="rgba(255,255,255,0.3)" d="M0,128L34.3,112C68.6,96,137,64,206,96C274.3,128,343,224,411,250.7C480,277,549,235,617,213.3C685.7,192,754,192,823,181.3C891.4,171,960,149,1029,117.3C1097.1,85,1166,43,1234,58.7C1302.9,75,1371,149,1406,186.7L1440,224L1440,320L0,320Z" />
            </svg>
          </div>
        ))}
      </div>

      <div className="dashboard-welcome">
        <h3>Quick Overview</h3>
        <p>
          Welcome to {APP_NAME} Food Ordering Admin. Track live orders, update menu & flavours,
          manage customers and grow your restaurant business from here.
        </p>
      </div>
    </div>
  )
}
