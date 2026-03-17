"use client";

import { createAppKit } from "@reown/appkit";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import { solana } from "@reown/appkit/networks";

const solanaAdapter = new SolanaAdapter();

let instance: ReturnType<typeof createAppKit> | null = null;

export function getAppKit() {
  if (typeof window === "undefined") return null;

  if (!instance) {
    instance = createAppKit({
      projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "",
      adapters: [solanaAdapter],
      networks: [solana],
      metadata: {
        name: "Buff",
        description: "Buff — Round up & auto-invest onchain",
        url: window.location.origin,
        icons: [],
      },
      themeMode: "dark",
    });
  }

  return instance;
}
