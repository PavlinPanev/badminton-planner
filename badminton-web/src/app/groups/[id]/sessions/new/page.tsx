import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { SectionHeader } from "@/components/ui/surfaces";
import { getSessionFormContextForUser } from "@/lib/group-data";
import { createSessionAction } from "../../../session-actions";
import { SessionForm } from "../../../session-form";

export default async function NewGroupSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const { id } = await params;
  const groupId = Number(id);

  if (!Number.isInteger(groupId)) {
    notFound();
  }

  const result = await getSessionFormContextForUser(groupId, user);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "forbidden") {
    redirect(`/groups/${groupId}`);
  }

  const context = result.context;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/groups/${groupId}`} className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to group
      </Link>

      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-emerald-600 via-sky-500 to-violet-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.24)] sm:p-8">
        <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
          Session planning
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-normal sm:text-5xl">Create Session</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
          Add a new training session for {context.group.title}.
        </p>
      </section>

      <section className="mt-8">
        <SectionHeader
          eyebrow="Training schedule"
          title="New Session"
          description="Set the date, time, venue, coach, and capacity for this group session."
        />
        <div className="mt-5">
          <SessionForm
            action={createSessionAction}
            groupId={context.group.id}
            venues={context.venues}
            coaches={context.coaches}
            submitLabel="Create session"
          />
        </div>
      </section>
    </div>
  );
}
