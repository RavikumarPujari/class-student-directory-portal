import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
 const [showPassword, setShowPassword] = React.useState(false);
 const isPassword = type === "password";

 if (isPassword) {
 return (
 <div className="relative w-full">
 <input
 type={showPassword ? "text" : "password"}
 ref={ref}
 className={cn(
 "flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50 pr-10",
 className
 )}
 {...props}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/20 rounded-md"
 aria-label={showPassword ? "Hide password" : "Show password"}
 title={showPassword ? "Hide password" : "Show password"}
 >
 {showPassword ? (
 <Eye className="h-5 w-5" />
 ) : (
 <EyeOff className="h-5 w-5" />
 )}
 </button>
 </div>
 );
 }

 return (
 <input
 type={type}
 ref={ref}
 className={cn(
 "flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50",
 className
 )}
 {...props}
 />
 );
});
Input.displayName = "Input";

export { Input };
