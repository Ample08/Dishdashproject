import { useId } from 'react'

/* ---------- helpers ---------- */
// Catmull-Rom -> cubic bezier smoothing for a set of [x,y] points
function smoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0][0]},${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`
  }
  return d
}

/* ---------- Area / line chart ---------- */
export function AreaChart({ labels, series, height = 240 }) {
  const uid = useId().replace(/:/g, '')
  const W = 760
  const H = height
  const padL = 38
  const padR = 16
  const padT = 18
  const padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const allValues = series.flatMap((s) => s.data)
  const max = Math.max(...allValues) * 1.15
  const min = 0
  const xFor = (i, len) => padL + (innerW * i) / (len - 1)
  const yFor = (v) => padT + innerH - (innerH * (v - min)) / (max - min)

  const gridLines = 4

  return (
    <svg className="area-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue chart">
      <defs>
        {series.map((s, i) => (
          <linearGradient key={i} id={`area-${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {/* grid */}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = padT + (innerH * i) / gridLines
        const val = Math.round(max - (max / gridLines) * i)
        return (
          <g key={i}>
            <line className="grid-line" x1={padL} y1={y} x2={W - padR} y2={y} strokeDasharray="3 5" />
            <text className="axis-label" x={padL - 8} y={y + 3} textAnchor="end">{val}k</text>
          </g>
        )
      })}

      {/* x labels */}
      {labels.map((lb, i) => (
        <text key={i} className="axis-label" x={xFor(i, labels.length)} y={H - 8} textAnchor="middle">{lb}</text>
      ))}

      {/* series */}
      {series.map((s, si) => {
        const pts = s.data.map((v, i) => [xFor(i, s.data.length), yFor(v)])
        const line = smoothPath(pts)
        const area = `${line} L ${pts[pts.length - 1][0]},${padT + innerH} L ${pts[0][0]},${padT + innerH} Z`
        return (
          <g key={si} style={{ animation: `fadeIn 0.8s ease ${si * 0.15}s both` }}>
            <path d={area} fill={`url(#area-${uid}-${si})`} />
            <path
              className="data-line"
              d={line}
              stroke={s.color}
              style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: `drawLine 1.4s var(--ease) ${si * 0.15}s forwards` }}
            />
            {pts.map((p, i) => (
              <circle key={i} className="data-dot" cx={p[0]} cy={p[1]} r="3.5" fill="#fff" stroke={s.color} strokeWidth="2.5">
                <title>{`${labels[i]}: ${s.data[i]}k`}</title>
              </circle>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

/* ---------- Donut chart ---------- */
export function DonutChart({ segments, size = 190, thickness = 22, centerLabel = 'Total' }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const cx = size / 2
  let offset = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Order status breakdown">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--cream-2)" strokeWidth={thickness} />
      {segments.map((seg, i) => {
        const frac = seg.value / total
        const len = frac * c
        const dash = `${len} ${c - len}`
        const el = (
          <circle
            key={i}
            className="donut-seg"
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cx})`}
            style={{ animation: `fadeIn 0.6s ease ${i * 0.1}s both` }}
          >
            <title>{`${seg.label}: ${seg.value}`}</title>
          </circle>
        )
        offset += len
        return el
      })}
      <g className="donut-center">
        <text x={cx} y={cx - 2} className="dc-value" fontSize="30">{total.toLocaleString()}</text>
        <text x={cx} y={cx + 18} className="dc-label">{centerLabel}</text>
      </g>
    </svg>
  )
}

/* ---------- Mini sparkline (KPI cards) ---------- */
export function MiniSpark({ data, color = '#9ed387' }) {
  const uid = useId().replace(/:/g, '')
  const W = 120
  const H = 40
  const max = Math.max(...data)
  const min = Math.min(...data)
  const pts = data.map((v, i) => [
    (W * i) / (data.length - 1),
    H - 4 - ((H - 8) * (v - min)) / (max - min || 1),
  ])
  const line = smoothPath(pts)
  const area = `${line} L ${W},${H} L 0,${H} Z`
  return (
    <svg className="kpi-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sp-${uid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
