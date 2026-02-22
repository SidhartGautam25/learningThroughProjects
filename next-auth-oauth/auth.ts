import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { findUserByEmail, createUser } from "./lib/store"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        // OAuth Providers - these handle login AND registration automatically
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),

        // Credentials Provider - manual email/password login
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await findUserByEmail(email);

                if (!user) {
                    return null;
                }

                // In a real app, use bcrypt.compare
                if (user.password !== password) {
                    return null;
                }

                return user;
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        // Called when a user signs in via OAuth for the first time
        // This is where we create the user in our store
        async signIn({ user, account }) {
            if (account?.provider === "google" || account?.provider === "github") {
                const existingUser = await findUserByEmail(user.email!);
                if (!existingUser) {
                    // Auto-register OAuth users on first login
                    const newUser = await createUser({
                        name: user.name || "OAuth User",
                        email: user.email!,
                        // No password for OAuth users
                    });
                    user.id = newUser.id;
                } else {
                    user.id = existingUser.id;
                }
            }
            return true;
        },
        authorized: async ({ auth, request: { nextUrl } }) => {
            const isLoggedIn = !!auth;
            const isOnDashboard = nextUrl.pathname === '/';
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false;
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
