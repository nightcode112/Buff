import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { CTA } from "@/components/cta";
import { GuidesMarquee } from "@/components/guides-marquee";
import { FixedVisual } from "@/components/fixed-visual";
import { SmoothScroll } from "@/components/smooth-scroll";
import { GlobalBackground } from "@/components/global-background";
export default function Home() {
  return (
    <>
      <GlobalBackground />
      <Nav />
      <FixedVisual />
      <SmoothScroll>
        <main>
          <div data-visual-scope>
            <Hero />
            <HowItWorks />
          </div>
          <div className="lg:relative">
            <div className="lg:absolute lg:left-0 lg:right-0 lg:top-0 lg:-translate-y-1/2 z-10">
              <GuidesMarquee />
            </div>
          </div>
          <CTA />
        </main>
      </SmoothScroll>
    </>
  );
}
