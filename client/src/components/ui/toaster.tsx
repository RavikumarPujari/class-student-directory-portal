import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const icons = {
 default: Info,
 success: CheckCircle2,
 destructive: XCircle,
};

export function Toaster() {
 const { toasts, dismiss } = useToast();

 return (
 <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
 {toasts.map(({ id, title, description, variant = "default" }) => {
 const Icon = icons[variant];
 return (
 <ToastPrimitive.Root
 key={id}
 onOpenChange={(open) => !open && dismiss(id)}
 className={cn(
 "glass-card pointer-events-auto relative flex w-full items-start gap-3 rounded-2xl p-4 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-right-full",
 variant === "success" && "border-teal/30",
 variant === "destructive" && "border-red-500/30"
 )}
 >
 <Icon
 className={cn(
 "mt-0.5 h-5 w-5 shrink-0",
 variant === "success" && "text-teal",
 variant === "destructive" && "text-red-400",
 variant === "default" && "text-gold"
 )}
 />
 <div className="flex-1">
 <ToastPrimitive.Title className="text-sm font-semibold text-foreground">
 {title}
 </ToastPrimitive.Title>
 {description && (
 <ToastPrimitive.Description className="mt-1 text-xs text-muted-foreground">
 {description}
 </ToastPrimitive.Description>
 )}
 </div>
 <ToastPrimitive.Close className="rounded-lg p-1 opacity-60 hover:opacity-100 hover:bg-muted transition">
 <X className="h-4 w-4" />
 </ToastPrimitive.Close>
 </ToastPrimitive.Root>
 );
 })}
 <ToastPrimitive.Viewport className="fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 outline-none" />
 </ToastPrimitive.Provider>
 );
}
