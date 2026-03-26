import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Plans", href: "/docs/plans" },
      { label: "Simulator", href: "/simulator" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/docs", external: true },
      { label: "Quick Start", href: "/docs/quickstart", external: true },
      { label: "SDK Reference", href: "/docs/api/init", external: true },
      { label: "SKILL.md", href: "/docs/guides/skills" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Notice", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Twitter / X", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Discord", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="pt-16 pb-10">
      <div className="mx-auto px-6 lg:px-16 max-w-[1280px]">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Buff
          </Link>
        </div>

        {/* Newsletter */}
        <div className="bg-[#141414] border border-[#ffffff08] rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-16">
          <div>
            <h3 className="text-lg lg:text-xl font-medium mb-1">Enter your email</h3>
            <p className="text-sm text-[#666]">Subscribe to our newsletter for the latest alpha</p>
          </div>
          <button className="shrink-0 px-6 py-3 rounded-full border border-[#ffffff15] text-sm font-medium hover:bg-[#ffffff08] transition-all cursor-pointer">
            Sign up
          </button>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16 text-center">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm text-[#888] italic mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#666] hover:text-white transition-colors duration-300"
                    >
                      {item.label}
                      {"external" in item && item.external && (
                        <span className="ml-0.5 text-[10px]">&#8599;</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-[#ffffff08] pt-8 text-center">
          <p className="text-xs text-[#555]">
            &copy; {new Date().getFullYear()} Buff Protocol. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
