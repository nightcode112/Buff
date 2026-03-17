import { Nav } from "@/components/nav";
import { Sidebar } from "@/components/docs/sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <div className="flex min-h-screen pt-[72px]">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </>
  );
}
