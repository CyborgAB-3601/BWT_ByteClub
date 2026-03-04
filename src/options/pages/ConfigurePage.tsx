import { useMemo, useState } from "react";
import GlassCard from "../components/GlassCard";
import {
  DEFAULT_USER_CONFIG_V2,
  STORAGE_KEYS,
  storageSet,
  type UserConfigV2
} from "../../shared/storage";
import { useChromeStorageValue } from "../hooks/useChromeStorage";

type Device = { key: string; label: string; watts: number };

const DEVICES: Device[] = [
  { key: "laptop", label: "Laptop", watts: 65 },
  { key: "desktop", label: "Desktop", watts: 250 },
  { key: "monitor", label: "Monitor", watts: 30 },
  { key: "router", label: "Router", watts: 12 }
];

const LIGHTING: Array<{ label: string; watts: number }> = [
  { label: "Natural", watts: 0 },
  { label: "LED", watts: 10 },
  { label: "Incandescent", watts: 60 }
];

const computeTotalWatts = (cfg: UserConfigV2): number => {
  const deviceSum = Object.values(cfg.deviceWatts ?? {}).reduce((a, b) => a + b, 0);
  const climateWatts = (cfg.climateWattsAt100 ?? 0) * (Math.max(0, Math.min(100, cfg.climatePercent ?? 0)) / 100);
  return deviceSum + (cfg.lightingWatts ?? 0) + climateWatts;
};

export default function ConfigurePage() {
  const { value: storedConfig, ready } = useChromeStorageValue<UserConfigV2>(
    STORAGE_KEYS.userConfigV2,
    DEFAULT_USER_CONFIG_V2
  );
  const [localConfig, setLocalConfig] = useState<UserConfigV2>(DEFAULT_USER_CONFIG_V2);

  const config = ready ? storedConfig : localConfig;
  const totalWatts = useMemo(() => computeTotalWatts(config), [config]);

  const setConfig = async (next: UserConfigV2) => {
    setLocalConfig(next);
    await storageSet({ [STORAGE_KEYS.userConfigV2]: next });
  };

  const toggleDevice = async (device: Device) => {
    const deviceWatts = { ...(config.deviceWatts ?? {}) };
    if (deviceWatts[device.key]) delete deviceWatts[device.key];
    else deviceWatts[device.key] = device.watts;
    await setConfig({ ...config, deviceWatts });
  };

  const setLighting = async (watts: number) => {
    await setConfig({ ...config, lightingWatts: watts });
  };

  const setClimatePercent = async (percent: number) => {
    await setConfig({ ...config, climatePercent: percent });
  };

  const setClimateWattsAt100 = async (watts: number) => {
    await setConfig({ ...config, climateWattsAt100: watts });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-300">Setup</div>
        <div className="mt-1 text-2xl font-semibold">Configure</div>
        <div className="mt-1 text-xs text-slate-400">All values default to 0 until you set them.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard>
          <div className="text-sm font-semibold">Total Watts</div>
          <div className="mt-2 text-3xl font-semibold text-eco-mint">{totalWatts.toFixed(0)}W</div>
          <div className="mt-2 text-xs text-slate-400">Sum(Devices) + Lighting + Climate</div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm font-semibold">Lighting</div>
          <div className="mt-2 text-3xl font-semibold text-eco-teal">{(config.lightingWatts ?? 0).toFixed(0)}W</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {LIGHTING.map((l) => {
              const active = (config.lightingWatts ?? 0) === l.watts;
              return (
                <button
                  key={l.label}
                  type="button"
                  onClick={() => void setLighting(l.watts)}
                  className={[
                    "rounded-lg px-3 py-2 text-xs transition",
                    active ? "bg-white/10 text-eco-mint ring-1 ring-white/10" : "bg-black/10 text-slate-200 hover:bg-white/5"
                  ].join(" ")}
                >
                  {l.label} ({l.watts}W)
                </button>
              );
            })}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm font-semibold">Climate</div>
          <div className="mt-2 text-3xl font-semibold">{Math.round(config.climatePercent ?? 0)}%</div>
          <div className="mt-3">
            <input
              type="range"
              min={0}
              max={100}
              value={config.climatePercent ?? 0}
              onChange={(e) => void setClimatePercent(Number(e.target.value))}
              className="w-full accent-eco-mint"
            />
          </div>
          <div className="mt-3">
            <div className="text-xs text-slate-400">Watts at 100% (optional)</div>
            <input
              type="number"
              min={0}
              value={config.climateWattsAt100 ?? 0}
              onChange={(e) => void setClimateWattsAt100(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none ring-0 focus:border-eco-mint"
            />
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="text-sm font-semibold">Devices</div>
        <div className="mt-1 text-xs text-slate-400">Select the devices you’re using right now.</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {DEVICES.map((device) => {
            const active = Boolean(config.deviceWatts?.[device.key]);
            return (
              <button
                key={device.key}
                type="button"
                onClick={() => void toggleDevice(device)}
                className={[
                  "rounded-2xl border p-4 text-left transition",
                  active
                    ? "border-eco-mint/40 bg-white/10 ring-1 ring-eco-mint/30"
                    : "border-white/10 bg-black/10 hover:bg-white/5"
                ].join(" ")}
              >
                <div className="text-sm font-semibold">{device.label}</div>
                <div className="mt-2 text-xs text-slate-400">{device.watts}W</div>
                <div className="mt-3 text-xs">{active ? "Selected" : "Not selected"}</div>
              </button>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
