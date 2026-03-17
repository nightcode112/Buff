"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

async function deriveBuffWallet(email: string, password: string): Promise<{ publicKey: string; secretKeyBase64: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim() + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
  const seed = new Uint8Array(hashBuffer);

  const nacl = await import("tweetnacl");
  const keypair = nacl.sign.keyPair.fromSeed(seed);
  const secretKeyBase64 = btoa(String.fromCharCode(...keypair.secretKey));

  const bs58 = await import("bs58");
  const publicKey = bs58.default.encode(keypair.publicKey);

  return { publicKey, secretKeyBase64 };
}

async function encryptSecretKey(secretKeyBase64: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const dataBytes = encoder.encode(secretKeyBase64);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBytes.buffer as ArrayBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const aesKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    aesKey,
    dataBytes.buffer as ArrayBuffer
  );

  const packed = new Uint8Array(salt.length + iv.length + new Uint8Array(encrypted).length);
  packed.set(salt, 0);
  packed.set(iv, salt.length);
  packed.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode(...packed));
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      // Re-derive the same deterministic wallet
      const { publicKey, secretKeyBase64 } = await deriveBuffWallet(email, password);

      // Re-encrypt with password (fresh salt/iv)
      const encryptedWallet = await encryptSecretKey(secretKeyBase64, password);

      // Store in localStorage
      localStorage.setItem("buff_web2_wallet", encryptedWallet);
      localStorage.setItem("buff_web2_email", email.toLowerCase().trim());
      localStorage.setItem("buff_web2_pubkey", publicKey);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="premium-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gold">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold mb-2">Log In</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Enter your email and password to access your wallet.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-secondary/40 border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold/30 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-secondary/40 border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold/30 transition-colors"
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-4 rounded-xl text-base font-bold disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/dashboard/signup" className="text-gold hover:text-gold/80 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Have a wallet?{" "}
              <Link href="/dashboard" className="text-gold hover:text-gold/80 font-semibold transition-colors">
                Connect instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
