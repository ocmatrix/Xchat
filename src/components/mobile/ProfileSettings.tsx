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
    <div className="flex-1 bg-[#F2F2F7] dark:bg-black overflow-y-auto scrollbar-hide h-full flex flex-col relative font-sans text-black dark:text-white">
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

      <div className="px-4 pt-4 pb-24 space-y-6">
        {/* Module 0: Network Vitals Dashboard */}
        <div className="space-y-2">
           <div className="flex items-center justify-between px-4">
              <div className="flex flex-col">
                <span className="text-[#8E8E93] text-xs font-normal">Vitals Dashboard</span>
              </div>
           </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] space-y-2 relative overflow-hidden group">
            <div className="flex items-center justify-between p-4">
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
                       <span className="text-black dark:text-white text-xl font-medium">
                         {Math.round(Number(latestStats.integrity))}
                       </span>
                    </div>
                </div>
              </div>
              <div className="flex-1 ml-4 space-y-2">
                <div className="flex justify-between items-baseline border-b border-black/5 dark:border-white/5 pb-2">
                  <span className="text-black dark:text-white text-[15px] font-normal leading-none max-w-[80px] shrink-0 truncate mr-2">In Stream</span>
                  <div className="flex space-x-1 shrink-0 bg-transparent py-0 h-auto">
                    <span className="text-[#8E8E93] font-normal text-[15px] leading-none shrink-0 truncate max-w-[120px] text-right block">{latestStats.inbound}</span>
                  </div>
                </div>
                <div className="flex justify-between items-baseline border-b border-black/5 dark:border-white/5 pb-2">
                  <span className="text-black dark:text-white text-[15px] font-normal leading-none max-w-[80px] shrink-0 truncate mr-2">Out Diff</span>
                  <div className="flex space-x-1 shrink-0 bg-transparent py-0 h-auto">
                    <span className="text-[#8E8E93] font-normal text-[15px] leading-none shrink-0 truncate max-w-[120px] text-right block">{latestStats.outbound}</span>
                  </div>
                </div>
                <div className="flex justify-between items-baseline pb-1">
                  <span className="text-black dark:text-white text-[15px] font-normal leading-none max-w-[80px] shrink-0 truncate mr-2">Latency</span>
                  <div className="flex space-x-1 shrink-0 bg-transparent py-0 h-auto">
                    <span className="text-[#8E8E93] font-normal text-[15px] leading-none shrink-0 truncate max-w-[120px] text-right block">{latestStats.lag} ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Meter HUD */}
            <div className="pt-2 px-4 border-t border-black/5 dark:border-white/5 pb-2">
              <div className="flex items-center justify-between mb-1.5">
                 <span className="text-black dark:text-white text-[15px] font-normal">Health Signature</span>
                 <span className={`text-[15px] font-normal ${latestStats.health.color}`}>
                   {latestStats.health.status}
                 </span>
              </div>
              <div className="relative h-1 w-full bg-[#E5E5EA] dark:bg-[#39393D] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${latestStats.health.score}%` }}
                  className={`h-full ${latestStats.health.status === "STABLE" ? "bg-[#34C759]" : latestStats.health.status === "DEGRADED" ? "bg-[#FF9500]" : "bg-[#FF3B30]"}`}
                />
              </div>
            </div>

            {/* Premium Multi-Metric Telemetry Chart */}
            <div className="h-32 w-full p-2 overflow-hidden relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bandwidthData}>
                  <defs>
                    <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={"#007AFF"} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={"#007AFF"} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={"#34C759"} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={"#34C759"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  
                  <Tooltip 
                    content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                         return (
                           <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md border border-black/10 dark:border-white/10 p-2 rounded-xl shadow-lg z-[1000] min-w-[100px]">
                             <div className="text-xs font-normal text-[#8E8E93] mb-1.5 border-b border-black/5 dark:border-white/5 pb-1">
                               {payload[0].payload.time}
                             </div>
                             <div className="space-y-1">
                               {payload.map((p: any) => (
                                 <div key={p.name} className="flex items-center justify-between space-x-3">
                                   <div className="flex items-center space-x-1.5">
                                     <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.stroke }} />
                                     <span className="text-xs font-normal" style={{ color: p.stroke }}>{p.name}</span>
                                   </div>
                                   <span className="text-xs font-medium text-black dark:text-white">
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
                    stroke={"#FF9500"}
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    fill="none"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Tactical Legend Overlay */}
              <div className="absolute top-2 right-4 flex flex-col space-y-1 pointer-events-none">
                 <div className="flex items-center space-x-1.5 justify-end">
                    <span className="text-[9px] font-medium text-[#007AFF]">IN_STREAM</span>
                    <div className="w-2 h-[1px] bg-[#007AFF]" />
                 </div>
                 <div className="flex items-center space-x-1.5 justify-end">
                    <span className="text-[9px] font-medium text-[#34C759]">OUT_DIFF</span>
                    <div className="w-2 h-[1px] bg-[#34C759]" />
                 </div>
                 <div className="flex items-center space-x-1.5 justify-end">
                    <span className="text-[9px] font-medium text-[#10B981]">INTEGRITY</span>
                    <div className="w-2 h-[1px] bg-[#10B981]" />
                 </div>
                 <div className="flex items-center space-x-1.5 justify-end">
                    <span className="text-[9px] font-medium text-[#FF9500]">LATENCY</span>
                    <div className="w-2 h-[1px] bg-[#FF9500] border-t border-dashed border-[#FF9500]" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module X: Nexus Minting Subsystem */}
        <div className="space-y-2">
           <div className="flex items-center justify-between px-4">
              <div className="flex flex-col">
                <span className="text-[#8E8E93] text-xs font-normal">Minting Subsystem</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isMining ? "bg-[#34C759]" : "bg-[#8E8E93]"}`} />
                <span className={`text-[10px] font-medium ${isMining ? "text-[#34C759]" : "text-[#8E8E93]"}`}>
                  {isMining ? "ACTIVE" : "DORMANT"}
                </span>
              </div>
           </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px]">
              <span className="text-[#8E8E93] font-normal text-xs mb-1 block">
                Daily Yield
              </span>
              <div className="flex items-baseline space-x-1.5 leading-none mt-1">
                <span className="text-black dark:text-white text-xl font-medium">
                  128.42
                </span>
                <span className="text-[#8E8E93] font-normal text-xs">
                  NXS
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px]">
              <span className="text-[#8E8E93] font-normal text-xs mb-1 block">
                Mesh Trust
              </span>
              <div className="flex items-baseline space-x-1.5 leading-none mt-1">
                <span className="text-black dark:text-white text-xl font-medium">
                  0.92
                </span>
                <span className="text-[#8E8E93] font-normal text-xs">
                  P_SIG
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px]">
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex flex-col">
                <span className="text-black dark:text-white font-normal text-[15px]">
                  Efficiency Profile
                </span>
              </div>
              <Switch
                active={isMining}
                onClick={() => setIsMining(!isMining)}
              />
            </div>

            <div className="flex space-x-1 p-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-md">
              {(["ECO", "BALANCE", "PERFORMANCE"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPowerProfile(p)}
                  className={`flex-1 py-1.5 font-medium text-xs rounded transition-all cursor-pointer ${powerProfile === p ? "bg-white dark:bg-[#3A3A3C] text-black dark:text-white shadow-sm" : "bg-transparent text-[#8E8E93]"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Module A: Security & Biometrics */}
        <div className="space-y-2">
           <div className="flex flex-col px-4">
              <span className="text-[#8E8E93] text-xs font-normal">Security Layer</span>
           </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] overflow-hidden">
            {/* Vault Password */}
            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 bg-transparent">
              <div className="flex items-center space-x-3">
                 <div className="w-7 h-7 rounded-md bg-[#007AFF]/10 flex items-center justify-center">
                   <Lock size={14} className="text-[#007AFF]" />
                 </div>
                 <span className="text-black dark:text-white font-normal text-[15px]">Vault Key</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#8E8E93] font-normal text-[15px]">✱✱✱✱✱✱✱✱</span>
                <ChevronRight size={16} className="text-[#8E8E93]/50" />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 bg-transparent">
              <span className="text-black dark:text-white font-normal text-[15px]">Hardware Relay</span>
              <Switch active={securityStates.biometrics} onClick={() => toggleSwitch("biometrics")} />
            </div>
            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 bg-transparent">
              <span className="text-black dark:text-white font-normal text-[15px]">Interface Masking</span>
              <Switch active={securityStates.privacy} onClick={() => toggleSwitch("privacy")} />
            </div>
            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 bg-transparent">
              <div className="flex flex-col">
                <span className="text-black dark:text-white font-normal text-[15px]">Distributed IP Masking</span>
              </div>
              <Switch active={securityStates.ipMasking} onClick={() => toggleSwitch("ipMasking")} />
            </div>
            <div className="flex items-center justify-between p-4 bg-transparent border-b border-black/5 dark:border-white/5">
              <div className="flex flex-col">
                 <span className="text-black dark:text-white font-normal text-[15px]">Developer Mode</span>
              </div>
              <Switch active={isDevMode} onClick={() => setIsDevMode(!isDevMode)} />
            </div>

            {/* SEED BACKUP SECTION */}
            <div className="flex flex-col p-4 bg-transparent" role="region" aria-label="Sovereign Identity Backup">
              <div className="flex justify-between items-center mb-2">
                <div className="flex flex-col">
                  <span className="text-black dark:text-white font-normal text-[15px]">Recovery Seed</span>
                </div>
                <button 
                  onClick={handleToggleSeed}
                  className="text-[#007AFF] text-[15px] font-normal bg-transparent border-none cursor-pointer"
                >
                  {showSeed ? "Mask" : "Reveal"}
                </button>
              </div>

              <AnimatePresence>
                {showSeed && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2 mt-2"
                  >
                     <div className="relative">
                        <p className="bg-[#F2F2F7] dark:bg-[#3A3A3C] p-3 rounded-lg text-black dark:text-white text-center text-sm font-medium tracking-widest select-all">
                          {recoverySeed}
                        </p>
                        
                        <AnimatePresence>
                          {seedCopied && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute inset-0 bg-white/95 dark:bg-[#1C1C1E]/95 flex flex-col items-center justify-center font-medium text-xs text-[#34C759] z-10 backdrop-blur-sm rounded-lg"
                            >
                              <span>Secured</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button 
                          onClick={handleCopySeed}
                          className="absolute top-1 right-1 p-2 text-[#8E8E93] hover:text-black dark:hover:text-white z-20 transition-colors"
                          title="Copy to clipboard"
                        >
                          {seedCopied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                     </div>
                     <p className="text-xs text-center text-[#8E8E93] font-normal px-2">
                       Masking in 60s without action.
                     </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Module B: Node Profile */}
        <div className="space-y-2">
           <div className="flex flex-col px-4">
              <span className="text-[#8E8E93] text-xs font-normal">Identity Dossier</span>
           </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] overflow-hidden">
            <div className="flex items-center p-4 border-b border-black/5 dark:border-white/5">
              <span className="text-black dark:text-white font-normal text-[15px] w-1/3">
                Alias
              </span>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-2/3 bg-transparent text-[#8E8E93] text-right font-normal text-[15px] outline-none"
              />
            </div>

            <div className="flex items-start p-4 border-b border-black/5 dark:border-white/5">
              <span className="text-black dark:text-white font-normal text-[15px] w-1/3 mt-0.5">
                Bio
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-2/3 bg-transparent text-[#8E8E93] text-right font-normal text-[15px] outline-none resize-none"
              />
            </div>

            <button
              onClick={() => setShowIdentityCard(true)}
              className="w-full bg-transparent p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex flex-col text-left">
                <span className="text-black dark:text-white font-normal text-[15px]">
                  Identity Descriptor
                </span>
                <span className="text-[#8E8E93] font-normal text-xs mt-1">
                  {did.slice(0, 12)}...{did.slice(-8)}
                </span>
              </div>
              <ChevronRight size={16} className="text-[#8E8E93]/50" />
            </button>
          </div>
        </div>

        {/* Device Auditing */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline px-4">
             <div className="flex flex-col">
                <span className="text-[#8E8E93] text-xs font-normal">Terminals</span>
             </div>
             <button 
               onClick={() => setShowSyncModal(true)}
               aria-label="Link a new device via QR or secret"
               className="flex items-center space-x-1.5 px-3 py-1 bg-[#007AFF]/10 rounded-full hover:bg-[#007AFF]/20 transition-colors cursor-pointer"
             >
                <Plus size={12} className="text-[#007AFF]" aria-hidden="true" />
                <span className="text-xs font-medium text-[#007AFF]">Link Device</span>
             </button>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] overflow-hidden">
            <AnimatePresence mode="popLayout">
              {deviceList.map((dev, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.98 }}
                  key={dev.id}
                  className={`flex items-center justify-between p-4 bg-transparent group ${index !== deviceList.length - 1 ? 'border-b border-black/5 dark:border-white/5' : ''}`}
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${dev.isCurrent ? "bg-[#007AFF]/10 text-[#007AFF]" : "bg-[#F2F2F7] dark:bg-[#3A3A3C] text-[#8E8E93]"}`}
                    >
                      {dev.name.toLowerCase().includes("mac") ||
                      dev.name.toLowerCase().includes("pc") ? (
                        <Square size={18} strokeWidth={1.5} />
                      ) : (
                        <Activity size={18} strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 pr-4">
                      <div className="flex items-center space-x-2">
                         <span className={`text-[15px] font-normal truncate ${dev.isCurrent ? 'text-black dark:text-white' : 'text-[#8E8E93]'}`}>
                           {dev.name}
                         </span>
                         {dev.isCurrent && (
                           <span className="text-[#007AFF] font-medium text-[10px] bg-[#007AFF]/10 px-1.5 py-0.5 rounded">LOCAL</span>
                         )}
                      </div>
                      <span className="text-xs font-normal text-[#8E8E93] truncate">
                        {dev.ip} • {dev.lastSeen}
                      </span>
                    </div>

                    <div className="flex items-center justify-end shrink-0 w-8">
                      {dev.isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-[#34C759]" />
                      ) : (
                        <button
                          onClick={() => setRevocationTarget(dev)}
                          className="text-[#FF3B30] hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
                        >
                           Unlink
                        </button>
                      )}
                    </div>
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
              className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/40"
            >
               <div className="absolute inset-0" onClick={() => !isSyncing && setShowSyncModal(false)} />
               <motion.div 
                 role="dialog"
                 aria-modal="true"
                 aria-labelledby="sync-modal-title"
                 initial={{ scale: 0.9, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.9, y: 20 }}
                 className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-xl shadow-2xl overflow-hidden"
               >
                  <div className="p-4 flex justify-between items-center bg-transparent border-b border-black/5 dark:border-white/5">
                    <span id="sync-modal-title" className="text-[15px] font-medium text-black dark:text-white">Authorization Link</span>
                    {!isSyncing && (
                      <button 
                        onClick={() => setShowSyncModal(false)} 
                        aria-label="Close"
                        className="text-[#8E8E93] hover:text-black dark:hover:text-white transition-colors bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-full p-1.5 focus:outline-none"
                      >
                         <Plus size={16} className="rotate-45" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* Mode Selector Tabs */}
                  <div role="tablist" className="flex p-2 bg-[#F2F2F7] dark:bg-[#1C1C1E]">
                    <button 
                      role="tab"
                      aria-selected={syncPhase === 'DISPLAY'}
                      aria-controls="sync-panel-display"
                      id="tab-display"
                      onClick={() => setSyncPhase('DISPLAY')}
                      className={`flex-1 py-1.5 text-sm font-medium transition-all rounded-[7px] focus:outline-none ${syncPhase === 'DISPLAY' ? 'bg-white dark:bg-[#2C2C2E] text-black dark:text-white shadow-sm' : 'text-[#8E8E93]'}`}
                    >
                      Show QR
                    </button>
                    <button 
                      role="tab"
                      aria-selected={syncPhase === 'INPUT'}
                      aria-controls="sync-panel-input"
                      id="tab-input"
                      onClick={() => setSyncPhase('INPUT')}
                      className={`flex-1 py-1.5 text-sm font-medium transition-all rounded-[7px] focus:outline-none ${syncPhase === 'INPUT' ? 'bg-white dark:bg-[#2C2C2E] text-black dark:text-white shadow-sm' : 'text-[#8E8E93]'}`}
                    >
                      Scan/Input
                    </button>
                  </div>

                  <div className="p-6 flex flex-col items-center space-y-6">
                    {syncSuccess ? (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center py-4 space-y-4 text-center"
                      >
                         <div className="w-16 h-16 bg-[#34C759]/10 rounded-full flex items-center justify-center mb-2">
                           <ShieldCheck size={32} className="text-[#34C759]" />
                         </div>
                         <div className="space-y-1">
                            <h3 className="text-black dark:text-white font-medium text-[15px]">Sync Complete</h3>
                            <p className="text-xs text-[#8E8E93]">New terminal linked successfully.</p>
                         </div>
                      </motion.div>
                    ) : syncPhase === 'DISPLAY' ? (
                      <div 
                        role="tabpanel" 
                        id="sync-panel-display" 
                        aria-labelledby="tab-display"
                        className="flex flex-col items-center space-y-6"
                      >
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-black/5 dark:border-white/5 relative group">
                           <QrCode size={160} className="text-black" aria-label="Authorization QR Code" />
                        </div>

                        <div className="text-center space-y-2">
                           <p className="text-sm text-[#8E8E93] max-w-[220px] leading-relaxed mx-auto">
                             Scan this code from your new terminal.
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
                             className={`w-full overflow-hidden rounded-xl border-2 ${isScanning ? 'border-[#007AFF]' : 'border-dashed border-black/20 dark:border-white/20 bg-[#F2F2F7] dark:bg-[#2C2C2E]'} relative transition-all`}
                             style={{ minHeight: isScanning ? '300px' : '160px' }}
                           >
                             {!isScanning && !isSyncing && (
                               <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                 <Radar size={24} className="text-[#8E8E93] mb-3" />
                                 <button 
                                   onClick={startScanner}
                                   className="px-6 py-2 bg-[#007AFF] text-white text-sm font-medium rounded-[8px] hover:bg-[#007AFF]/90 transition-colors"
                                 >
                                   Open Camera
                                 </button>
                               </div>
                             )}

                             {isScanning && (
                               <button 
                                 onClick={stopScanner}
                                 className="absolute top-2 right-2 z-20 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-all"
                               >
                                 <Plus size={16} className="rotate-45" />
                               </button>
                             )}

                             {isSyncing && (
                               <div className="absolute inset-0 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                 <RefreshCw size={24} className="text-[#007AFF] animate-spin mb-3" />
                                 <span className="text-sm font-medium text-[#007AFF]">Connecting...</span>
                               </div>
                             )}
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="space-y-1.5">
                              <label htmlFor="shared-secret-input" className="text-xs font-normal text-[#8E8E93]">Secret Shard</label>
                              <div className="relative flex items-center">
                                <Key size={14} className="absolute left-3 text-[#8E8E93]" aria-hidden="true" />
                                <input 
                                  id="shared-secret-input"
                                  value={sharedSecret}
                                  onChange={(e) => setSharedSecret(e.target.value.toUpperCase())}
                                  placeholder="XXXX-XXXX-XXXX"
                                  className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border-none rounded-[10px] py-3 pl-10 pr-4 text-[15px] text-black dark:text-white placeholder:text-[#8E8E93] focus:ring-2 focus:ring-[#007AFF] outline-none transition-all font-mono"
                                />
                              </div>
                           </div>
                           
                           <button 
                             disabled={!sharedSecret || isSyncing}
                             onClick={() => handleSyncExecution("MANUAL_NODE_" + sharedSecret.slice(0, 4))}
                             className="w-full py-3 bg-[#007AFF] text-white rounded-[10px] font-medium text-[15px] flex items-center justify-center space-x-2 hover:bg-[#007AFF]/90 active:bg-[#007AFF]/80 transition-colors disabled:opacity-50"
                           >
                             {isSyncing ? <RefreshCw size={16} className="animate-spin" aria-hidden="true" /> : <span>Bridge</span>}
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
        {/* Revocation Modal */}
        <AnimatePresence>
          {revocationTarget && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
            >
               <motion.div 
                 initial={{ scale: 0.95, y: 10 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.95, y: 10 }}
                 className="w-full max-w-[300px] bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-xl p-6 space-y-6 shadow-2xl"
               >
                  <div className="flex flex-col items-center text-center space-y-3">
                     <div className="w-12 h-12 bg-[#FF3B30]/10 rounded-full flex items-center justify-center">
                        <ShieldAlert size={24} className="text-[#FF3B30]" />
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-black dark:text-white font-medium text-[15px]">Revoke Authorization?</h3>
                        <p className="text-sm text-[#8E8E93] leading-relaxed">
                           You are about to sever the link with <span className="text-black dark:text-white font-normal">{revocationTarget.name}</span>. This device will lose access immediately.
                        </p>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <button 
                       onClick={() => {
                         setDeviceList(prev => prev.filter(d => d.id !== revocationTarget.id));
                         setRevocationTarget(null);
                       }}
                       className="w-full py-3 bg-[#FF3B30] text-white font-medium text-[15px] rounded-[10px] active:bg-[#FF3B30]/80 transition-colors"
                     >
                        Confirm Revocation
                     </button>
                     <button 
                       onClick={() => setRevocationTarget(null)}
                       className="w-full py-3 bg-transparent text-[#007AFF] font-medium text-[15px] rounded-[10px] active:bg-[#007AFF]/10 transition-colors"
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
              className="space-y-2 overflow-hidden"
            >
              <div className="flex flex-col px-4 pt-2">
                 <span className="text-[#8E8E93] text-xs font-normal">Network Core Diagnostics</span>
              </div>

              <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] overflow-hidden">
                <div className="p-4 space-y-4">
                  {/* Connection Health Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 rounded-xl border border-black/5 dark:border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[#8E8E93] font-normal text-xs">Latency Jitter</span>
                        <Activity size={12} className="text-[#007AFF]" />
                      </div>
                      <div className="flex items-baseline space-x-1 mb-2">
                        <span className="text-black dark:text-white font-medium text-[15px]">{(Math.random() * 1.5 + 0.2).toFixed(2)}</span>
                        <span className="text-[#8E8E93] text-xs">ms</span>
                      </div>
                      <div className="h-1 w-full bg-[#E5E5EA] dark:bg-[#39393D] rounded-full overflow-hidden">
                         <motion.div 
                           animate={{ width: `${Math.random() * 40 + 10}%` }} 
                           className="h-full bg-[#007AFF]"
                         />
                      </div>
                    </div>
                    <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 rounded-xl border border-black/5 dark:border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[#8E8E93] font-normal text-xs">Packet Loss</span>
                        <Zap size={12} className="text-[#34C759]" />
                      </div>
                      <div className="flex items-baseline space-x-1 mb-2">
                        <span className="text-black dark:text-white font-medium text-[15px]">0.00001</span>
                        <span className="text-[#8E8E93] text-xs">%</span>
                      </div>
                      <div className="h-1 w-full bg-[#E5E5EA] dark:bg-[#39393D] rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: "2%" }}
                           className="h-full bg-[#34C759]"
                         />
                      </div>
                    </div>
                  </div>

                  {/* ICE Candidate Subsystem */}
                  <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-black dark:text-white font-medium text-[15px]">ICE Feed</span>
                      <span className="text-[#007AFF] text-[10px] font-medium bg-[#007AFF]/10 px-2 py-0.5 rounded-md">P2P OPTIMIZED</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {iceCandidates.map((c, i) => {
                        const isRelay = c.includes('TURN') || c.includes('relay');
                        return (
                          <div key={i} className={`flex items-center justify-between p-2 rounded-lg border ${i === 0 ? 'bg-white dark:bg-[#3A3A3C] border-black/10 dark:border-white/10' : 'bg-transparent border-black/5 dark:border-white/5'}`}>
                             <div className="flex items-center space-x-2 overflow-hidden">
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i === 0 ? 'bg-[#34C759]' : 'bg-[#8E8E93]'}`} />
                                <span className={`truncate text-xs ${i === 0 ? 'text-black dark:text-white' : 'text-[#8E8E93]'}`}>{c}</span>
                             </div>
                             <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ml-2 shrink-0 ${isRelay ? 'bg-[#FF9500]/10 text-[#FF9500]' : 'bg-[#007AFF]/10 text-[#007AFF]'}`}>
                                {isRelay ? 'RELAY' : 'HOST'}
                             </span>
                          </div>
                        );
                      })}
                      {iceCandidates.length === 0 && (
                        <div className="py-4 border border-dashed border-black/10 dark:border-white/10 rounded-lg flex items-center justify-center">
                           <span className="text-[#8E8E93] text-xs">Synchronizing ICE Agent...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Telemetry Registry */}
                  <div className="space-y-2 pt-4 border-t border-black/5 dark:border-white/5">
                    <span className="text-black dark:text-white font-medium text-[15px]">Packet Audit</span>
                    <div className="bg-[#F2F2F7] dark:bg-[#000000] p-3 rounded-xl border border-black/5 dark:border-white/5 font-mono text-[10px] h-32 overflow-y-auto scrollbar-hide space-y-1.5 relative shadow-inner">
                      {trafficLogs.map((log, i) => (
                        <div key={i} className="flex space-x-2 pr-2">
                           <span className="text-[#8E8E93] shrink-0">[{trafficLogs.length - i}]</span>
                           <span className="text-black dark:text-white tracking-tight break-all">{log}</span>
                        </div>
                      ))}
                      {trafficLogs.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                           <span className="text-[#8E8E93] italic">Booting Core Logger...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Module C: System Actions */}
        <div className="pt-4 pb-12">
          <button
            className="w-full h-12 bg-white dark:bg-[#1C1C1E] flex items-center justify-center space-x-2 active:bg-black/5 dark:active:bg-white/5 transition-colors cursor-pointer rounded-[10px]"
            onClick={() => console.log("VAULT_PURGE")}
          >
            <span className="text-[#FF3B30] font-normal text-[15px]">Wipe Local Vault</span>
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
      className={`w-[51px] h-[31px] rounded-full relative transition-colors duration-300 cursor-pointer ${active ? "bg-[#34C759]" : "bg-[#E5E5EA] dark:bg-[#39393D]"}`}
    >
      <motion.div
        animate={{ x: active ? 22 : 2 }}
        className={`w-[27px] h-[27px] rounded-full absolute top-[2px] shadow-sm transition-transform bg-white`}
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
