"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

async function deriveBuffWallet(email: string, password: string): Promise<{ publicKey: string; secretKeyBase64: string }> {
  // Deterministic seed: SHA-256(email + password)
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim() + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
  const seed = new Uint8Array(hashBuffer);

  // Derive ed25519 keypair from seed
  const nacl = await import("tweetnacl");
  const keypair = nacl.sign.keyPair.fromSeed(seed);

  // Encode secret key as base64 for storage
  const secretKeyBase64 = btoa(String.fromCharCode(...keypair.secretKey));

  // Get public key as base58
  const bs58 = await import("bs58");
  const publicKey = bs58.default.encode(keypair.publicKey);

  return { publicKey, secretKeyBase64 };
}

async function encryptSecretKey(secretKeyBase64: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const dataBytes = encoder.encode(secretKeyBase64);

  // Derive encryption key from password via PBKDF2
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

  // Encrypt
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    aesKey,
    dataBytes.buffer as ArrayBuffer
  );

  // Pack salt + iv + ciphertext as base64
  const packed = new Uint8Array(salt.length + iv.length + new Uint8Array(encrypted).length);
  packed.set(salt, 0);
  packed.set(iv, salt.length);
  packed.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode(...packed));
}

export default function SignupPage() {
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // Derive deterministic Buff wallet from email + password
      const { publicKey, secretKeyBase64 } = await deriveBuffWallet(email, password);

      // Encrypt the secret key with the password
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
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold mb-2">Create Account</h2>
          <p className="text-sm text-muted-foreground mb-8">
            No wallet needed. We&apos;ll create one for you.
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
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-secondary/40 border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold/30 transition-colors"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Your password encrypts your wallet. If you forget it, use the same email + password to re-derive.
              </p>
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
              {loading ? "Creating wallet..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/dashboard/login" className="text-gold hover:text-gold/80 font-semibold transition-colors">
                Log in
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
