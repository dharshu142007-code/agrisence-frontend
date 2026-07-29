import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type GlassCardProps = HTMLMotionProps<"div"> & { hoverable?: boolean };

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverable, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={hoverable ? { y: -6, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cn(
        "glass rounded-3xl p-6",
        hoverable && "cursor-pointer hover:shadow-elevated",
        className,
      )}
      {...props}
    />
  ),
);
GlassCard.displayName = "GlassCard";
