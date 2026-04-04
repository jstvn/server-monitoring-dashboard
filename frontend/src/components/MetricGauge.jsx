import { useId } from 'react';

const toneMap = {
  cyan: {
    glow: 'bg-cyan-500/10',
    label: 'text-cyan-700',
    stops: ['#67e8f9', '#0ea5e9', '#2563eb'],
  },
  violet: {
    glow: 'bg-violet-500/10',
    label: 'text-violet-700',
    stops: ['#c4b5fd', '#d946ef', '#7c3aed'],
  },
  amber: {
    glow: 'bg-amber-500/10',
    label: 'text-amber-700',
    stops: ['#fcd34d', '#fb923c', '#f43f5e'],
  },
  emerald: {
    glow: 'bg-emerald-500/10',
    label: 'text-emerald-700',
    stops: ['#86efac', '#34d399', '#0f766e'],
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const MetricGauge = ({ label, value, tone = 'cyan', suffix = '%', hint }) => {
  const gradientId = useId();
  const toneStyles = toneMap[tone] || toneMap.cyan;
  const safeValue = clamp(Number.isFinite(value) ? value : 0, 0, 100);
  const size = 108;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="ui-card-elevated flex flex-col items-center border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm">
      <div className={`rounded-full p-2.5 ${toneStyles.glow}`}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '88px', height: '88px' }} className="block">
          <defs>
            <linearGradient id={`${gradientId}-wash`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id={`${gradientId}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={toneStyles.stops[0]} />
              <stop offset="55%" stopColor={toneStyles.stops[1]} />
              <stop offset="100%" stopColor={toneStyles.stops[2]} />
            </linearGradient>
          </defs>

          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId}-wash)`}
            strokeWidth={strokeWidth + 2}
            opacity="0.9"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId}-ring)`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
          <circle cx={center} cy={center} r="26" fill="white" opacity="0.95" />
           <text
             x="50%"
             y="48%"
             dominantBaseline="middle"
             textAnchor="middle"
             className="fill-slate-900"
             style={{ fontSize: '26px', fontWeight: 700 }}
           >
             {Math.round(safeValue)}
          </text>
          <text
            x="50%"
            y="64%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="fill-slate-500"
            style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase' }}
          >
            {suffix}
          </text>
        </svg>
      </div>
      <div className="mt-3 text-center">
        <div className={`text-xs font-semibold uppercase tracking-[0.24em] ${toneStyles.label}`}>{label}</div>
        {hint ? <div className="mt-1 text-[11px] leading-4 text-slate-500">{hint}</div> : null}
      </div>
    </div>
  );
};

export default MetricGauge;
