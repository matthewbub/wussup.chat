import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token");

  // Check if the user is trying to access a protected route
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Check if the user is trying to access auth pages while already logged in
  if (["/login", "/register"].includes(request.nextUrl.pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// run the middleware on these paths
export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/register", "/verify-email"],
};
