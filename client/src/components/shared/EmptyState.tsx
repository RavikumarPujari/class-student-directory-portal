import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EmptyStateProps {
 icon: LucideIcon;
 title: string;
 description: string;
 action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.96 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center"
 >
 <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card">
 <Icon className="h-7 w-7 text-muted-foreground" />
 </div>
 <h3 className="font-display text-lg font-bold">{title}</h3>
 <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
 {action && <div className="mt-6">{action}</div>}
 </motion.div>
 );
}
