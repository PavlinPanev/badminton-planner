import { Card } from "@/components/ui/surfaces";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-emerald-600 via-sky-500 to-violet-500 p-8 text-white shadow-[0_24px_70px_rgba(59,130,246,0.24)]">
        <div className="h-4 w-28 rounded-full bg-white/30" />
        <div className="mt-6 h-10 w-64 rounded-2xl bg-white/30" />
        <div className="mt-4 h-5 max-w-xl rounded-full bg-white/20" />
      </section>
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <Card className="h-72 animate-pulse bg-white/70">
          <span className="sr-only">Loading profile details</span>
        </Card>
        <Card className="h-72 animate-pulse bg-white/70">
          <span className="sr-only">Loading profile settings</span>
        </Card>
      </div>
    </div>
  );
}
