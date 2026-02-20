
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Todo } from '@/lib/store';

interface TodoItemProps {
    todo: Todo;
}

export default function TodoItem({ todo }: TodoItemProps) {
    const queryClient = useQueryClient();

    const toggleMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/todos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: todo.id }),
            });
            if (!response.ok) throw new Error('Failed to update todo');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/todos', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: todo.id }),
            });
            if (!response.ok) throw new Error('Failed to delete todo');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });

    return (
        <li className="flex items-center justify-between gap-x-6 py-5">
            <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto">
                    <p
                        onClick={() => toggleMutation.mutate()}
                        className={`cursor-pointer text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 ${todo.completed ? 'line-through text-gray-500' : ''
                            }`}
                    >
                        {todo.title}
                    </p>
                    <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        {new Date(todo.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                <button
                    onClick={() => deleteMutation.mutate()}
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </li>
    );
}
