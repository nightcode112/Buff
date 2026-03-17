import { Nav } from "@/components/nav";

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}
