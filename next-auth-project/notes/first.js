So in callback section of the NextAuth config , we have three things -> authorized , jwt and session








/*   authorized callback*/

-> whatever argument it get is injected by next-auth itself
-> basically it has two args -> auth and request
-> auth is basically a snapshot of the current session
-> its structure depends on what we have returned from our session callback

-> Example :

    -> 1. Incoming Request: A user clicks a link to /dashboard.
    -> 2. Middleware Interception: Before the page loads, your middleware.ts file catches the request.
    -> 3. Cookie Decryption: Auth.js looks at the browser's cookies for the Session Token.
    -> 4. Object Creation: It decrypts that token. If valid, it creates a JSON object representing the user.
    -> 5. Injection: It calls your authorized function and "plugs in" that decrypted object as the auth argument.

Now lets understand the step 3 and 4 in a better way 
-> first all these interception , decryption , object creation and injection is happening on the server side
-> then how does we are operating on something like cookie which browser has stored
-> and the reason is browser used to send it in header segment of http request
-> name of the cookie is usually next-auth.session-token or something like this 



//------------------------------------> end of authorized callback <---------------------------------------------


/*

-------------------------------------> jwt callback <--------------------------------------------

	
-> We dont call it . auth calls it internally on the server side
-> It is called right after the authorize function successfully return a user
-> there are other time also it get called but we will understand it later
-> jwt callbacks also run on every request

-> The job of this jwt is persistence , here we decide what data is important enough to be encrypted
-> and stored in the browser's cookies for the long term

-> this user is the user object returned by the authorize function
-> user argument is present only for the first time when users login in the app
-> after that (like page refresh) user argument will be undefined
-> auth.js decrypts the existing cookie provided by the browser and provides it here 

-> token represent the current state of the jwt 
-> if the user is logged in , auth js decrypt the existing cookie ( sent by the browser) and provide it here 


------------------------------------------> end of jwt callback <-----------------------------------


*/



/*

---------------------------------------> session callback <----------------------------------------------











---------------------------------------> end of session callback <---------------------------------------


*/



/*


-----------------------------------> About auth() function <--------------------------------------------

auht() function internally
   -> read cookies
   -> decode jwt
   -> run jwt()
   -> run session()
   -> return session()
















--------------------------------------------------------------------------------------------------------








*/













/*

---------------------------------> The Big Picture <------------------------------------------
















-------------------------------> end of big picture <---------------------------------------


















*/











