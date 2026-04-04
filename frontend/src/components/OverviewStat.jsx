const accentMap = {
  indigo: 'from-indigo-500 via-sky-500 to-cyan-400',
  emerald: 'from-emerald-500 via-teal-500 to-cyan-400',
  violet: 'from-violet-500 via-fuchsia-500 to-pink-400',
};

const OverviewStat = ({ label, value, detail, tone = 'indigo' }) => {
  const accent = accentMap[tone] || accentMap.indigo;

  return (
    <div className="ui-card-elevated border-slate-200/80 bg-white/85 p-5 backdrop-blur-sm">
      <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${accent}`} />
      <div className="mt-4 text-sm font-medium text-slate-600">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
      <div className="mt-2 text-sm leading-6 text-slate-500">{detail}</div>
    </div>
  );
};

export default OverviewStat;
