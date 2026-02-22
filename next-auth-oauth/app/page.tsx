import Header from '@/components/header';
import AddTodoForm from '@/components/add-todo-form';
import TodoList from '@/components/todo-list';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="mx-auto max-w-2xl px-4 py-8">
                <div className="rounded-lg bg-white p-6 shadow">
                    <h1 className="mb-6 text-2xl font-bold text-gray-900">My Todos</h1>
                    <AddTodoForm />
                    <div className="mt-6">
                        <TodoList />
                    </div>
                </div>
            </main>
        </div>
    );
}
