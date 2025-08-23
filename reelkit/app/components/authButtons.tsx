"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function AuthButtons() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-9 w-24 rounded-md bg-gray-200 dark:bg-neutral-800 animate-pulse" />
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/upload"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2"
        >
          Upload
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800"
      >
        Register
      </Link>
    </div>
  );
}
