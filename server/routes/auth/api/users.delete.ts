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
      const tokenHash: string | undefined = input.tokenHash ? String(input.tokenHash) : undefined;
      if (!owner) {
        return json({ error: "owner required" }, 400);
      }
      if (!token && !tokenHash) {
        await stub.deleteOwner(owner);
        return json({ ok: true });
      }
      if (tokenHash) {
        await stub.deleteTokenByHash(owner, tokenHash);
        return json({ ok: true });
      }
      if (token) {
        await stub.deleteToken(owner, token);
        return json({ ok: true });
      }
      return json({ ok: true });
})
