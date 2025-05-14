"use client";
import React from "react";
import ChatList from "./ChatList";
import { SizeVariant } from "@/types/sizeVariant.types";
import SidebarHeader from "./SidebarHeader";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Sidebar({ variant }: { variant: SizeVariant }) {
  return (
    <div className="bg-sidebar border-r border-sidebar-border flex flex-col justify-between h-full">
      <SidebarHeader variant={variant} />
      <ChatList variant={variant} />
      <div className="mt-auto p-4">
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      </div>
    </div>
  );
}
