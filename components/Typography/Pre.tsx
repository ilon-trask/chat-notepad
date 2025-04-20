import { cn } from "@/lib/utils";

export function Pre({className, ...props}: React.HTMLAttributes<HTMLPreElement>) {
    return (
      <pre className={cn("leading-7 [&:not(:first-child)]:mt-6 whitespace-pre-wrap ", className)} {...props}>
        {props.children}
      </pre>
    )
  }
  