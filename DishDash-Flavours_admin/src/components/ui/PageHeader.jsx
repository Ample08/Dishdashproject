export default function PageHeader({ crumb, title, subtitle, children }) {
  return (
    <div className="page-head">
      <div className="ph-left">
        {crumb && (
          <div className="crumb">
            <i className="las la-home" />
            {crumb.map((c, i) => (
              <span key={i}>
                {i > 0 && <i className="las la-angle-right" style={{ margin: '0 2px' }} />}
                {c}
              </span>
            ))}
          </div>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="ph-actions">{children}</div>}
    </div>
  )
}
