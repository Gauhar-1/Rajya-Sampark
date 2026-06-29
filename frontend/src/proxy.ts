import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that do not require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/feed',
  '/login(.*)',
  '/sign-up(.*)',     // Added sign-up so new users can actually access it
  '/api/webhooks(.*)',
  '/api/auth(.*)',
  '/api/post',        // Public feed
  '/api/post/:id',    // Public post by ID
]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Protect routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // 2. Initialize the response
  const response = NextResponse.next();

  // 3. Define the Content Security Policy for Clerk
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com;
    connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com;
    img-src 'self' blob: data: https://img.clerk.com https://*.clerk.com;
    worker-src 'self' blob:;
    style-src 'self' 'unsafe-inline';
    frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com;
  `.replace(/\s{2,}/g, ' ').trim();

  // 4. Apply the headers
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};