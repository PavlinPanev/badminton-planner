import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { SectionHeader } from "@/components/ui/surfaces";
import { getEditableGroupForUser, getVenueOptions } from "@/lib/group-data";
import { updateGroupAction } from "../../actions";
import { GroupForm } from "../../group-form";

export default async function EditGroupPage({
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

  const [result, venues] = await Promise.all([getEditableGroupForUser(groupId, user), getVenueOptions()]);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "forbidden") {
    redirect(`/groups/${groupId}`);
  }

  const group = result.group;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/groups/${group.id}`} className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to group
      </Link>

      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-sky-600 via-emerald-500 to-lime-400 p-6 text-white shadow-[0_24px_70px_rgba(16,185,129,0.24)] sm:p-8">
        <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
          Manager tools
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-normal sm:text-5xl">Edit {group.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
          Update the public group details visible to connected members.
        </p>
      </section>

      <section className="mt-8">
        <SectionHeader
          eyebrow="Group setup"
          title="Edit Group"
          description="Only managers of this group can save changes."
        />
        <div className="mt-5">
          <GroupForm action={updateGroupAction} venues={venues} group={group} submitLabel="Save changes" />
        </div>
      </section>
    </div>
  );
}
