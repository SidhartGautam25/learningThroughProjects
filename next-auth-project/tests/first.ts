/*Auth.js stores the session in an encrypted cookie (JWT strategy). 
In development you usually see a name like authjs.session-token (on HTTPS in production it may be prefixed, e.g. __Secure-authjs.session-token). 
The value is not a plain JWT you should paste around—it is encrypted/signed using AUTH_SECRET on the server.
*/




/*
Other cookies you might see

authjs.csrf-token (or similar): used for CSRF protection on Auth.js actions (e.g. sign-in flows), not for your /api/todos JSON handlers the same way.
*/


// curl -i http://localhost:3000/api/todos
/*
You should see 401 and body Unauthorized, matching your GET handler when session?.user?.id is missing.

*/


// get todos
/*
curl -i http://localhost:3000/api/todos \
  -H "Cookie: authjs.session-token=PASTE_THE_VALUE_HERE"

*/


// signup
/*

curl -i -X POST "http://localhost:3000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"newuser@example.com","password":"yourpassword"}'


*/


// signin (run in bash; creates ./cookies.txt)
// 1) GET /api/auth/csrf must use -c cookies.txt so Auth.js CSRF cookies are stored.
// 2) POST uses -b cookies.txt so the CSRF cookie matches the csrfToken in the body.
//    (Block comments cannot hold the sed line below: the regex contains * / which ends */ early.)
//
// BASE="http://localhost:3000"
// CSRF=$(curl -s -c cookies.txt "$BASE/api/auth/csrf" | jq -r .csrfToken)
// CSRF=$(curl -s -c cookies.txt "$BASE/api/auth/csrf" | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])")
// curl -i -b cookies.txt -c cookies.txt -X POST "$BASE/api/auth/callback/credentials" \
//   -H "Content-Type: application/x-www-form-urlencoded" -H "X-Auth-Return-Redirect: 1" \
//   --data-urlencode "csrfToken=$CSRF" --data-urlencode "callbackUrl=$BASE/" \
//   --data-urlencode "email=test@example.com" --data-urlencode "password=password123"
// curl -s "$BASE/api/auth/session" -b cookies.txt

// jwt.io and Auth.js session cookie
// The session value is usually a JWE (encrypted), not a plain JWT — five dot-separated segments.
// jwt.io: paste only the FIRST segment (the part before the first ".") to inspect the JWE header
// (alg "dir", enc "A256CBC-HS512"). The payload is encrypted; jwt.io cannot decode it without your secret.
// Do not paste live cookies into jwt.io on shared machines.