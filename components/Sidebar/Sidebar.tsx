"use client";
import React from "react";
import ChatList from "./ChatList";
import { SizeVariant } from "@/types/sizeVariant";
import SidebarHeader from "./SidebarHeader";

export default function Sidebar({ variant }: { variant: SizeVariant }) {
  return (
    <div className="bg-sidebar border-r border-sidebar-border">
      <SidebarHeader variant={variant} />
      <ChatList variant={variant} />
    </div>
  );
}

