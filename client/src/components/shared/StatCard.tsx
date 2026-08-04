import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "gold" | "teal";
  index?: number;
}

export function StatCard({ label, value, icon: Icon, accent = "gold", index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              accent === "gold" ? "bg-gold/10 text-gold" : "bg-teal/10 text-teal"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
