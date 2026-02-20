
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { findUserByEmail } from "./lib/store"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                // logic to verify if user exists
                const user = await findUserByEmail(email);

                if (!user) {
                    // No user found, so this is their first attempt to login
                    // effectively a new user registration (for this demo)
                    return null;
                }

                // Check password (In real app, use bcrypt.compare)
                if (user.password !== password) {
                    return null;
                }

                // return user object with their profile data
                return user;
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized: async ({ auth, request: { nextUrl } }) => {
            const isLoggedIn = !!auth;
            const isOnDashboard = nextUrl.pathname === '/';
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/', nextUrl));
            }
            return true;
        },
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
})
