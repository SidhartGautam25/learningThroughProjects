
import { auth } from "@/auth";
import { getUserTodos, createTodo, toggleTodo, deleteTodo } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const todos = await getUserTodos(session.user.id);
    return NextResponse.json(todos);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { title } = await req.json();
        if (!title) {
            return new NextResponse("Title is required", { status: 400 });
        }
        const newTodo = await createTodo(session.user.id, title);
        return NextResponse.json(newTodo);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { id } = await req.json();
        if (!id) return new NextResponse("ID required", { status: 400 });

        const updatedTodo = await toggleTodo(id, session.user.id);
        if (!updatedTodo) return new NextResponse("Todo not found", { status: 404 });

        return NextResponse.json(updatedTodo);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { id } = await req.json(); // Usually DELETE receives ID in query or body, doing body here for simplicity
        // Better practice: DELETE /api/todos?id=123 or DELETE /api/todos/123

        // Let's assume body for now or query param? 
        // For RESTful standards, DELETE /api/todos/[id] is better, but this file is caught by all methods.
        // Actually, let's use searchParams if possible, or body. Body is easier for now.
        if (!id) return new NextResponse("ID required", { status: 400 });

        const success = await deleteTodo(id, session.user.id);
        if (!success) return new NextResponse("Todo not found", { status: 404 });

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
