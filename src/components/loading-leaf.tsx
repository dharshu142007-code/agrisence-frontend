import { motion } from "framer-motion";

export function LoadingLeaf({ size = 48 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
      aria-hidden
    >
      <motion.path
        d="M32 6 C 50 12, 58 30, 32 58 C 6 30, 14 12, 32 6 Z"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="url(#leafGrad)"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.2 }}
      />
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary-glow)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <motion.line
        x1="32" y1="10" x2="32" y2="54"
        stroke="var(--color-primary-foreground)"
        strokeWidth="1.5" strokeOpacity="0.6"
      />
    </motion.svg>
  );
}
