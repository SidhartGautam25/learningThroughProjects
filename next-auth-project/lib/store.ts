
// This is a simple in-memory store to simulate a database.
// In a real application, you would use a real database like PostgreSQL, MongoDB, etc.

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // In a real app, this should be hashed!
}

export interface Todo {
    id: string;
    userId: string;
    title: string;
    completed: boolean;
    createdAt: Date;
}

// Initial mock data
const initialUsers: User[] = [
    {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123', // PEAK SECURITY
    },
];

const initialTodos: Todo[] = [
    {
        id: '1',
        userId: '1',
        title: 'Welcome to your Todo App!',
        completed: false,
        createdAt: new Date(),
    },
];

const globalForStore = globalThis as unknown as {
    users: User[];
    todos: Todo[];
};

export const users = globalForStore.users || initialUsers;
export const todos = globalForStore.todos || initialTodos;

if (process.env.NODE_ENV !== 'production') {
    globalForStore.users = users;
    globalForStore.todos = todos;
}

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    const newUser = {
        ...user,
        id: Math.random().toString(36).substring(2, 9),
    };
    users.push(newUser);
    return newUser;
};

// Helper functions to simulate DB calls

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 10));
    return users.find((user) => user.email === email);
};

export const getUserTodos = async (userId: string): Promise<Todo[]> => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return todos.filter((todo) => todo.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const createTodo = async (userId: string, title: string): Promise<Todo> => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    const newTodo: Todo = {
        id: Math.random().toString(36).substring(2, 9),
        userId,
        title,
        completed: false,
        createdAt: new Date(),
    };
    todos.push(newTodo);
    return newTodo;
};

export const toggleTodo = async (todoId: string, userId: string): Promise<Todo | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    const todo = todos.find(t => t.id === todoId && t.userId === userId);
    if (todo) {
        todo.completed = !todo.completed;
        return todo;
    }
    return undefined;
};

export const deleteTodo = async (todoId: string, userId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    const initialLength = todos.length;
    const index = todos.findIndex(t => t.id === todoId && t.userId === userId);
    if (index !== -1) {
        todos.splice(index, 1);
        return true;
    }
    return false;
};
