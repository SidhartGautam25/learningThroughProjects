'use client';

import { useSession, signOut } from 'next-auth/react';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                <h1 className="text-xl font-bold text-indigo-600">OAuth Todo App</h1>
                {session?.user && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {session.user.image && (
                                <img
                                    src={session.user.image}
                                    alt="Avatar"
                                    className="h-8 w-8 rounded-full"
                                />
                            )}
                            <span className="text-sm text-gray-700">
                                {session.user.name || session.user.email}
                            </span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
