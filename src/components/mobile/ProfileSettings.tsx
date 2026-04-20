import React, { useState, useEffect, useMemo, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Copy,
  Shield,
  Clock,
  ExternalLink,
  Lock,
  EyeOff,
  Fingerprint,
  Trash2,
  ChevronRight,
  Activity,
  ShieldCheck,
  Square,
  RefreshCw,
  Zap,
  Radar,
  Terminal,
  Cpu,
  Globe,
  Settings,
  Plus,
  QrCode,
  Key,
  Check,
  ShieldAlert,
} from "lucide-react";
import { IdentityCard } from "./IdentityCard";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export const ProfileSettings = ({
  did,
  devices,
}: {
  did: string;
  devices: any[];
}) => {
  const [alias, setAlias] = useState("CYBER_NOMAD");
  const [bio, setBio] = useState(
    "ENCRYPTED HUMAN ENTITY // MESH_OPERATOR_01 // VOID_RUNNER",
  );
  const [avatarSeed, setAvatarSeed] = useState(did);
  const [showIdentityCard, setShowIdentityCard] = useState(false);
  const [securityStates, setSecurityStates] = useState({
    biometrics: true,
    privacy: false,
    ipMasking: true,
  });
  const [password, setPassword] = useState("********");
  const [powerProfile, setPowerProfile] = useState<
    "PERFORMANCE" | "BALANCE" | "ECO"
  >("BALANCE");
  const [isMining, setIsMining] = useState(true);
  const [deviceList, setDeviceList] = useState(devices);
  const [isDevMode, setIsDevMode] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showSeed, setShowSeed] = useState(false);
  const [seedCopied, setSeedCopied] = useState(false);
  const hideSeedTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [syncPhase, setSyncPhase] = useState<'DISPLAY' | 'INPUT'>('DISPLAY');
  const [sharedSecret, setSharedSecret] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [revocationTarget, setRevocationTarget] = useState<any>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Simulated Seed (Normally derived from local secure enclave)
  const recoverySeed = useMemo(() => {
    return Array.from({length: 4}, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join('-');
  }, []);

  const handleToggleSeed = () => {
    const nextState = !showSeed;
    setShowSeed(nextState);
    
    // Auto-hide security mechanism
    if (nextState) {
      if (hideSeedTimerRef.current) clearTimeout(hideSeedTimerRef.current);
      hideSeedTimerRef.current = setTimeout(() => {
        setShowSeed(false);
      }, 60000); // Mask after 60 seconds
    } else {
      if (hideSeedTimerRef.current) clearTimeout(hideSeedTimerRef.current);
    }
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(recoverySeed);
    setSeedCopied(true);
    
    // Security: Auto-mask immediately after one-time copy
    setTimeout(() => {
      setSeedCopied(false);
      setShowSeed(false);
      if (hideSeedTimerRef.current) clearTimeout(hideSeedTimerRef.current);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (hideSeedTimerRef.current) clearTimeout(hideSeedTimerRef.current);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      if (scannerRef.current) await scannerRef.current.stop();
      
      const html5QrCode = new Html5Qrcode("nexus-qr-reader");
      scannerRef.current = html5QrCode;
      setIsScanning(true);

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          console.log("SCAN_SUCCESS::DECODED_DATA:", decodedText);
          await stopScanner();
          handleSyncExecution("MAPPED_NODE_" + decodedText.slice(0, 8));
        },
        () => {}
      );
    } catch (err) {
      console.error("SCAN_INIT_FAILURE:", err);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("SCAN_STOP_FAILURE:", err);
      }
    }
    setIsScanning(false);
  };

  const handleSyncExecution = async (name: string) => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsSyncing(false);
    setSyncSuccess(true);
    
    setDeviceList(prev => [{
      id: 'NODE_'+Date.now(),
      name: name.toUpperCase(),
      ip: 'SECURE_MESH',
      lastSeen: 'just now',
      isCurrent: false
    }, ...prev]);

    setTimeout(() => {
      setSyncSuccess(false);
      setShowSyncModal(false);
    }, 2000);
  };

  const [iceCandidates, setIceCandidates] = useState<string[]>([]);
  const [trafficLogs, setTrafficLogs] = useState<string[]>([]);

  // Simulation for Advanced Diagnostics
  useEffect(() => {
    if (!isDevMode) return;

    const interval = setInterval(() => {
      const protocols = ["UDP/SRTP", "TCP/TLS", "TURN/relay"];
      const locations = ["US-WEST", "EU-CENTRAL", "ASIA-SOUTH"];
      const newCand = `CAND_${Math.random().toString(16).slice(2, 6).toUpperCase()} // ${protocols[Math.floor(Math.random() * 3)]} // ${locations[Math.floor(Math.random() * 3)]}`;
      
      setIceCandidates(prev => [newCand, ...prev].slice(0, 5));
      
      const actions = ["TX_ACK", "PX_SHARD_SYNC", "DHT_QUERY", "P2P_HANDSHAKE"];
      const newLog = `[${new Date().toLocaleTimeString()}] ${actions[Math.floor(Math.random() * 4)]}::${Math.floor(Math.random() * 1000)}B`;
      setTrafficLogs(prev => [newLog, ...prev].slice(0, 8));
    }, 2000);

    return () => clearInterval(interval);
  }, [isDevMode]);

  // Bandwidth history for the last 60 seconds
  const [bandwidthData, setBandwidthData] = useState<
    {
      time: string;
      inbound: number;
      outbound: number;
      integrity: number;
      lag: number;
    }[]
  >([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setBandwidthData((prev) => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

        // Dynamic metrics simulation
        const newEntry = {
          time: timeStr,
          inbound: 0.8 + Math.random() * 0.8,
          outbound: 0.2 + Math.random() * 0.6,
          integrity: 95 + Math.random() * 5, // 95-100%
          lag: 10 + Math.random() * 15, // 10-25ms
        };
        const updated = [...prev, newEntry];
        return updated.slice(-60);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const latestStats = React.useMemo(() => {
    if (bandwidthData.length === 0)
      return {
        inbound: "0.0 MB/s",
        outbound: "0.0 KB/s",
        integrity: 0,
        lag: 0,
        health: { score: 0, status: "OFFLINE", color: "text-nexus-ink-muted" },
      };
    const latest = bandwidthData[bandwidthData.length - 1];

    // Calculate health score (0-100)
    // 1. Integrity (40%)
    // 2. Lag (30%) - lower is better, 0-50ms range
    // 3. Bandwidth (30%) - combined > 1.0 MB/s is ideal
    const integrityScore = latest.integrity;
    const lagScore = Math.max(0, 100 - latest.lag * 2); // 50ms = 0 score
    const bwScore = Math.min(
      100,
      ((latest.inbound + latest.outbound) / 1.5) * 100,
    );

    const totalScore = integrityScore * 0.4 + lagScore * 0.3 + bwScore * 0.3;

    let status: "STABLE" | "DEGRADED" | "CRITICAL" = "STABLE";
    let color = "text-[#10B981]"; // Stable green

    if (totalScore < 60) {
      status = "CRITICAL";
      color = "text-[#EF4444]"; // Critical red
    } else if (totalScore < 85) {
      status = "DEGRADED";
      color = "text-nexus-accent-gold"; // Degraded gold
    }

    return {
      inbound: `${latest.inbound.toFixed(1)} MB/s`,
      outbound: `${(latest.outbound * 1024).toFixed(0)} KB/s`,
      integrity: latest.integrity.toFixed(1),
      lag: Math.round(latest.lag),
      health: {
        score: Math.round(totalScore),
        status,
        color,
      },
    };
  }, [bandwidthData]);

  const toggleSwitch = (key: keyof typeof securityStates) => {
    setSecurityStates((prev) => ({ ...prev, [key]: !prev[key] }));
    if ("vibrate" in navigator) navigator.vibrate(15);
  };

  const calculateStrength = (pass: string) => {
    if (pass.length < 4) return 20;
    if (pass.length < 8) return 50;
    return 90;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 bg-nexus-bg overflow-y-auto scrollbar-hide h-full flex flex-col relative font-sans">
      <AnimatePresence>
        {showIdentityCard && (
          <motion.div
            initial={{ opacity: 0, x: 393 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 393 }}
            className="absolute inset-0 bg-nexus-bg z-[500] flex flex-col"
          >
            <div className="flex items-center px-6 mb-4 mt-6">
              <button
                onClick={() => setShowIdentityCard(false)}
                className="bg-black/5 border border-nexus-border text-nexus-ink-muted px-3 py-1.5 rounded-[2px] font-bold text-[8px] tracking-[4px] uppercase hover:text-nexus-ink transition-all cursor-pointer"
              >
                {"< RETURN_TO_SYSTEM"}
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center -translate-y-4 px-4 overflow-hidden">
               <IdentityCard did={did} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 pt-3 pb-24 space-y-4">
        {/* Module 0: Network Vitals Dashboard */}
        <div className="space-y-2">
           <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <span className="text-nexus-accent-blue font-bold text-[9px] tracking-[2px] uppercase leading-none">Vitals_Dashboard</span>
              </div>
              <Activity size={10} className="text-nexus-ink-muted opacity-20" />
           </div>

          <div className="bg-nexus-surface border border-nexus-border shadow-[0_5px_15px_rgba(0,0,0,0.02)] p-3 rounded-[4px] space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(var(--nexus-ink), 0.01)"
                    strokeWidth="1"
                  />
                  <motion.circle
                    initial={{ strokeDasharray: "0 176" }}
                    animate={{
                      strokeDasharray: `${(Number(latestStats.integrity) / 100) * 176} 176`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="var(--nexus-accent-blue)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="text-nexus-accent-blue"
                  />
                </svg>
                <div className="flex flex-col items-center">
                    <div className="flex items-baseline leading-none">
                       <span className="text-nexus-ink text-lg font-black tracking-tighter">
                         {Math.round(Number(latestStats.integrity))}
                       </span>
                    </div>
                </div>
              </div>
              <div className="flex-1 ml-4 space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-nexus-ink-muted opacity-60 text-[8px] uppercase font-bold leading-none">
                    In_Stream
                  </span>
                  <span className="text-nexus-ink font-bold text-[11px] tracking-tight leading-none">
                    {latestStats.inbound.replace(' MB/s', '')}<span className="text-[7px] text-nexus-ink-muted ml-0.5 opacity-40 uppercase font-mono">MB/S</span>
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-nexus-ink-muted opacity-60 text-[8px] uppercase font-bold leading-none">
                    Out_Diff
                  </span>
                  <span className="text-nexus-ink font-bold text-[11px] tracking-tight leading-none">
                    {latestStats.outbound.replace(' KB/s', '')}<span className="text-[7px] text-nexus-ink-muted ml-0.5 opacity-40 uppercase font-mono">KB/S</span>
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-nexus-ink-muted opacity-60 text-[8px] uppercase font-bold leading-none">
                    Latency
                  </span>
                  <span className="text-nexus-accent-blue font-bold text-[11px] tracking-tight leading-none font-mono">
                    {latestStats.lag}<span className="text-[7px] ml-0.5 uppercase">MS</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Health Meter HUD */}
            <div className="pt-2 border-t border-nexus-border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                   <div className="w-[1px] h-2 bg-nexus-accent-blue" />
                   <span className="text-nexus-ink font-bold text-[8px] uppercase tracking-[1px]">
                     Health_Signature
                   </span>
                </div>
                <span className={`text-[8px] font-black tracking-[0.5px] uppercase ${latestStats.health.color}`}>
                  {latestStats.health.status}
                </span>
              </div>
              <div className="relative h-0.5 w-full bg-nexus-bg rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${latestStats.health.score}%` }}
                  style={{ backgroundColor: 'var(--nexus-accent-blue)' }}
                  className={`h-full ${latestStats.health.status === "STABLE" ? "bg-nexus-accent-blue" : latestStats.health.status === "DEGRADED" ? "bg-nexus-accent-gold" : "bg-red-500"}`}
                />
              </div>
            </div>

            {/* Premium Multi-Metric Telemetry Chart */}
            <div className="h-28 w-full bg-nexus-bg/50 rounded-[4px] border border-nexus-border p-1 overflow-hidden relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bandwidthData}>
                  <defs>
                    <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={"var(--nexus-accent-blue)"} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={"var(--nexus-accent-blue)"} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={"var(--nexus-accent-cyan)"} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={"var(--nexus-accent-cyan)"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  
                  <Tooltip 
                    content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                         return (
                           <div className="bg-nexus-surface/95 backdrop-blur-md border border-nexus-border p-2 rounded-[2px] shadow-2xl z-[1000] min-w-[100px]">
                             <div className="text-[7px] font-mono font-black text-nexus-ink-muted mb-1.5 opacity-40 border-b border-nexus-border pb-1">
                               T_STAMP: {payload[0].payload.time}
                             </div>
                             <div className="space-y-1">
                               {payload.map((p: any) => (
                                 <div key={p.name} className="flex items-center justify-between space-x-3">
                                   <div className="flex items-center space-x-1.5">
                                     <div className="w-1 h-1 rounded-full" style={{ backgroundColor: p.stroke }} />
                                     <span className="text-[7px] font-bold uppercase tracking-[1px]" style={{ color: p.stroke }}>{p.name}</span>
                                   </div>
                                   <span className="text-[8px] font-mono font-black text-nexus-ink">
                                     {p.value.toFixed(2)}{p.name === 'INTG' ? '%' : p.name === 'LAG' ? 'ms' : ''}
                                   </span>
                                 </div>
                               ))}
                             </div>
                           </div>
                         );
                       }
                       return null;
                    }}
                  />

                  <YAxis yAxisId="bw" hide domain={[0, 'auto']} />
                  <YAxis yAxisId="pct" hide domain={[0, 100]} />

                  {/* Integrity Line (Global Health) */}
                  <Area
                    yAxisId="pct"
                    type="step"
                    dataKey="integrity"
                    name="INTG"
                    stroke={"#10B981"}
                    strokeWidth={1}
                    fill="none"
                    isAnimationActive={false}
                  />

                  {/* Outbound Stream */}
                  <Area
                    yAxisId="bw"
                    type="monotone"
                    dataKey="outbound"
                    name="OUT"
                    stroke={"var(--nexus-accent-cyan)"}
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorOutbound)"
                    isAnimationActive={false}
                  />

                  {/* Inbound Stream */}
                  <Area
                    yAxisId="bw"
                    type="monotone"
                    dataKey="inbound"
                    name="IN"
                    stroke={"var(--nexus-accent-blue)"}
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorInbound)"
                    isAnimationActive={false}
                  />

                  {/* Lag Jitter */}
                  <Area
                    yAxisId="bw"
                    type="basis"
                    dataKey="lag"
                    name="LAG"
                    stroke={"var(--nexus-accent-gold)"}
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    fill="none"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Tactical Legend Overlay */}
              <div className="absolute top-2 right-2 flex flex-col space-y-1 pointer-events-none">
                 <div className="flex items-center space-x-1.5 justify-end">
                    <span className="text-[6px] font-bold text-nexus-accent-blue uppercase tracking-widest">IN_STREAM</span>
                    <div className="w-2 h-[1px] bg-nexus-accent-blue" />
                 </div>
                 <div className="flex items-center space-x-1.5 justify-end">
                    <span className="text-[6px] font-bold text-nexus-accent-cyan uppercase tracking-widest">OUT_DIFF</span>
                    <div className="w-2 h-[1px] bg-nexus-accent-cyan" />
                 </div>
                 <div className="flex items-center space-x-1.5 justify-end">
                    <span className="text-[6px] font-bold text-[#10B981] uppercase tracking-widest">INTEGRITY</span>
                    <div className="w-2 h-[1px] bg-[#10B981]" />
                 </div>
                 <div className="flex items-center space-x-1.5 justify-end">
                    <span className="text-[6px] font-bold text-nexus-accent-gold uppercase tracking-widest">LATENCY</span>
                    <div className="w-2 h-[1px] bg-nexus-accent-gold border-t border-dashed border-nexus-accent-gold" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module X: Nexus Minting Subsystem */}
        <div className="space-y-2">
           <div className="flex justify-between items-center px-1">
              <div className="flex flex-col">
                <span className="text-nexus-ink font-bold text-[9px] tracking-[2px] uppercase leading-none">Minting_Subsystem</span>
              </div>
              <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-nexus-accent-cyan/10 rounded-full">
                <div className={`w-1 h-1 rounded-full ${isMining ? "bg-nexus-accent-cyan" : "bg-nexus-ink-muted/40"}`} />
                <span className="text-nexus-accent-cyan font-bold text-[7px] tracking-[1px]">
                  {isMining ? "ACTIVE" : "DORMANT"}
                </span>
              </div>
           </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-nexus-surface border border-nexus-border shadow-[0_5px_15px_rgba(0,0,0,0.02)] p-3 rounded-[4px]">
              <span className="text-nexus-ink-muted opacity-40 font-bold text-[7px] uppercase tracking-[1px] mb-1 block">
                Daily_Yield
              </span>
              <div className="flex items-baseline space-x-1.5 leading-none">
                <span className="text-nexus-ink text-lg font-black tracking-tighter">
                  128.42
                </span>
                <span className="text-nexus-ink-muted opacity-30 font-bold text-[7px]">
                  NXS
                </span>
              </div>
            </div>
            <div className="bg-nexus-surface border border-nexus-border shadow-[0_5px_15px_rgba(0,0,0,0.02)] p-3 rounded-[4px]">
              <span className="text-nexus-ink-muted opacity-40 font-bold text-[7px] uppercase tracking-[1px] mb-1 block">
                Mesh_Trust
              </span>
              <div className="flex items-baseline space-x-1.5 leading-none">
                <span className="text-nexus-ink text-lg font-black tracking-tighter">
                  0.92
                </span>
                <span className="text-nexus-ink-muted opacity-30 font-bold text-[7px]">
                  P_SIG
                </span>
              </div>
            </div>
          </div>

          <div className="bg-nexus-surface border border-nexus-border shadow-[0_5px_15px_rgba(0,0,0,0.02)] p-4 rounded-[4px]">
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex flex-col">
                <span className="text-nexus-ink font-bold text-[11px] tracking-tight leading-none">
                  Efficiency_Profile
                </span>
              </div>
              <Switch
                active={isMining}
                onClick={() => setIsMining(!isMining)}
              />
            </div>

            <div className="flex space-x-1 p-1 bg-nexus-bg/50 rounded-[4px]">
              {(["ECO", "BALANCE", "PERFORMANCE"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPowerProfile(p)}
                  className={`flex-1 py-1.5 font-bold text-[8px] uppercase transition-all rounded-[3px] border-none cursor-pointer ${powerProfile === p ? "bg-nexus-accent-blue text-white shadow-sm" : "bg-transparent text-nexus-ink-muted opacity-50 hover:bg-nexus-ink-muted/5"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Module A: Security & Biometrics */}
        <div className="space-y-3">
           <div className="flex flex-col px-1">
              <span className="text-nexus-accent-blue font-bold text-[9px] tracking-[2px] uppercase leading-none">Security_Layer</span>
           </div>

          <div className="bg-nexus-surface border border-nexus-border shadow-[0_5px_15px_rgba(0,0,0,0.02)] p-4 rounded-[4px] space-y-4">
            {/* Vault Password */}
            <div className="space-y-2">
              <span className="text-nexus-ink font-black text-[9px] tracking-tight uppercase">
                Symmetric_Vault_Key
              </span>
              <div className="bg-nexus-bg p-3 rounded-[4px] border border-nexus-border focus-within:border-nexus-accent-blue transition-all flex items-center justify-between">
                <div className="flex items-center space-x-3">
                   <Lock size={12} className="text-nexus-ink-muted" />
                   <span className="text-nexus-ink font-bold text-[11px] tracking-widest font-mono">✱✱✱✱✱✱✱✱</span>
                </div>
                <button className="text-nexus-accent-blue font-bold text-[8px] uppercase tracking-[1px] bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity">
                  [RESET]
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-nexus-bg/30 border border-nexus-border rounded-[4px]">
                <span className="text-nexus-ink font-bold text-[10px] tracking-tight">Hardware_Relay</span>
                <Switch active={securityStates.biometrics} onClick={() => toggleSwitch("biometrics")} />
              </div>
              <div className="flex items-center justify-between p-3 bg-nexus-bg/30 border border-nexus-border rounded-[4px]">
                <span className="text-nexus-ink font-bold text-[10px] tracking-tight">Interface_Masking</span>
                <Switch active={securityStates.privacy} onClick={() => toggleSwitch("privacy")} />
              </div>
              <div className="flex items-center justify-between p-3 bg-nexus-bg/10 border border-nexus-accent-cyan/20 rounded-[4px]">
                <div className="flex flex-col">
                  <span className="text-nexus-ink font-bold text-[10px] tracking-tight">Distributed_IP_Masking</span>
                  <span className="text-[7px] text-nexus-accent-cyan font-black tracking-[1px] uppercase mt-0.5">ONION_ROUTING_RELAY</span>
                </div>
                <Switch active={securityStates.ipMasking} onClick={() => toggleSwitch("ipMasking")} />
              </div>
              <div className="flex items-center justify-between p-3 bg-nexus-bg/30 border border-nexus-border rounded-[4px]">
                <div className="flex flex-col">
                   <span className="text-nexus-ink font-bold text-[10px] tracking-tight">Developer_Mode</span>
                   <span className="text-nexus-accent-gold text-[7px] font-black tracking-[1px] uppercase">ADVANCED_AUDIT_REQUIRED</span>
                </div>
                <Switch active={isDevMode} onClick={() => setIsDevMode(!isDevMode)} />
              </div>
            </div>

            {/* SEED BACKUP SECTION */}
            <div className="pt-2 border-t border-nexus-border/40">
              <div 
                className="bg-nexus-bg/50 border border-nexus-accent-gold/20 p-3 rounded-[4px] space-y-3"
                role="region"
                aria-label="Sovereign Identity Backup"
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-nexus-accent-gold font-black text-[9px] tracking-tight uppercase leading-none">Sovereign_Recovery_Seed</span>
                    <span className="text-[6px] text-nexus-ink-muted uppercase tracking-[1px] mt-1 font-bold">Manual_Entropic_Backup</span>
                  </div>
                  <button 
                    onClick={handleToggleSeed}
                    className="px-2 py-1 bg-nexus-accent-gold/10 hover:bg-nexus-accent-gold/20 text-nexus-accent-gold border border-nexus-accent-gold/30 rounded-[3px] text-[8px] font-black uppercase tracking-[1px] transition-all"
                  >
                    {showSeed ? "Mask_Seed" : "Reveal_Seed"}
                  </button>
                </div>

                <AnimatePresence>
                  {showSeed && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-2"
                    >
                       <div className="relative">
                          <p className="bg-nexus-surface border border-nexus-accent-gold/30 p-3 rounded-[4px] font-mono text-[13px] text-nexus-accent-gold text-center tracking-[4px] uppercase select-all">
                            {recoverySeed}
                          </p>
                          
                          <AnimatePresence>
                            {seedCopied && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute inset-0 bg-nexus-surface/95 flex flex-col items-center justify-center font-black text-[10px] text-[#10B981] uppercase tracking-[2px] z-10 backdrop-blur-sm"
                              >
                                <span>SECURED_AND_PROTECTED</span>
                                <span className="text-[6px] opacity-60 mt-1">SINGLE-USE_TUNNEL_CLOSED</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <button 
                            onClick={handleCopySeed}
                            className="absolute top-1 right-1 p-1 text-nexus-accent-gold/40 hover:text-nexus-accent-gold z-20"
                            title="Copy to clipboard"
                          >
                            {seedCopied ? <Check size={10} /> : <Copy size={10} />}
                          </button>
                       </div>
                       <p className="text-[7px] text-center text-nexus-ink-muted uppercase leading-relaxed font-bold opacity-70">
                         PROTECTED MODE: RELOAD REQUIRED AFTER USE. MASKING IN 60s WITHOUT ACTION.
                       </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showSeed && (
                  <div className="flex items-center space-x-2 py-1 px-2 bg-nexus-bg border border-nexus-border/50 rounded-[2px]">
                    <Shield size={10} className="text-nexus-accent-gold/40" />
                    <span className="text-[7px] font-mono text-nexus-ink-muted tracking-widest uppercase">Seed_Hidden_By_Policy</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Module B: Node Profile */}
        <div className="space-y-2">
           <div className="flex flex-col px-1">
              <span className="text-nexus-accent-blue font-bold text-[9px] tracking-[2px] uppercase leading-none">Identity_Dossier</span>
           </div>

          <div className="bg-nexus-surface border border-nexus-border shadow-[0_5px_15px_rgba(0,0,0,0.02)] p-4 rounded-[4px] space-y-4">
            <div className="space-y-1.5">
              <span className="text-nexus-ink-muted font-bold text-[8px] uppercase tracking-[1px] block ml-0.5">
                Signal_Alias
              </span>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-full bg-nexus-bg border border-nexus-border py-2 px-3 text-nexus-ink font-bold text-[12px] tracking-tight focus:border-nexus-accent-blue transition-all outline-none rounded-[4px]"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-nexus-ink-muted font-bold text-[8px] uppercase tracking-[1px] block ml-0.5">
                Cognitive_Fragment
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-nexus-bg border border-nexus-border py-2 px-3 text-nexus-ink/80 font-medium text-[11px] leading-relaxed focus:border-nexus-accent-blue transition-all outline-none rounded-[4px] resize-none"
              />
            </div>

            <button
              onClick={() => setShowIdentityCard(true)}
              className="w-full bg-nexus-bg border border-nexus-border p-3 rounded-[4px] flex items-center justify-between cursor-pointer hover:bg-nexus-ink/5 transition-all"
            >
              <div className="flex flex-col text-left">
                <span className="text-nexus-ink-muted font-bold text-[7px] uppercase tracking-[1px] mb-1">
                  Identity_Descriptor
                </span>
                <span className="text-nexus-ink font-bold text-[10px] tracking-widest font-mono">
                  {did.slice(0, 12)}...{did.slice(-8)}
                </span>
              </div>
              <ChevronRight size={14} className="text-nexus-ink-muted" />
            </button>
          </div>
        </div>

        {/* Device Auditing */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline px-1">
             <div className="flex flex-col">
                <span className="text-nexus-accent-blue font-bold text-[9px] tracking-[2px] uppercase leading-none mb-1">Terminals</span>
                <span className="text-nexus-ink-muted text-[7px] font-bold tracking-[1px] uppercase opacity-40">Managed_Node_Cluster</span>
             </div>
             <button 
               onClick={() => setShowSyncModal(true)}
               aria-label="Link a new device via QR or secret"
               className="flex items-center space-x-2 px-3 py-1 bg-nexus-accent-blue/10 border border-nexus-accent-blue/20 rounded-full hover:bg-nexus-accent-blue/20 transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-1 focus:ring-nexus-accent-blue"
             >
                <Plus size={10} className="text-nexus-accent-blue" aria-hidden="true" />
                <span className="text-[8px] font-black tracking-widest text-nexus-accent-blue uppercase">Link_New_Device</span>
             </button>
          </div>

          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {deviceList.map((dev) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.98 }}
                  key={dev.id}
                  className="bg-nexus-surface border border-nexus-border shadow-[0_2px_10px_rgba(0,0,0,0.01)] p-3 flex items-center justify-between rounded-[4px] group"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-[40px] h-[40px] rounded-full bg-nexus-bg border flex items-center justify-center ${dev.isCurrent ? "border-nexus-accent-blue/30 text-nexus-accent-blue" : "border-nexus-border text-nexus-ink-muted opacity-30"}`}
                    >
                      {dev.name.toLowerCase().includes("mac") ||
                      dev.name.toLowerCase().includes("pc") ? (
                        <Square size={14} strokeWidth={2} />
                      ) : (
                        <Activity size={14} strokeWidth={2} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                         <span className={`text-[13px] font-bold tracking-tight ${dev.isCurrent ? 'text-nexus-ink' : 'text-nexus-ink-muted'}`}>
                           {dev.name}
                         </span>
                         {dev.isCurrent && (
                           <span className="text-nexus-accent-blue font-bold text-[6px] tracking-[1px] uppercase bg-nexus-accent-blue/5 px-1 rounded-full">LOCAL</span>
                         )}
                      </div>
                      <span className="text-[7px] font-bold text-nexus-ink-muted opacity-40 uppercase font-mono">
                        {dev.ip} • {dev.lastSeen.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {dev.isCurrent ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-nexus-accent-blue" />
                    ) : (
                      <button
                        onClick={() => setRevocationTarget(dev)}
                        className="p-2 text-nexus-ink-muted opacity-30 hover:text-red-500 hover:opacity-100 transition-all bg-transparent border-none cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sync Device Modal */}
        <AnimatePresence>
          {showSyncModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[600] flex items-center justify-center p-6"
            >
               <div className="absolute inset-0 bg-nexus-bg/60 backdrop-blur-3xl" onClick={() => !isSyncing && setShowSyncModal(false)} />
               <motion.div 
                 role="dialog"
                 aria-modal="true"
                 aria-labelledby="sync-modal-title"
                 initial={{ scale: 0.9, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.9, y: 20 }}
                 className="relative w-full max-w-sm bg-nexus-surface border border-nexus-border rounded-xl shadow-2xl overflow-hidden"
               >
                  <div className="p-4 border-b border-nexus-border flex justify-between items-center bg-nexus-bg/30">
                    <div className="flex items-center space-x-2">
                      <QrCode size={16} className="text-nexus-accent-blue" aria-hidden="true" />
                      <span id="sync-modal-title" className="text-[10px] font-black uppercase tracking-[3px]">Authorization_Link</span>
                    </div>
                    {!isSyncing && (
                      <button 
                        onClick={() => setShowSyncModal(false)} 
                        aria-label="Close synchronization modal"
                        className="text-nexus-ink-muted hover:text-nexus-ink transition-colors focus:outline-none focus:text-nexus-accent-blue"
                      >
                         <Plus size={16} className="rotate-45" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* Mode Selector Tabs */}
                  <div role="tablist" className="flex p-1 bg-nexus-bg border-b border-nexus-border">
                    <button 
                      role="tab"
                      aria-selected={syncPhase === 'DISPLAY'}
                      aria-controls="sync-panel-display"
                      id="tab-display"
                      onClick={() => setSyncPhase('DISPLAY')}
                      className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-[4px] focus:outline-none focus:ring-1 focus:ring-nexus-accent-blue ${syncPhase === 'DISPLAY' ? 'bg-nexus-surface text-nexus-accent-blue shadow-sm' : 'text-nexus-ink-muted opacity-50 hover:opacity-100'}`}
                    >
                      Show_Access_QR
                    </button>
                    <button 
                      role="tab"
                      aria-selected={syncPhase === 'INPUT'}
                      aria-controls="sync-panel-input"
                      id="tab-input"
                      onClick={() => setSyncPhase('INPUT')}
                      className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-[4px] focus:outline-none focus:ring-1 focus:ring-nexus-accent-blue ${syncPhase === 'INPUT' ? 'bg-nexus-surface text-nexus-accent-blue shadow-sm' : 'text-nexus-ink-muted opacity-50 hover:opacity-100'}`}
                    >
                      Scan_Or_Input
                    </button>
                  </div>

                  <div className="p-8 flex flex-col items-center space-y-6">
                    {syncSuccess ? (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center py-4 space-y-4 text-center"
                      >
                         <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mb-2">
                           <ShieldCheck size={32} className="text-[#10B981]" />
                         </div>
                         <div className="space-y-1">
                            <h3 className="text-nexus-ink font-black text-sm uppercase tracking-[2px]">Nexus_Sync_Complete</h3>
                            <p className="text-[10px] text-nexus-ink-muted uppercase tracking-tight">Handshake verification successful. New node integrated into the cluster.</p>
                         </div>
                      </motion.div>
                    ) : syncPhase === 'DISPLAY' ? (
                      <div 
                        role="tabpanel" 
                        id="sync-panel-display" 
                        aria-labelledby="tab-display"
                        className="flex flex-col items-center space-y-6"
                      >
                        <div className="p-4 bg-white rounded-lg relative group">
                           <div className="absolute inset-0 border-[2px] border-nexus-accent-blue/20 rounded-lg animate-pulse" />
                           <QrCode size={160} className="text-black" aria-label="Authorization QR Code" />
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90">
                              <span className="text-[9px] font-black text-nexus-accent-blue tracking-tighter uppercase text-center px-4">
                                Handshake_Protocol_Active<br />
                                <span className="text-[8px] opacity-60">Expires in 02:45</span>
                              </span>
                           </div>
                        </div>

                        <div className="text-center space-y-2">
                           <h3 className="text-xs font-black uppercase tracking-[2px]">Propagate_Sovereignty</h3>
                           <p className="text-[10px] text-nexus-ink-muted max-w-[220px] leading-relaxed mx-auto">
                             Scan this code from your new terminal to clone your identity shards securely.
                           </p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        role="tabpanel" 
                        id="sync-panel-input" 
                        aria-labelledby="tab-input"
                        className="w-full space-y-6"
                      >
                        <div className="w-full space-y-4">
                           <div 
                             id="nexus-qr-reader" 
                             className={`w-full overflow-hidden rounded-xl border-2 ${isScanning ? 'border-nexus-accent-blue shadow-[0_0_20px_rgba(0,229,255,0.2)]' : 'border-dashed border-nexus-border bg-nexus-bg/50'} relative transition-all`}
                             style={{ minHeight: isScanning ? '300px' : '160px' }}
                           >
                             {!isScanning && !isSyncing && (
                               <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                 <Radar size={24} className="text-nexus-ink-muted mb-2" />
                                 <button 
                                   onClick={startScanner}
                                   className="px-4 py-2 bg-nexus-accent-blue/10 border border-nexus-accent-blue/40 text-nexus-accent-blue text-[8px] font-black uppercase tracking-[2px] rounded-sm hover:bg-nexus-accent-blue/20 transition-all"
                                 >
                                   INITIALIZE_Ocular_SCAN
                                 </button>
                               </div>
                             )}

                             {isScanning && (
                               <button 
                                 onClick={stopScanner}
                                 className="absolute top-2 right-2 z-20 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-all"
                               >
                                 <Plus size={14} className="rotate-45" />
                               </button>
                             )}

                             {isSyncing && (
                               <div className="absolute inset-0 bg-nexus-surface/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                 <RefreshCw size={24} className="text-nexus-accent-blue animate-spin mb-2" />
                                 <span className="text-[8px] font-black text-nexus-accent-blue uppercase tracking-widest animate-pulse">Establishing_secure_handshake...</span>
                               </div>
                             )}
                           </div>
                        </div>

                        <div className="relative flex items-center justify-center">
                           <div className="absolute inset-x-0 h-px bg-nexus-border" />
                           <span className="relative px-3 bg-nexus-surface text-[8px] font-bold text-nexus-ink-muted uppercase tracking-widest">OR</span>
                        </div>

                        <div className="space-y-3">
                           <div className="space-y-1.5">
                              <label htmlFor="shared-secret-input" className="text-[8px] font-bold tracking-[2px] uppercase text-nexus-ink-muted opacity-60">Shared_Secret_Shard</label>
                              <div className="relative flex items-center">
                                <Key size={12} className="absolute left-3 text-nexus-ink-muted/40" aria-hidden="true" />
                                <input 
                                  id="shared-secret-input"
                                  value={sharedSecret}
                                  onChange={(e) => setSharedSecret(e.target.value.toUpperCase())}
                                  placeholder="XXXX-XXXX-XXXX"
                                  className="w-full bg-nexus-bg border border-nexus-border rounded-[4px] py-2 pl-9 pr-4 text-[11px] text-nexus-ink placeholder:text-nexus-ink-muted focus:border-nexus-accent-blue outline-none transition-colors font-mono tracking-widest uppercase"
                                />
                              </div>
                           </div>
                           
                           <button 
                             disabled={!sharedSecret || isSyncing}
                             onClick={() => handleSyncExecution("MANUAL_NODE_" + sharedSecret.slice(0, 4))}
                             className="w-full py-2.5 bg-nexus-accent-blue text-white rounded-[4px] font-black text-[10px] tracking-[3px] uppercase flex items-center justify-center space-x-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-nexus-accent-blue focus:ring-offset-2 focus:ring-offset-nexus-surface"
                           >
                             {isSyncing ? <RefreshCw size={14} className="animate-spin" aria-hidden="true" /> : <span>Bridge_Connection</span>}
                           </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 px-4 py-2 bg-nexus-accent-gold/10 border border-nexus-accent-gold/20 rounded-sm">
                       <Shield size={10} className="text-nexus-accent-gold" aria-hidden="true" />
                       <span className="text-[8px] font-black text-nexus-accent-gold uppercase tracking-widest">E2EE_Relay_Active</span>
                    </div>
                  </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Revocation Confirmation Modal */}
        <AnimatePresence>
          {revocationTarget && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            >
               <motion.div 
                 initial={{ scale: 0.95, y: 10 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.95, y: 10 }}
                 className="w-full max-w-[300px] bg-nexus-surface border border-red-500/30 rounded-lg p-6 space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.15)]"
               >
                  <div className="flex flex-col items-center text-center space-y-3">
                     <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                        <ShieldAlert size={24} className="text-red-500" />
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-nexus-ink font-black text-xs uppercase tracking-[2px]">Revoke_Authorization?</h3>
                        <p className="text-[9px] text-nexus-ink-muted leading-relaxed uppercase tracking-tight">
                           You are about to sever the trust link with <span className="text-nexus-ink font-bold">{revocationTarget.name}</span>. This node will lose all identity shards and access instantly.
                        </p>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <button 
                       onClick={() => {
                         setDeviceList(prev => prev.filter(d => d.id !== revocationTarget.id));
                         setRevocationTarget(null);
                       }}
                       className="w-full py-3 bg-red-500 text-white font-black text-[10px] tracking-[3px] uppercase rounded-[4px] active:scale-[0.98] transition-all"
                     >
                        Confirm_Revocation
                     </button>
                     <button 
                       onClick={() => setRevocationTarget(null)}
                       className="w-full py-3 bg-nexus-bg text-nexus-ink-muted font-black text-[10px] tracking-[3px] uppercase rounded-[4px] border border-nexus-border active:scale-[0.98] transition-all"
                     >
                        Cancel
                     </button>
                  </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Module: Advanced Technical Audit (Dev Mode Only) */}
        <AnimatePresence>
          {isDevMode && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="flex justify-between items-baseline px-1 pt-4 border-t border-nexus-accent-gold/20">
                <div className="flex flex-col">
                  <span className="text-nexus-accent-gold font-black text-[10px] tracking-[4px] uppercase leading-none mb-1">NETWORK_CORE_DIAGNOSTICS</span>
                  <span className="text-nexus-ink-muted text-[7px] font-bold uppercase tracking-widest opacity-40">DIRECT_P2P_MESH_INSPECTION</span>
                </div>
                <div className="flex items-center space-x-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-nexus-accent-gold animate-pulse" />
                   <span className="text-nexus-accent-gold text-[8px] font-black tracking-widest uppercase">REAL_TIME_LINK_ACTIVE</span>
                </div>
              </div>

              <div className="bg-nexus-surface border border-nexus-accent-gold/20 shadow-[0_10px_40px_rgba(212,175,55,0.06)] p-4 rounded-[4px] space-y-6">
                
                {/* Connection Health Grid (High-Fidelity) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-nexus-bg/50 p-3 border border-nexus-border/50 rounded-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-nexus-ink-muted opacity-40 font-bold text-[7px] uppercase tracking-[1px]">LATENCY_JITTER</span>
                      <Activity size={8} className="text-nexus-accent-gold" />
                    </div>
                    <div className="flex items-baseline space-x-1 mb-2">
                      <span className="text-nexus-ink font-mono text-[14px] font-black">{(Math.random() * 1.5 + 0.2).toFixed(2)}</span>
                      <span className="text-nexus-ink-muted opacity-30 text-[8px] uppercase font-bold">ms</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                       <motion.div 
                         animate={{ width: `${Math.random() * 40 + 10}%` }} 
                         className="h-full bg-nexus-accent-gold/60"
                       />
                    </div>
                  </div>
                  <div className="bg-nexus-bg/50 p-3 border border-nexus-border/50 rounded-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-nexus-ink-muted opacity-40 font-bold text-[7px] uppercase tracking-[1px]">PKT_LOSS_RATE</span>
                      <Zap size={8} className="text-nexus-accent-cyan" />
                    </div>
                    <div className="flex items-baseline space-x-1 mb-2">
                      <span className="text-nexus-ink font-mono text-[14px] font-black">0.00001</span>
                      <span className="text-nexus-ink-muted opacity-30 text-[8px] uppercase font-bold">%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: "2%" }}
                         className="h-full bg-nexus-accent-cyan/60"
                       />
                    </div>
                  </div>
                </div>

                {/* ICE Candidate Subsystem (Enhanced) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe size={11} className="text-nexus-accent-gold" />
                      <span className="text-nexus-ink font-black text-[9px] uppercase tracking-[2px]">ICE_NEGOTIATION_FEED</span>
                    </div>
                    <div className="px-2 py-0.5 border border-nexus-accent-gold/30 rounded-full">
                       <span className="text-nexus-accent-gold text-[7px] font-black uppercase tracking-widest">STRAT: P2P_OPTIMIZED</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1.5">
                    {iceCandidates.map((c, i) => {
                      const isRelay = c.includes('TURN') || c.includes('relay');
                      return (
                        <div key={i} className={`flex items-center justify-between p-2 rounded-sm border ${i === 0 ? 'bg-nexus-accent-gold/5 border-nexus-accent-gold/30' : 'bg-black/20 border-nexus-border/40'} font-mono text-[9px] group transition-colors`}>
                           <div className="flex items-center space-x-3 overflow-hidden">
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i === 0 ? 'bg-nexus-accent-gold shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'bg-nexus-ink-muted opacity-30'}`} />
                              <span className={`truncate ${i === 0 ? 'text-nexus-accent-gold' : 'text-nexus-ink-muted opacity-60 group-hover:opacity-100'}`}>{c}</span>
                           </div>
                           <span className={`text-[7px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-[1px] ml-4 ${isRelay ? 'bg-nexus-accent-gold/20 text-nexus-accent-gold' : 'bg-nexus-accent-blue/20 text-nexus-accent-blue'}`}>
                              {isRelay ? 'RELAY' : 'HOST'}
                           </span>
                        </div>
                      );
                    })}
                    {iceCandidates.length === 0 && (
                      <div className="py-4 border border-dashed border-nexus-border/40 rounded-sm flex items-center justify-center">
                         <span className="text-nexus-ink-muted opacity-20 text-[8px] font-black tracking-widest uppercase italic">SYNCHRONIZING_ICE_AGENT...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Data Streams (Graphing) */}
                <div className="space-y-2">
                   <div className="flex items-center space-x-2">
                      <Activity size={11} className="text-nexus-accent-gold" />
                      <span className="text-nexus-ink font-black text-[9px] uppercase tracking-[2px]">ADAPTIVE_BITRATE_TELEMETRY</span>
                   </div>
                   <div className="h-40 w-full bg-black/60 rounded-sm border border-nexus-border/50 p-2 overflow-hidden relative group">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:100px_100px] opacity-5 pointer-events-none" />
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={bandwidthData}>
                           <defs>
                              <linearGradient id="diagInbound" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={"var(--nexus-accent-gold)"} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={"var(--nexus-accent-gold)"} stopOpacity={0} />
                              </linearGradient>
                           </defs>
                           <XAxis dataKey="time" hide />
                           <YAxis hide />
                           <Area
                              type="monotone"
                              dataKey="inbound"
                              stroke="var(--nexus-accent-gold)"
                              strokeWidth={2}
                              fill="url(#diagInbound)"
                              isAnimationActive={false}
                           />
                           <Area
                              type="step"
                              dataKey="lag"
                              stroke="var(--nexus-accent-cyan)"
                              strokeWidth={1}
                              fill="none"
                              strokeDasharray="3 3"
                              isAnimationActive={false}
                           />
                        </AreaChart>
                      </ResponsiveContainer>
                      
                      {/* Diagnostic Overlay Labels */}
                      <div className="absolute top-3 left-3 flex flex-col space-y-1 pointer-events-none">
                         <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-[1px] bg-nexus-accent-gold" />
                            <span className="text-[7px] font-black text-nexus-accent-gold/80 uppercase tracking-widest">BW_SATURATION</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <div className="w-2 h-[1px] border-t border-dashed border-nexus-accent-cyan" />
                            <span className="text-[7px] font-black text-nexus-accent-cyan/80 uppercase tracking-widest">JITTER_PHASE</span>
                         </div>
                      </div>

                      <div className="absolute bottom-3 right-3 flex items-center space-x-3 pointer-events-none">
                         <div className="flex flex-col items-end">
                            <span className="text-nexus-ink-muted opacity-30 text-[6px] font-bold uppercase tracking-widest">LINK_UPTIME</span>
                            <span className="text-nexus-ink font-mono text-[9px] font-black">{formatTime(bandwidthData.length)}</span>
                         </div>
                         <div className="w-[1px] h-6 bg-nexus-border/50" />
                         <div className="flex flex-col items-end">
                            <span className="text-nexus-ink-muted opacity-30 text-[6px] font-bold uppercase tracking-widest">SAMPLE_SET</span>
                            <span className="text-nexus-ink font-mono text-[9px] font-black">{bandwidthData.length}P</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Expanded Telemetry Registry */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Terminal size={11} className="text-nexus-accent-gold" />
                    <span className="text-nexus-ink font-black text-[9px] uppercase tracking-[2px]">RAW_PACKET_AUDIT_STREAM</span>
                  </div>
                  <div className="bg-black/80 p-4 rounded-sm border border-nexus-border/50 font-mono text-[8px] h-48 overflow-y-auto scrollbar-hide space-y-1.5 relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-nexus-accent-gold/20 to-transparent" />
                    {trafficLogs.map((log, i) => (
                      <div key={i} className="flex space-x-3 group border-b border-white/[0.02] pb-1 cursor-default hover:bg-white/[0.02] transition-colors leading-relaxed">
                         <span className="text-nexus-accent-gold opacity-40 shrink-0 font-black">[{trafficLogs.length - i}]</span>
                         <span className="text-nexus-ink/90 tracking-tight break-all border-l border-nexus-accent-gold/10 pl-3">{log}</span>
                      </div>
                    ))}
                    {trafficLogs.length === 0 && (
                      <div className="flex items-center justify-center h-full">
                         <span className="text-nexus-ink-muted opacity-20 italic animate-pulse">BOOTING_CORE_LOGGER...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Module C: System Actions */}
        <div className="pt-4 pb-12 border-t border-nexus-border">
          <button
            className="w-full h-11 bg-red-500/5 border border-red-500/10 flex items-center justify-center space-x-3 hover:bg-red-500/10 transition-all cursor-pointer rounded-[4px]"
            onClick={() => console.log("VAULT_PURGE")}
          >
            <Trash2 size={12} className="text-red-500" />
            <span className="text-red-500 font-black text-[9px] uppercase tracking-[2px]">WIPE_LOCAL_VAULT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

function Switch({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-5 rounded-[1px] relative transition-all duration-300 border border-white/10 cursor-pointer ${active ? "bg-nexus-accent-blue/20" : "bg-white/5"}`}
    >
      <motion.div
        animate={{ x: active ? 22 : 2 }}
        className={`w-3 h-3 rounded-[1px] absolute top-1 transition-all ${active ? "bg-nexus-accent-blue" : "bg-white/20"}`}
      />
    </button>
  );
}

function GeometricAvatarPreview({ seed }: { seed: string }) {
  const hash = seed
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pattern = hash % 4;

  return (
    <div className="w-8 h-8 relative opacity-80">
      {pattern === 0 && (
        <div className="absolute inset-1 border-2 border-nexus-accent-gold rotate-45" />
      )}
      {pattern === 1 && (
        <div className="absolute inset-2 bg-nexus-accent-gold opacity-60 rounded-sm" />
      )}
      {pattern === 2 && (
        <>
          <div className="absolute inset-x-0 h-[1px] top-1/2 bg-nexus-accent-gold" />
          <div className="absolute inset-y-0 w-[1px] left-1/2 bg-nexus-accent-gold" />
        </>
      )}
      {pattern === 3 && (
        <div className="absolute inset-0 border border-nexus-accent-gold rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-nexus-accent-gold" />
        </div>
      )}
    </div>
  );
}
