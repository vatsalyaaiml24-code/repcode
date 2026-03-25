import Link from "next/link";

export default function HomePage() {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h1 className="text-2xl font-semibold">REPCODE Memory System</h1>
      <p className="mt-3 max-w-2xl text-zinc-300">
        Capture decisions and reasoning, then let new developers ask questions against your project
        memory.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/log" className="rounded-md bg-zinc-100 px-4 py-2 text-zinc-900">
          Log Decision
        </Link>
        <Link href="/ask" className="rounded-md border border-zinc-700 px-4 py-2 text-zinc-100">
          Ask Memory
        </Link>
      </div>
    </section>
  );
}
