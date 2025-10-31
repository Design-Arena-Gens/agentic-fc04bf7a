import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/80 text-primary-foreground",
        secondary: "bg-secondary/80 text-secondary-foreground",
        outline: "border-border/70 text-muted-foreground",
        success:
          "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
        warning:
          "bg-amber-500/15 text-amber-300 border border-amber-500/30",
        destructive:
          "bg-rose-500/15 text-rose-200 border border-rose-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
