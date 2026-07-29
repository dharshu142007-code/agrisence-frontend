import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

/** Floating leaves + pollen particles for the landing hero background. */
export function ParticleField({ count = 14 }: { count?: number }) {
  const reduce = useReducedMotion();
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 8 + Math.random() * 18,
        delay: Math.random() * 4,
        duration: 8 + Math.random() * 10,
        kind: i % 3,
      })),
    [count],
  );

  if (reduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it) => (
        <motion.div
          key={it.id}
          className="absolute"
          style={{ left: `${it.x}%`, top: `${it.y}%` }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.7, 0.7, 0],
            y: [0, -120, -240],
            x: [0, 30, -20, 15],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: it.duration,
            delay: it.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {it.kind === 0 ? (
            <svg width={it.size} height={it.size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2 C 20 6, 22 14, 12 22 C 2 14, 4 6, 12 2 Z"
                fill="var(--color-primary-glow)"
                opacity="0.7"
              />
            </svg>
          ) : it.kind === 1 ? (
            <div
              style={{ width: it.size / 2, height: it.size / 2 }}
              className="rounded-full bg-[color:var(--color-sun)] opacity-60 blur-[1px]"
            />
          ) : (
            <div
              style={{ width: it.size / 3, height: it.size / 3 }}
              className="rounded-full bg-[color:var(--color-primary)] opacity-70"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
