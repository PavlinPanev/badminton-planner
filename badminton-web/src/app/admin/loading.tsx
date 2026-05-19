import { Card } from "@/components/ui/surfaces";

export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-violet-600 via-sky-500 to-emerald-500 p-8 text-white shadow-[0_24px_70px_rgba(59,130,246,0.24)]">
        <div className="h-4 w-32 rounded-full bg-white/30" />
        <div className="mt-6 h-10 w-72 rounded-2xl bg-white/30" />
        <div className="mt-4 h-5 max-w-2xl rounded-full bg-white/20" />
      </section>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} className="h-32 animate-pulse bg-white/70">
            <span className="sr-only">Loading admin metric</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
