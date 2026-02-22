import { NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/store';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 409 }
            );
        }

        await createUser({ name, email, password });

        return NextResponse.json(
            { message: 'User created successfully' },
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
