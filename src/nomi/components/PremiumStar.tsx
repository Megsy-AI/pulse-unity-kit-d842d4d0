import { cn } from "@/lib/utils";

export function PremiumStar({ className }: { className?: string }) {
  return (
    <span className={cn("premium-star-loader", className)} aria-hidden="true">
      {["pegtopone", "pegtoptwo", "pegtopthree"].map((id) => (
        <svg key={id} id={id} viewBox="0 0 100 100" role="presentation">
          <g><path d="M50 5 60 40 95 50 60 60 50 95 40 60 5 50 40 40Z" /></g>
        </svg>
      ))}
    </span>
  );
}