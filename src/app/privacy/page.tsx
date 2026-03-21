import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Buff",
  description: "Privacy policy for Buff Protocol, the Buff SDK, and the Buff browser extension.",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[72px]">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: March 19, 2026</p>

          <div className="space-y-10 text-[15px] leading-relaxed text-foreground/85">
            <section>
              <h2 className="text-xl font-bold mb-3">1. Overview</h2>
              <p>
                Buff Protocol (&ldquo;Buff&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) operates the buff.finance
                website, the Buff SDK, and the Buff browser extension. This privacy policy explains what data we
                collect, why we collect it, and how we protect it.
              </p>
              <p className="mt-3">
                We are committed to minimizing data collection. Buff is designed around a principle of
                <strong> client-side-first processing</strong> &mdash; your wallet keys, private keys, and
                transaction signing happen entirely on your device. We never have access to your private keys or
                seed phrases.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. Data We Collect</h2>

              <h3 className="text-base font-semibold mt-4 mb-2">2.1 Buff Browser Extension</h3>
              <p>The Buff browser extension collects and processes the following data locally on your device:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1.5">
                <li><strong>Wallet public address</strong> &mdash; stored in chrome.storage.local to authenticate API requests. Never transmitted except to our API.</li>
                <li><strong>Transaction value estimates</strong> &mdash; the extension estimates the USD value of Solana transactions you sign. This estimate is sent to our API to calculate round-up amounts. We do not store individual transaction details.</li>
                <li><strong>Extension settings</strong> &mdash; your plan choice, ceiling amount, allocation preferences, and enabled/disabled state. Stored locally in chrome.storage.local.</li>
                <li><strong>Round-up statistics</strong> &mdash; aggregate counts (total round-ups, total USD invested). Stored locally.</li>
              </ul>
              <p className="mt-3">The extension does <strong>not</strong> collect:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1.5">
                <li>Browsing history or URLs you visit</li>
                <li>Page content of websites you visit</li>
                <li>Private keys, seed phrases, or wallet passwords</li>
                <li>Transaction signatures or full transaction data</li>
                <li>Personal identifying information (name, email, etc.)</li>
              </ul>

              <h3 className="text-base font-semibold mt-4 mb-2">2.2 Buff Website &amp; Dashboard</h3>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Wallet public address</strong> &mdash; when you connect your wallet to the dashboard.</li>
                <li><strong>Buff wallet address</strong> &mdash; deterministically derived from your signature. We store the public key only.</li>
                <li><strong>API credentials</strong> &mdash; wallet-derived API keys (HMAC hashes, not your actual signature).</li>
              </ul>

              <h3 className="text-base font-semibold mt-4 mb-2">2.3 Buff SDK</h3>
              <p>
                The Buff SDK is a client-side library. It sends API requests to buff.finance containing
                transaction value estimates and wallet public addresses. No data is collected by the SDK itself
                beyond what is transmitted in API calls.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. How We Use Your Data</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Calculate round-ups</strong> &mdash; transaction value estimates are used to compute the round-up amount and generate transfer instructions.</li>
                <li><strong>Authenticate requests</strong> &mdash; wallet addresses and API keys verify that requests come from authorized users.</li>
                <li><strong>Portfolio tracking</strong> &mdash; wallet addresses are used to query on-chain balances (publicly available data).</li>
                <li><strong>Swap execution</strong> &mdash; when investment thresholds are met, we build unsigned swap transactions for your Buff wallet.</li>
              </ul>
              <p className="mt-3">
                We do <strong>not</strong> sell, rent, or share your data with third parties for advertising or
                marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. Data Storage &amp; Security</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>All API communication uses <strong>HTTPS/TLS encryption</strong>.</li>
                <li>Extension data is stored in <strong>chrome.storage.local</strong>, which is sandboxed to the extension and encrypted at rest by the browser.</li>
                <li>API keys are derived via HMAC-SHA256 and cannot be reversed to recover your signature.</li>
                <li>We do not store transaction history, browsing data, or any data beyond what is listed above.</li>
                <li>Server infrastructure uses industry-standard security practices.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. Third-Party Services</h2>
              <p>Buff interacts with the following external services:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1.5">
                <li><strong>Solana RPC nodes</strong> &mdash; to query on-chain balances and submit transactions. Only public blockchain data is accessed.</li>
                <li><strong>Jupiter Aggregator</strong> &mdash; to obtain swap quotes and build swap transactions. Jupiter receives the swap parameters (amounts, token mints) but not your identity.</li>
                <li><strong>CoinGecko / price APIs</strong> &mdash; to fetch current cryptocurrency prices. No user data is sent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Your Rights &amp; Controls</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Disable anytime</strong> &mdash; toggle the extension off to stop all transaction interception instantly.</li>
                <li><strong>Disconnect</strong> &mdash; remove your wallet connection and all stored credentials from the extension.</li>
                <li><strong>Export</strong> &mdash; your Buff wallet is fully self-custodial. Export the private key to any Solana wallet at any time.</li>
                <li><strong>Delete data</strong> &mdash; uninstalling the extension removes all locally stored data. Contact us to request deletion of any server-side data.</li>
                <li><strong>Transparency</strong> &mdash; the extension source code is available for audit. All transaction modifications are visible in your wallet&apos;s signing popup before you approve.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Permissions Justification (Browser Extension)</h2>
              <p>The Buff extension requests the following browser permissions:</p>
              <div className="mt-3 space-y-3">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/20">
                  <div className="font-semibold text-sm">storage</div>
                  <p className="text-sm text-muted-foreground mt-1">Store your settings, auth credentials, and round-up statistics locally.</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/20">
                  <div className="font-semibold text-sm">activeTab / tabs</div>
                  <p className="text-sm text-muted-foreground mt-1">Communicate with the active tab during wallet connection setup. Required to relay messages between the popup and the page&apos;s wallet provider.</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/20">
                  <div className="font-semibold text-sm">Content scripts on all URLs</div>
                  <p className="text-sm text-muted-foreground mt-1">Solana dApps exist on any domain. The extension must inject its wallet wrapper on every page to intercept transactions regardless of which dApp you use. The content script only activates when a Solana wallet provider is detected.</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/20">
                  <div className="font-semibold text-sm">host_permissions: buff.finance</div>
                  <p className="text-sm text-muted-foreground mt-1">Make API requests to the Buff backend to calculate round-ups, fetch prices, and manage your portfolio.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Children&apos;s Privacy</h2>
              <p>
                Buff is not intended for use by anyone under the age of 18. We do not knowingly collect data
                from minors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. Changes will be posted on this page with an updated
                &ldquo;last updated&rdquo; date. Continued use of Buff after changes constitutes acceptance of
                the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">10. Contact</h2>
              <p>
                Questions about this privacy policy? Reach out on our GitHub or social channels.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
