import { cn } from "@/lib/utils";

export function Small({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <small
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    >
      {props.children}
    </small>
  );
}
