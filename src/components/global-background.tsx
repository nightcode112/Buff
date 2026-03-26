"use client";

import Grainient from "@/components/Grainient";

const shared = {
  timeSpeed: 2.2,
  colorBalance: 0.03,
  warpStrength: 0.4,
  warpFrequency: 12,
  warpSpeed: 4.1,
  warpAmplitude: 50,
  blendAngle: 0,
  blendSoftness: 1,
  rotationAmount: 500,
  noiseScale: 3.3,
  grainAmount: 0.11,
  grainScale: 1.1,
  grainAnimated: true,
  contrast: 1.5,
  gamma: 1,
  saturation: 1,
  centerX: 0,
  centerY: 0,
  zoom: 0.9,
};

export function GlobalBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1, willChange: "transform", transform: "translateZ(0)" }}
    >
      {/* Dark theme */}
      <div className="absolute inset-0 hidden dark:block">
        <Grainient
          color1="#122e52"
          color2="#0a1e38"
          color3="#153562"
          {...shared}
        />
      </div>
      {/* Light theme */}
      <div className="absolute inset-0 block dark:hidden">
        <Grainient
          color1="#51a2ff"
          color2="#70b4ff"
          color3="#8ec5ff"
          {...shared}
        />
      </div>
    </div>
  );
}
