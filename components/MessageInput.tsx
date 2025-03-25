'use client'
import { Send } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export default function MessageInput() {
  return (
    <div className="bg-white border-t border-gray-200 p-4 ">
      <div className="flex items-center gap-2">
        <Textarea
          placeholder="Write a message..."
          className="flex-1 bg-gray-100 px-4 py-2 rounded-lg  resize-none min-h-[40px] max-h-[240px] no-scrollbar"
          rows={1}
        />
        <Button size={'icon'} className="p-2 hover:bg-gray-100 rounded-full">
          <Send />
        </Button>
      </div>
    </div>
  );
}
