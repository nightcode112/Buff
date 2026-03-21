import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Buff",
  description: "Terms of service for Buff Protocol, the Buff SDK, and the Buff browser extension.",
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[72px]">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h1 className="text-4xl font-extrabold mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: March 19, 2026</p>

          <div className="space-y-10 text-[15px] leading-relaxed text-foreground/85">
            <section>
              <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
              <p>
                By using the Buff website (buff.finance), Buff SDK, Buff browser extension, or any Buff services
                (collectively, &ldquo;Buff&rdquo; or the &ldquo;Service&rdquo;), you agree to these Terms of Service.
                If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. Description of Service</h2>
              <p>
                Buff is a protocol that rounds up Solana blockchain transactions and invests the spare change into
                cryptocurrency assets. Buff provides:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1.5">
                <li>A browser extension that intercepts wallet signing requests and appends round-up transfer instructions</li>
                <li>An SDK for developers to integrate round-up investing into their applications</li>
                <li>A web dashboard for managing settings, viewing portfolio, and exporting wallets</li>
                <li>API endpoints for calculating round-ups, building swaps, and managing accounts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. Self-Custody</h2>
              <p>
                Buff is a <strong>self-custodial</strong> protocol. Your Buff wallet is derived deterministically
                from your wallet signature. You retain full ownership and control of your Buff wallet at all times.
                You can export your private key and import it into any Solana wallet.
              </p>
              <p className="mt-3">
                Buff does not hold, custody, or have access to your private keys, seed phrases, or funds.
                We cannot freeze, seize, or move your assets.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. Transaction Modification</h2>
              <p>
                The Buff extension modifies Solana transactions by appending additional transfer instructions
                (round-up amount + protocol fee) before you sign. Every modification is{" "}
                <strong>visible in your wallet&apos;s signing popup</strong>. You must explicitly approve each
                transaction. Buff never signs transactions on your behalf.
              </p>
              <p className="mt-3">
                The extension is designed to <strong>fail open</strong>: if the Buff API is unavailable or any
                error occurs, your transaction proceeds unmodified. Buff will never block or corrupt a transaction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. Fees</h2>
              <p>
                Buff charges a protocol fee on each round-up, which varies by plan tier:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1.5">
                <li>Seed ($0.50 round-up): 5% fee</li>
                <li>Sprout ($1.00 round-up): 3% fee</li>
                <li>Tree ($5.00 round-up): 1.5% fee</li>
                <li>Forest ($10.00 round-up): 1% fee</li>
              </ul>
              <p className="mt-3">
                Fees are transparently included in the transaction instructions you sign. The fee is deducted
                from the round-up amount, not from your original transaction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Risks</h2>
              <p>You acknowledge and accept the following risks:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1.5">
                <li><strong>Market risk</strong> &mdash; cryptocurrency assets are volatile. Your invested round-ups may lose value.</li>
                <li><strong>Smart contract risk</strong> &mdash; Buff interacts with third-party protocols (Jupiter, Solana) that may contain bugs or vulnerabilities.</li>
                <li><strong>Blockchain risk</strong> &mdash; transactions on Solana are irreversible. Network congestion or failures may affect transaction processing.</li>
                <li><strong>Software risk</strong> &mdash; the extension or SDK may contain bugs. While we design for fail-open safety, no software is guaranteed to be error-free.</li>
              </ul>
              <p className="mt-3">
                Buff is not a financial advisor. Round-up investing through Buff does not constitute investment advice.
                You are solely responsible for your investment decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Eligibility</h2>
              <p>
                You must be at least 18 years old to use Buff. By using the Service, you represent that you are
                of legal age and have the legal capacity to enter into these Terms. You are responsible for
                ensuring your use of Buff complies with laws applicable to you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Prohibited Uses</h2>
              <p>You may not use Buff to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1.5">
                <li>Violate any applicable laws or regulations</li>
                <li>Launder money or finance illegal activities</li>
                <li>Manipulate or abuse the protocol&apos;s fee structure</li>
                <li>Reverse engineer or decompile the service for competitive purposes</li>
                <li>Interfere with or disrupt the service infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Buff and its contributors shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages, including loss of profits,
                data, or digital assets, arising from your use of the Service.
              </p>
              <p className="mt-3">
                The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties
                of any kind, whether express or implied.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">10. Modifications</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on this page.
                Continued use of the Service after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">11. Contact</h2>
              <p>
                Questions about these terms? Reach out on our GitHub or social channels.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
