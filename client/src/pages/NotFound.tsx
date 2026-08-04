import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold">
        <Compass className="h-7 w-7" />
      </span>
      <h1 className="font-display text-4xl font-extrabold">404</h1>
      <p className="mt-2 text-muted-foreground">This page doesn't exist in the directory.</p>
      <Button asChild className="mt-8">
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
