import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { ChainsSection } from "@/components/chains-section";
import { AgentSection } from "@/components/agent-section";
import { Developers } from "@/components/developers";
import { Protocol } from "@/components/protocol";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <div className="divider-gold" />
        <HowItWorks />
        <div className="divider-gold" />
        <ChainsSection />
        <div className="divider-gold" />
        <AgentSection />
        <div className="divider-gold" />
        <Developers />
        <div className="divider-gold" />
        <Protocol />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
