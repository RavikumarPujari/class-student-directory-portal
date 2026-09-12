import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
 "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
 {
 variants: {
 variant: {
 default:
 "bg-gradient-to-r from-gold to-gold-dark text-navy shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:brightness-110",
 teal:
 "bg-gradient-to-r from-teal to-teal-dark text-navy shadow-lg shadow-teal/20 hover:shadow-teal/30 hover:brightness-110",
 outline:
 "border border-border bg-card text-foreground hover:bg-card hover:border-border",
 ghost: "text-foreground hover:bg-card",
 destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
 link: "text-gold underline-offset-4 hover:underline",
 },
 size: {
 default: "h-11 px-6 py-2",
 sm: "h-9 rounded-lg px-4 text-xs",
 lg: "h-13 rounded-xl px-8 text-base",
 icon: "h-10 w-10",
 },
 },
 defaultVariants: {
 variant: "default",
 size: "default",
 },
 }
);

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
 VariantProps<typeof buttonVariants> {
 asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : "button";
 return (
 <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
 );
 }
);
Button.displayName = "Button";

export { Button, buttonVariants };
