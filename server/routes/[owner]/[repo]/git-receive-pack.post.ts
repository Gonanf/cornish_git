import { verifyAuth } from "$/auth";
import { repoKey } from "$/keys";
import { handleReceivePackPOST } from "$/routes/git";

export default defineEventHandler(async (event) => {
  const owner = getRouterParam(event,'owner');
    const repo = getRouterParam(event,'repo');
  if (!(await verifyAuth(event.context.cloudflare.env, owner!, event.context.cloudflare.request, false))) {
        return new Response("Unauthorized\n", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="Git", charset="UTF-8"' },
        });
      }
    console.log(event.context.cloudflare.env)
      const body = await readRawBody(event);
    const res = await handleReceivePackPOST(event.context.cloudflare.env, repoKey(owner!, repo!), event.context.cloudflare.request,body!);
    
  return res;
})
