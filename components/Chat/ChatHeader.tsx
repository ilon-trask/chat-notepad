import React from "react";
import { Large} from "../Typography";

export default function ChatHeader() {
  return (
    <div className="h-[73px]  border-b border-gray-200 dark:border-gray-800 px-4 flex items-center">
      <Large>Selected Chat Name</Large>
    </div>
  );
} 