import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
 "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
 {
 variants: {
 variant: {
 default: "border-gold/30 bg-gold/10 text-gold-light",
 teal: "border-teal/30 bg-teal/10 text-teal-light",
 outline: "border-border bg-card text-muted-foreground",
 destructive: "border-destructive/30 bg-destructive/10 text-red-400",
 },
 },
 defaultVariants: { variant: "default" },
 }
);

export interface BadgeProps
 extends React.HTMLAttributes<HTMLDivElement>,
 VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
 return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
