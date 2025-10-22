import Link from "next/link";

const resources = [
  {
    title: "Documentation",
    href: "https://nextjs.org/docs",
    description: "Learn more about Next.js features and API."
  },
  {
    title: "Tailwind CSS",
    href: "https://tailwindcss.com/docs",
    description: "Discover utility-first styling to build modern UIs fast."
  },
  {
    title: "Deploy",
    href: "https://vercel.com",
    description: "Deploy your Next.js app with zero configuration."
  }
];

export default function HomePage() {
  return (
    <main className="flex w-full max-w-4xl flex-col items-center gap-10 text-center">
      <div className="flex flex-col gap-4">
        <p className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-medium uppercase tracking-[0.3em] text-white/70">
          Next.js 15 + Tailwind CSS
        </p>
        <h1 className="text-4xl font-semibold sm:text-6xl">Welcome to your new project</h1>
        <p className="text-lg text-white/70 sm:text-xl">
          Kickstart development with the latest Next.js app router, fully configured with
          Tailwind CSS and TypeScript.
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-3">
        {resources.map(({ title, description, href }) => (
          <Link
            key={title}
            href={href}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-white/40 hover:bg-white/10"
          >
            <h2 className="text-xl font-semibold transition group-hover:text-white">{title}</h2>
            <p className="mt-2 text-sm text-white/70">{description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
