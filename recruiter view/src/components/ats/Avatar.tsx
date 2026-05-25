import { cn } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 32,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-medium",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
