
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
            // this name authorize is required by next-auth
            // since in credentials we are using our own credentials , next-auth needs to know how to authorize the user
            // so we are using the authorize function to verify the user
            // this function is triggered when when we call signIn("credentials", { email, password })
            // run in the server side
            authorize: async (credentials) => {
                // credentials is an object with the email and password
                // it has email and password as keys
                // because in credentials section we have specified the email and password as keys
                // so we are getting the email and password from the credentials object 
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
        // nextjs middleware calls this function automatically everytime a user tries to visit a url
        
        // authorized callback is the command center for our app navigation rule
        // centerialization -> Instead of putting if (!session) redirect() at the top of 50 different files,
        //                     you write your rules once here.


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
            // this user is the user object returned by the authorize function
            // user argument is present only for the first time when users login in the app
            // after that (like page refresh) user argument will be undefined
            // auth.js decrypts the existing cookie provided by the browser and provides it here 
            
            // The job of this jwt is persistence , here we decide what data is important enough to be encrypted
            // and stored in the browser's cookies for the long term

            // When nextjs internally calls it is interesting 
            // the first one which is easy to get is it called just after the authorize fucntion is called
            // there are some other times when it is called , but that is not easy to get
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        // session is the bridge between the server encripted data ( token object ) and the client sccessible data (the session object)
        // session is getting this token object which is returned by the jwt callback
        // so whatever we saved in token object in jwt callback can be accessed here 
        
        // session object is created by next-auth
        // by default it has user object with name , email , image
        // 
        session: async ({ session, token }) => {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
})
