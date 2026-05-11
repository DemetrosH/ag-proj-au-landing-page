"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "./utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = ({
  children,
  className,
  variant = "primary",
  size = "md",
  onAnimationStart,
  onDragStart,
  onDragEnd,
  onDrag,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-brand-gold text-white hover:bg-brand-orange shadow-md hover:shadow-lg",
    secondary: "bg-brand-charcoal text-white hover:bg-gray-800",
    outline: "border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white",
    ghost: "text-brand-charcoal hover:bg-brand-cream-dark",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base font-medium",
    lg: "px-8 py-4 text-lg font-bold",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
