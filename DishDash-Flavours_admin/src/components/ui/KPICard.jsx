import { useCountUp } from '../../hooks/useCountUp.js'
import { MiniSpark } from './Charts.jsx'

const SPARK_COLORS = {
  green: '#9ed387', ink: '#1c2330', warn: '#e6a020',
  info: '#3b82c4', grape: '#8b6fc7', danger: '#e5484d',
}

export default function KPICard({
  icon, tone = 'green', label, value, prefix = '', suffix = '',
  decimals = 0, trend, trendDir = 'up', spark, style,
}) {
  const animated = useCountUp(value)
  const display = prefix + animated.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + suffix

  return (
    <div className="kpi-card" style={style}>
      <div className="kpi-top">
        <span className={`kpi-ic ${tone}`}><i className={icon} /></span>
        {trend != null && (
          <span className={`kpi-trend ${trendDir}`}>
            <i className={`las la-arrow-${trendDir === 'up' ? 'up' : 'down'}`} />
            {trend}
          </span>
        )}
      </div>
      <div className="kpi-value">{display}</div>
      <div className="kpi-label">{label}</div>
      {spark && <MiniSpark data={spark} color={SPARK_COLORS[tone]} />}
    </div>
  )
}
