"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";

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
  //provides user's auth state to Convex from server-side
  const a: () => ReturnType<typeof useAuth> = () =>
    ({
      isLoaded: true,
      isSignedIn: !!token,
      orgId,
      orgRole,
      getToken: async () => {
        return token ?? null;
      },
    }) as ReturnType<typeof useAuth>;

  return (
    <ConvexProviderWithClerk client={convex} useAuth={a}>
      {children}
    </ConvexProviderWithClerk>
  );
}
