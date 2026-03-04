import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatCarbonRateGPerS, getIntensityBucket } from "../../shared/carbon";
import {
  DEFAULT_TIMER_STATE,
  DEFAULT_UI_STATE,
  STORAGE_KEYS,
  storageGet,
  storageSet,
  storageSubscribe,
  type BubblePosition,
  type TimerState,
  type UiState
} from "../../shared/storage";
import { formatHhMmSs } from "../../shared/time";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const defaultPosition = (): BubblePosition => {
  const x = window.innerWidth - 18 - 56;
  const y = window.innerHeight - 18 - 56 - 22;
  return { x: clamp(x, 12, window.innerWidth - 56 - 12), y: clamp(y, 12, window.innerHeight - 56 - 12) };
};

export default function EcoBubble() {
  const domain = useMemo(() => window.location.hostname, []);
  const [rate, setRate] = useState(() => formatCarbonRateGPerS(domain));

  const [ui, setUi] = useState<UiState>(DEFAULT_UI_STATE);
  const [timer, setTimer] = useState<TimerState>(DEFAULT_TIMER_STATE);
  const [pos, setPos] = useState<BubblePosition>(() => defaultPosition());
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(
    null
  );

  useEffect(() => {
    void (async () => {
      const stored = await storageGet<{
        [STORAGE_KEYS.uiState]?: UiState;
        [STORAGE_KEYS.timerState]?: TimerState;
        [STORAGE_KEYS.bubblePosition]?: BubblePosition;
      }>({
        [STORAGE_KEYS.uiState]: DEFAULT_UI_STATE,
        [STORAGE_KEYS.timerState]: DEFAULT_TIMER_STATE,
        [STORAGE_KEYS.bubblePosition]: undefined
      });
      setUi(stored[STORAGE_KEYS.uiState] ?? DEFAULT_UI_STATE);
      setTimer(stored[STORAGE_KEYS.timerState] ?? DEFAULT_TIMER_STATE);
      setPos(stored[STORAGE_KEYS.bubblePosition] ?? defaultPosition());
    })();

    return storageSubscribe((changes) => {
      const uiChange = changes[STORAGE_KEYS.uiState];
      if (uiChange) setUi((uiChange.newValue ?? DEFAULT_UI_STATE) as UiState);
      const timerChange = changes[STORAGE_KEYS.timerState];
      if (timerChange) setTimer((timerChange.newValue ?? DEFAULT_TIMER_STATE) as TimerState);
      const posChange = changes[STORAGE_KEYS.bubblePosition];
      if (posChange) setPos(posChange.newValue as BubblePosition);
    });
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setRate(formatCarbonRateGPerS(window.location.hostname)), 1000);
    return () => window.clearInterval(t);
  }, []);

  const intensity = useMemo(() => getIntensityBucket(domain), [domain]);
  const glow = useMemo(() => {
    if (intensity === "streaming") return "rgba(239,68,68,0.55)";
    if (intensity === "high") return "rgba(239,68,68,0.35)";
    if (intensity === "medium") return "rgba(234,179,8,0.35)";
    return "rgba(16,185,129,0.35)";
  }, [intensity]);
  const ring = useMemo(() => {
    if (intensity === "streaming") return "rgba(239,68,68,0.75)";
    if (intensity === "high") return "rgba(239,68,68,0.55)";
    if (intensity === "medium") return "rgba(234,179,8,0.55)";
    return "rgba(16,185,129,0.55)";
  }, [intensity]);

  const sessionSeconds =
    timer.isRunning && timer.startTime ? Math.floor((Date.now() - timer.startTime) / 1000) : 0;

  const togglePanel = async () => {
    const next: UiState = { isPanelOpen: !ui.isPanelOpen };
    await storageSet({ [STORAGE_KEYS.uiState]: next });
  };

  const startSession = async () => {
    const next: TimerState = { startTime: Date.now(), isRunning: true, carbonTotalKg: 0 };
    await storageSet({ [STORAGE_KEYS.timerState]: next });
  };

  const endSession = async () => {
    const next: TimerState = { startTime: null, isRunning: false, carbonTotalKg: 0 };
    await storageSet({ [STORAGE_KEYS.timerState]: next });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, originX: pos.x, originY: pos.y, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragState.current.moved = true;
    const nextPos: BubblePosition = {
      x: clamp(dragState.current.originX + dx, 12, window.innerWidth - 56 - 12),
      y: clamp(dragState.current.originY + dy, 12, window.innerHeight - 56 - 12)
    };
    setPos(nextPos);
  };

  const onPointerUp = async () => {
    const moved = dragState.current?.moved ?? false;
    dragState.current = null;
    await storageSet({ [STORAGE_KEYS.bubblePosition]: pos });
    if (!moved) await togglePanel();
  };

  return (
    <div style={{ position: "fixed", left: pos.x, top: pos.y }}>
      <motion.div
        className="eco-bubble"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => void onPointerUp()}
        animate={
          intensity === "streaming"
            ? { boxShadow: [`0 0 0px ${glow}`, `0 0 26px ${ring}`, `0 0 0px ${glow}`], scale: [1, 1.05, 1] }
            : { boxShadow: `0 0 18px ${glow}` }
        }
        transition={intensity === "streaming" ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" } : { duration: 0.2 }}
      >
        <Globe size={22} color="rgba(226,232,240,0.96)" />
      </motion.div>
      <div className="eco-tag">{rate}</div>

      <AnimatePresence>
        {ui.isPanelOpen ? (
          <motion.div
            className="eco-panel"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            style={{ position: "absolute", right: 0, bottom: 78 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.3 }}>EcoSense</div>
              <button
                type="button"
                onClick={() => void togglePanel()}
                className="eco-btn"
                style={{ width: "auto", padding: "6px 10px", borderRadius: 9999, fontSize: 12 }}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              <div className="eco-stat">
                <div style={{ fontSize: 12, color: "rgba(148,163,184,0.95)" }}>Session Duration</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{formatHhMmSs(sessionSeconds)}</div>
              </div>
              <div className="eco-stat">
                <div style={{ fontSize: 12, color: "rgba(148,163,184,0.95)" }}>Session Carbon</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{(timer.carbonTotalKg ?? 0).toFixed(6)} kgCO2</div>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {!timer.isRunning ? (
                <button type="button" className="eco-btn" onClick={() => void startSession()}>
                  Start Session
                </button>
              ) : (
                <button type="button" className="eco-btn" onClick={() => void endSession()}>
                  End Session
                </button>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

