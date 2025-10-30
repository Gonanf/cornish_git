import { getAuthStub, getBearerToken, json, tooManyAttempts, unauthorizedBearer } from "$/common";

export default defineEventHandler(async (event) => {
  const stub = getAuthStub(event.context.cloudflare.env);
      if (!stub) return new Response("Not configured\n", { status: 501 });
      const provided = getBearerToken(event.context.cloudflare.request);
      const clientIp = event.context.cloudflare.request.headers.get("CF-Connecting-IP") || "unknown";
      const auth = await stub.adminAuthorizeOrRateLimit(provided, clientIp);
      if (!auth.ok) {
        if (auth.status === 401) return unauthorizedBearer();
        if (auth.status === 429) return tooManyAttempts(auth.retryAfter);
        return unauthorizedBearer();
      }
      try {
        const users = await stub.getUsers();
        return json({ users });
      } catch {
        return json({ users: [] });
      }
})
