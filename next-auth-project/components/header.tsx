
'use client';

import { signOut, useSession } from 'next-auth/react';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className="bg-white shadow">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    My Todo App
                </h1>
                {session && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-700">
                            Signed in as: <span className="font-semibold">{session.user?.email}</span>
                        </span>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="rounded-md bg-gray-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
