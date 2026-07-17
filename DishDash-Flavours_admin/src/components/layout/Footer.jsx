import { APP_NAME } from '../../config/app.js'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="admin-footer">
      <p>© {year} {APP_NAME}. Crafted with <span style={{ color: 'var(--danger)' }}>♥</span> for great kitchens.</p>
      <p>
        <a href="#privacy">Privacy</a> · <a href="#terms">Terms</a> · <a href="#support">Support</a>
      </p>
    </footer>
  )
}
