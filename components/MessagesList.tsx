import { cn } from "@/lib/utils";
import React from "react";
import { Card } from "./ui/card";

export default function MessagesList() {
  const messages = [
    { id: 1, content: "Sample incoming message" },
    { id: 2, content: "Sample 2outgoing message" },
  ];
  return (
    <div className="flex-1 overflow-y-auto p-4 pt-auto flex flex-col justify-end">
      {/* Messages will go here */}
      <div className="flex flex-col  gap-4">
        {messages.map((el) => (
          <Message key={el.id} children={el.content} />
        ))}
      </div>
    </div>
  );
}

function Message({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn(
        "p-3 rounded-lg max-w-[70%] self-start",
        className
      )}
      {...props}
    >
      <p>{children}</p>
    </Card>
  );
}
