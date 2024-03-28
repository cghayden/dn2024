import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import { getUserById } from "~/models/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(
  request: Request,
): Promise<User["userId"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

// requireUser > (requireUserId(userId or redirect) > getUserId(userID off Session))
export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  // no userId redirects to welcome

  const user = await getUserById(userId);
  if (user) return user;
  if (!user) {
    // the userId returned from session is not valid -- clear any stale cookies(db may have been reset in development)
    logout(request);
  }
  throw await logout(request);
}

//get UserId from session, (checks for a logged in user)
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/welcome?${searchParams}`);
  }
  return userId;
}

export async function createUserSession({
  request,
  userId,
  type,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  type: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/welcome", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
