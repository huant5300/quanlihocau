export { auth as middleware } from "./auth.config";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\..*).*)"],
};
