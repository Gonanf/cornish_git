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
      const input = await event.context.cloudflare.request.json().catch(() => ({}));
      const owner = String(input.owner || "").trim();
      const token: string | undefined = input.token ? String(input.token) : undefined;
      const tokens: string[] | undefined = Array.isArray(input.tokens)
        ? input.tokens.map(String)
        : undefined;
      if (!owner || (!token && !tokens)) {
        return json({ error: "owner and token(s) required" }, 400);
      }
      const toAdd: string[] = [];
      if (token) toAdd.push(token);
      if (tokens) toAdd.push(...tokens);
      const res = await stub.addTokens(owner, toAdd);
      return json(res);
})
