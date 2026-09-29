import { cn } from "@/lib/utils";

export function PremiumStar({ className }: { className?: string }) {
  return (
    <span className={cn("premium-star", className)} aria-hidden="true">
      {["one", "two", "three"].map((id) => (
        <svg key={id} id={`premium-star-${id}`} viewBox="0 0 100 100" role="presentation">
          <g>
            <path d="M50 4 59 39 96 50 59 61 50 96 41 61 4 50 41 39Z" />
            <path d="M50 18 56 44 82 50 56 56 50 82 44 56 18 50 44 44Z" />
          </g>
        </svg>
      ))}
    </span>
  );
}