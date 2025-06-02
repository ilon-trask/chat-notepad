"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { TODO } from "@/types/types";

export const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export function ConvexClientProvider({
  children,
  token,
  orgId,
  orgRole,
}: {
  children: ReactNode;
  token: string;
  orgId: string;
  orgRole: string;
}) {
  const a: () => ReturnType<typeof useAuth> = () =>
    ({
      isLoaded: true,
      isSignedIn: !!token,
      orgId,
      orgRole,
      getToken: async () => {
        return token ?? null;
      },
    }) as TODO;
  return (
    <ConvexProviderWithClerk client={convex} useAuth={a}>
      {children}
    </ConvexProviderWithClerk>
  );
}
