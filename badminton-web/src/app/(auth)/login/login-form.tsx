"use client";

import { FormEvent, useState } from "react";

export function LoginForm() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Login will be connected to the authentication API next.");
  }

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-normal text-zinc-950">Login</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-700">
        Use your club account to access groups, sessions, attendance, and comments.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 rounded-md border border-zinc-200 bg-white p-5">
        <label className="block text-sm font-medium text-zinc-800" htmlFor="email">
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
          autoComplete="current-password"
          required
          className="mt-2 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600"
        />

        <button
          type="submit"
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
        >
          Login
        </button>

        {message ? <p className="mt-4 text-sm text-zinc-700">{message}</p> : null}
      </form>
    </section>
  );
}
