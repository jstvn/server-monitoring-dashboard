import { useId } from 'react';
import MetricGauge from './MetricGauge';

const statusTone = {
  online: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20',
  offline: 'bg-slate-500/10 text-slate-600 ring-1 ring-slate-400/20',
};

const metricBarTone = {
  cyan: 'from-cyan-400 to-blue-600',
  emerald: 'from-emerald-400 to-teal-600',
  amber: 'from-amber-300 to-rose-500',
};

const liquidToneMap = {
  cyan: {
    bg: 'from-slate-100/95 via-cyan-50/82 to-cyan-100/78',
    fill: ['#7dd3fc', '#38bdf8', '#1d4ed8'],
    text: 'text-cyan-700',
  },
  emerald: {
    bg: 'from-emerald-100/88 via-teal-100/84 to-emerald-100/78',
    fill: ['#99f6e4', '#34d399', '#0f766e'],
    text: 'text-emerald-700',
  },
};

const buildSmoothPath = (points) => {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const commands = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length - 1; i += 1) {
    const previous = points[i - 1] || points[i];
    const current = points[i];
    const next = points[i + 1];
    const afterNext = points[i + 2] || next;

    const cp1x = current.x + (next.x - previous.x) / 6;
    const cp1y = current.y + (next.y - previous.y) / 6;
    const cp2x = next.x - (afterNext.x - current.x) / 6;
    const cp2y = next.y - (afterNext.y - current.y) / 6;

    commands.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${next.x} ${next.y}`);
  }

  return commands.join(' ');
};

const buildWavePaths = (history, width, height, referenceCap = 600) => {
  if (!history?.length) return { surfacePath: '', fillPath: '' };

  const smoothedHistory = history.map((value, index, array) => {
    const prev = array[index - 1] ?? value;
    const next = array[index + 1] ?? value;
    return (prev + value + next) / 3;
  });

  const avgSpeed = smoothedHistory.reduce((sum, value) => sum + value, 0) / smoothedHistory.length;
  const safeCap = Math.max(1, referenceCap);
  const normalizedAvg = Math.min(1, Math.max(0, avgSpeed / safeCap));
  const weightedAvg = Math.pow(normalizedAvg, 1.55);
  const minLevelY = height * 0.58;
  const maxLevelY = height * 0.8;
  const baseLevel = maxLevelY - weightedAvg * (maxLevelY - minLevelY);
  const localSpan = Math.max(...smoothedHistory) - Math.min(...smoothedHistory);
  const normalizedSpan = Math.min(1, localSpan / Math.max(safeCap * 0.2, 35));
  const waveDepth = height * (0.018 + normalizedSpan * 0.02);

  const points = smoothedHistory.map((value, index) => {
    const localDelta = Math.min(1, Math.max(-1, (value - avgSpeed) / Math.max(localSpan, 1)));
    const y = baseLevel - localDelta * waveDepth;
    const x = (index / (history.length - 1)) * width;
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
  });

  const surfacePath = buildSmoothPath(points);
  const fillPath = `${surfacePath} L ${width} ${height} L 0 ${height} Z`;

  return { surfacePath, fillPath };
};

const LiquidStatBar = ({ label, value, hint, tone = 'cyan', history, referenceCap }) => {
  const waveId = useId();
  const toneStyles = liquidToneMap[tone] || liquidToneMap.cyan;
  const { surfacePath, fillPath } = buildWavePaths(history, 320, 124, referenceCap);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/65 bg-gradient-to-br ${toneStyles.bg} ui-shadow-panel px-4 py-4 sm:px-5`}>

      <svg viewBox="0 0 320 124" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`${waveId}-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={toneStyles.fill[0]} stopOpacity="0.78" />
            <stop offset="52%" stopColor={toneStyles.fill[1]} stopOpacity="0.58" />
            <stop offset="100%" stopColor={toneStyles.fill[1]} stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`${waveId}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={toneStyles.fill[0]} />
            <stop offset="100%" stopColor={toneStyles.fill[2]} />
          </linearGradient>
        </defs>
        <path d={fillPath} fill={`url(#${waveId}-fill)`} />
        <path d={surfacePath} fill="none" stroke={`url(#${waveId}-stroke)`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      </svg>

      <div className="relative z-10 flex min-h-[124px] flex-col justify-between">
        <div>
          <div className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${toneStyles.text}`}>{label.toUpperCase()}</div>
          <div className="mt-1 whitespace-nowrap text-xl font-semibold tabular-nums text-slate-900 sm:text-[1.55rem]">{value}</div>
          <div className="ui-text-hint mt-1">{hint}</div>
        </div>
      </div>
    </div>
  );
};

const StatBar = ({ label, value, hint, tone = 'cyan', width = '70%', history, referenceCap }) => {
  if (history?.length) {
    return <LiquidStatBar label={label} value={value} hint={hint} tone={tone} history={history} referenceCap={referenceCap} />;
  }

  return (
    <div className="ui-card-panel border border-slate-200/80 bg-slate-50/80 p-4">
      <div>
        <div className="ui-text-label-caps">{label}</div>
        <div className="mt-1">
          <div className="inline-block min-w-[10ch] whitespace-nowrap text-base font-semibold tabular-nums text-slate-900 sm:text-lg">
            {value}
          </div>
          <div className="ui-text-hint mt-1">{hint}</div>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/80">
        <div className={`h-full rounded-full bg-gradient-to-r ${metricBarTone[tone] || metricBarTone.cyan}`} style={{ width }} />
      </div>
    </div>
  );
};

const ServerCard = ({ server }) => {
  const formatPercent = (value) => Number(value.toFixed(1));
  const formatStorageValue = (valueInGb) => {
    if (valueInGb >= 100) return `${Math.round(valueInGb)}G`;
    if (valueInGb >= 10) return `${Math.round(valueInGb)}G`;
    return `${valueInGb.toFixed(1)}G`;
  };
  const uptimeLabel = server.online ? 'Stable link' : 'Connection paused';
  const monthlyUp = `${server.monthlyUp.toFixed(1)} GB`;
  const monthlyDown = `${server.monthlyDown.toFixed(1)} GB`;
  const storageFreePercent = `${formatPercent(Math.max(0, 100 - server.diskUsage))}% free`;
  const storageDevice = server.storageDevice || '/dev/sda0';
  const storageFsType = server.storageFsType || 'EXT4';
  const storageTotalGb = Number(server.storageTotalGb) > 0 ? Number(server.storageTotalGb) : 28;
  const storageUsedGb = (storageTotalGb * Math.min(100, Math.max(0, server.diskUsage))) / 100;
  const storageFreeGb = Math.max(0, storageTotalGb - storageUsedGb);
  const storageFreeCapacity = `${formatStorageValue(storageFreeGb)} free`;

  return (
    <article className="ui-card-elevated ui-shadow-float border-white/70 bg-white/85 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900">{server.name}</h3>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${statusTone[server.online ? 'online' : 'offline']}`}>
              {server.online ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
            <span>{server.ip}</span>
            <span>•</span>
            <span>Port {server.port}</span>
            <span>•</span>
            <span>{server.sshUser}</span>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50/90 px-4 py-3 text-right">
          <div className="ui-text-label-micro">Monitoring state</div>
          <div className="mt-1 text-sm font-medium text-slate-900">{uptimeLabel}</div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.38fr_0.62fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricGauge label="CPU" value={server.cpu} tone="cyan" hint={`${server.cpuTrend} load`} />
            <MetricGauge label="RAM" value={server.ram} tone="violet" hint={`${server.ramTrend} utilization`} />
            <MetricGauge label="Disk" value={server.diskUsage} tone="amber" hint={`${storageFreePercent}`} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatBar
              label="Network upload"
              value={`${server.networkUp.toFixed(1)} Mbps`}
              hint={`Month ${monthlyUp}`}
              tone="cyan"
              history={server.networkUpHistory}
                referenceCap={520}
            />
            <StatBar
              label="Network download"
              value={`${server.networkDown.toFixed(1)} Mbps`}
              hint={`Month ${monthlyDown}`}
              tone="emerald"
              history={server.networkDownHistory}
                referenceCap={680}
            />
          </div>
        </div>

        <div className="ui-card-soft border-slate-200/80 bg-slate-50/80 grid gap-3 p-3.5">
          <div className="ui-card-panel ui-shadow-panel bg-white/90 p-4">
            <div className="ui-text-label-caps">Disk I/O</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{server.diskIo.toFixed(0)} ops/s</div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500"
                style={{ width: `${Math.min(100, Math.max(25, server.diskIo / 8))}%` }}
              />
            </div>
          </div>
           <div className="ui-card-panel ui-shadow-panel bg-white/90 p-4">
             <div className="ui-text-label-caps">Storage remaining</div>
              <div className="mt-2 whitespace-nowrap text-2xl font-semibold tracking-tight text-slate-900">{storageFreeCapacity}</div>
              <div className="mt-3">
                <div className="min-w-0 text-[11px] text-slate-500">
                  <div className="break-all font-mono font-semibold normal-case tracking-normal text-slate-600">{storageDevice}</div>
                  <div className="mt-1 font-semibold uppercase tracking-[0.14em]">{storageFsType}</div>
                </div>
                <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs leading-5 text-slate-500">
                  <span>Used</span>
                  <span className="text-right font-semibold tabular-nums text-slate-700">{formatStorageValue(storageUsedGb)}</span>
                  <span>Total</span>
                  <span className="text-right font-semibold tabular-nums text-slate-700">{formatStorageValue(storageTotalGb)}</span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </article>
  );
};

export default ServerCard;










