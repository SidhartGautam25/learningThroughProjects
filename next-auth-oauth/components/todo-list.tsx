'use client';

import { useQuery } from '@tanstack/react-query';
import { Todo } from '@/lib/store';
import TodoItem from './todo-item';
import { useTodoStore } from '@/lib/hooks/useTodoStore';

export default function TodoList() {
    const { filter, setFilter } = useTodoStore();

    const { data: todos, isLoading, error } = useQuery<Todo[]>({
        queryKey: ['todos'],
        queryFn: async () => {
            const response = await fetch('/api/todos');
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        },
    });

    if (isLoading) return <div className="text-center py-4">Loading todos...</div>;
    if (error) return <div className="text-center py-4 text-red-500">Error loading todos</div>;

    const filteredTodos = todos?.filter((todo) => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });

    return (
        <div>
            <div className="mb-4 flex space-x-4 border-b border-gray-200 pb-2">
                {(['all', 'active', 'completed'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${filter === f
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>
            <ul role="list" className="divide-y divide-gray-100">
                {filteredTodos?.length === 0 ? (
                    <li className="py-4 text-center text-gray-500">No todos found.</li>
                ) : (
                    filteredTodos?.map((todo) => <TodoItem key={todo.id} todo={todo} />)
                )}
            </ul>
        </div>
    );
}
