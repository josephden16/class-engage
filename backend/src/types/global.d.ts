import "express-session";

declare module "express-session" {
  interface SessionData {
    auth_action?: "signin" | "signup";
  }
}
