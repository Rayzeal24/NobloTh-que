export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
