import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { SectionHeader } from "@/components/ui/surfaces";
import { getEditableSessionForUser, getSessionFormContextForUser } from "@/lib/group-data";
import { updateSessionAction } from "../../../../session-actions";
import { SessionForm } from "../../../../session-form";

export default async function EditGroupSessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const { id, sessionId: rawSessionId } = await params;
  const groupId = Number(id);
  const sessionId = Number(rawSessionId);

  if (!Number.isInteger(groupId) || !Number.isInteger(sessionId)) {
    notFound();
  }

  const [contextResult, sessionResult] = await Promise.all([
    getSessionFormContextForUser(groupId, user),
    getEditableSessionForUser(groupId, sessionId, user),
  ]);

  if (contextResult.status === "not-found" || sessionResult.status === "not-found") {
    notFound();
  }

  if (contextResult.status === "forbidden" || sessionResult.status === "forbidden") {
    redirect(`/groups/${groupId}`);
  }

  const context = contextResult.context;
  const session = sessionResult.session;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/groups/${groupId}`} className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to group
      </Link>

      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-sky-600 via-emerald-500 to-lime-400 p-6 text-white shadow-[0_24px_70px_rgba(16,185,129,0.24)] sm:p-8">
        <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
          Session planning
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-normal sm:text-5xl">Edit Session</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
          Update or cancel this training session for {context.group.title}.
        </p>
      </section>

      <section className="mt-8">
        <SectionHeader
          eyebrow="Training schedule"
          title="Edit Session"
          description="Group coaches, managers, and admins can update session details or mark the session as canceled."
        />
        <div className="mt-5">
          <SessionForm
            action={updateSessionAction}
            groupId={context.group.id}
            venues={context.venues}
            coaches={context.coaches}
            session={session}
            submitLabel="Save session"
          />
        </div>
      </section>
    </div>
  );
}
