"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { registerAction } from "@/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-900 disabled:opacity-70"
    >
      {pending ? "Creating account..." : "Register"}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, {});

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-normal text-zinc-950">Register</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-700">
        Create a club account for parent, player, coaching, or management workflows.
      </p>

      <form action={formAction} className="mt-8 rounded-md border border-zinc-200 bg-white p-5">
        <label className="block text-sm font-medium text-zinc-800" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="mt-2 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600"
        />

        <label className="mt-5 block text-sm font-medium text-zinc-800" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600"
        />

        <label className="mt-5 block text-sm font-medium text-zinc-800" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="mt-2 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600"
        />

        <SubmitButton />

        {state.error ? <p className="mt-4 text-sm text-red-700">{state.error}</p> : null}
      </form>
    </section>
  );
}
