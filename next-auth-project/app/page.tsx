
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Header from "@/components/header";
import TodoList from "@/components/todo-list";
import AddTodoForm from "@/components/add-todo-form";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium leading-6 text-gray-900">Add a new task</h2>
              <div className="mt-2">
                <AddTodoForm />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Your Tasks</h2>
              <TodoList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
