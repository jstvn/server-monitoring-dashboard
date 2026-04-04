import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OverviewStat from '../components/OverviewStat';
import ServerCard from '../components/ServerCard';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const serverTemplates = [
  { id: 'srv-1', name: 'Northwind API', host: '10.24.8.12', port: 22, sshUser: 'ops' },
  { id: 'srv-2', name: 'Billing Worker', host: '10.24.8.18', port: 22, sshUser: 'deploy' },
  { id: 'srv-3', name: 'Search Cluster', host: '10.24.9.21', port: 2222, sshUser: 'search' },
  { id: 'srv-4', name: 'Media Edge', host: '10.24.9.33', port: 22, sshUser: 'edge' },
  { id: 'srv-5', name: 'Analytics Node', host: '10.24.10.14', port: 22, sshUser: 'analytics' },
  { id: 'srv-6', name: 'Cache Layer', host: '10.24.10.27', port: 2200, sshUser: 'cache' },
];

const storageProfiles = [
  { device: '/dev/sda0', fsType: 'EXT4', totalGb: 28 },
  { device: '/dev/nvme0n1p1', fsType: 'XFS', totalGb: 64 },
  { device: '/dev/sdb1', fsType: 'EXT4', totalGb: 48 },
  { device: '/dev/nvme1n1p1', fsType: 'BTRFS', totalGb: 96 },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, digits = 1) => Number(value.toFixed(digits));
const HISTORY_POINTS = 18;

const randomBetween = (min, max, digits = 1) => round(min + Math.random() * (max - min), digits);

const drift = (value, min, max, step, digits = 1) => {
  const next = value + randomBetween(-step, step, digits + 1);
  return round(clamp(next, min, max), digits);
};

const buildHistory = (base, min, max, step, points = HISTORY_POINTS) => {
  let current = base;
  return Array.from({ length: points }, (_, index) => {
    if (index === 0) return round(clamp(current, min, max), 1);
    current = drift(current, min, max, step);
    return current;
  });
};

const pushHistory = (history, nextValue) => [...history.slice(1), round(nextValue, 1)];

const seedServerWithDummyMetrics = (server, index, isPersisted = false) => {
  const online = Math.random() > 0.22;
  const cpuBase = online ? randomBetween(18, 72) : randomBetween(4, 16);
  const ramBase = online ? randomBetween(25, 78) : randomBetween(6, 22);
  const diskUsage = randomBetween(34, 89);
  const storageProfile = storageProfiles[index % storageProfiles.length];

  return {
    ...server,
    index,
    isPersisted,
    online,
    cpu: cpuBase,
    cpuTrend: online ? 'Smooth' : 'Idle',
    ram: ramBase,
    ramTrend: online ? 'Balanced' : 'Dormant',
    networkUp: online ? randomBetween(28, 420) : randomBetween(0, 40),
    networkDown: online ? randomBetween(36, 520) : randomBetween(0, 50),
    networkUpHistory: buildHistory(online ? randomBetween(32, 360) : randomBetween(4, 28), 0, 520, online ? 10 : 4),
    networkDownHistory: buildHistory(online ? randomBetween(44, 420) : randomBetween(5, 32), 0, 680, online ? 12 : 5),
    monthlyUp: randomBetween(42, 780, 2),
    monthlyDown: randomBetween(58, 980, 2),
    diskUsage,
    diskIo: online ? randomBetween(90, 740, 0) : randomBetween(12, 120, 0),
    storageDevice: storageProfile.device,
    storageFsType: storageProfile.fsType,
    storageTotalGb: storageProfile.totalGb,
  };
};

const evolveServer = (server) => {
  const onlineFlipChance = server.online ? 0.08 : 0.26;
  const online = Math.random() < onlineFlipChance ? !server.online : server.online;
  const cpuBounds = online ? [16, 92, 8] : [4, 22, 4];
  const ramBounds = online ? [18, 88, 7] : [6, 28, 4];
  const networkUpBounds = online ? [18, 520, 38] : [0, 42, 8];
  const networkDownBounds = online ? [28, 680, 46] : [0, 48, 8];
  const diskIoBounds = online ? [70, 980, 120] : [10, 140, 25];
  const nextCpu = drift(server.cpu, ...cpuBounds);
  const nextRam = drift(server.ram, ...ramBounds);
  const nextNetworkUp = drift(server.networkUp, ...networkUpBounds);
  const nextNetworkDown = drift(server.networkDown, ...networkDownBounds);
  const nextDiskIo = drift(server.diskIo, ...diskIoBounds, 0);

  return {
    ...server,
    online,
    cpu: nextCpu,
    cpuTrend: online ? (nextCpu >= 70 ? 'Hot' : 'Smooth') : 'Idle',
    ram: nextRam,
    ramTrend: online ? (nextRam >= 72 ? 'Busy' : 'Balanced') : 'Dormant',
    networkUp: nextNetworkUp,
    networkUpHistory: pushHistory(server.networkUpHistory, nextNetworkUp),
    networkDown: nextNetworkDown,
    networkDownHistory: pushHistory(server.networkDownHistory, nextNetworkDown),
    monthlyUp: round(server.monthlyUp + randomBetween(0.05, 1.2, 2), 2),
    monthlyDown: round(server.monthlyDown + randomBetween(0.06, 1.5, 2), 2),
    diskUsage: server.diskUsage,
    diskIo: nextDiskIo,
  };
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [demoServers, setDemoServers] = useState(() =>
    serverTemplates.map((template, index) => seedServerWithDummyMetrics(template, index, false))
  );
  const [savedServers, setSavedServers] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());

  useEffect(() => {
    const fetchSavedServers = async () => {
      if (!user?.token) return;
      try {
        const response = await axiosInstance.get('/api/servers', {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const enrichedServers = response.data.map((server, index) =>
          seedServerWithDummyMetrics(
            {
              ...server,
              id: server._id,
              host: server.host,
            },
            index,
            true
          )
        );

        setSavedServers(enrichedServers);
      } catch (error) {
        // Keep dashboard usable with demo servers even if API fails.
      }
    };

    fetchSavedServers();
  }, [user?.token]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDemoServers((current) => current.map(evolveServer));
      setSavedServers((current) => current.map(evolveServer));
      setLastRefreshed(Date.now());
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const servers = useMemo(() => [...savedServers, ...demoServers], [savedServers, demoServers]);

  const totals = useMemo(() => {
    const online = servers.filter((server) => server.online).length;
    return {
      total: servers.length,
      online,
      offline: servers.length - online,
      averageCpu: servers.length ? round(servers.reduce((sum, server) => sum + server.cpu, 0) / servers.length, 1) : 0,
    };
  }, [servers]);

  const refreshedText = `${Math.max(1, Math.round((Date.now() - lastRefreshed) / 1000))}s ago`;

  const handleAddServer = () => {
    navigate('/servers/new');
  };

  const handleEditServer = (server) => {
    navigate(`/servers/${server._id}/edit`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(226,232,240,0.92)_42%,_rgba(241,245,249,1)_100%)] text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="ui-card-glass overflow-hidden rounded-[2.5rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="ui-chip-badge">Live operations view</div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Server Monitoring Dashboard</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Centralized visibility into server health, capacity, and network activity with near real-time refresh across all monitored services.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[22rem]">
              <div className="ui-chip-meta">
                <div className="ui-chip-meta-label">Refresh</div>
                <div className="ui-chip-meta-value">Every 3s</div>
              </div>
              <div className="ui-chip-meta">
                <div className="ui-chip-meta-label">Last tick</div>
                <div className="ui-chip-meta-value tabular-nums">{refreshedText}</div>
              </div>
              <div className="ui-chip-meta sm:col-span-2 lg:col-span-1">
                <div className="ui-chip-meta-label">Average CPU</div>
                <div className="ui-chip-meta-value tabular-nums">{totals.averageCpu}%</div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <OverviewStat
              label="Total servers"
              value={totals.total}
              detail="All registered and demo server records currently shown in this dashboard."
              tone="indigo"
            />
            <OverviewStat
              label="Online"
              value={totals.online}
              detail="Servers currently in an active and reachable operating state."
              tone="emerald"
            />
            <OverviewStat
              label="Offline"
              value={totals.offline}
              detail="Servers currently unavailable or marked for follow-up checks."
              tone="violet"
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Monitored servers</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Compact status cards for CPU, RAM, network throughput, and storage utilization.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-600">Auto-refresh enabled across all server cards</div>
              <button onClick={handleAddServer} className="ui-btn-ghost whitespace-nowrap">
                Add Server
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {servers.map((server) => (
              <ServerCard key={server._id || server.id} server={server} onEdit={handleEditServer} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

