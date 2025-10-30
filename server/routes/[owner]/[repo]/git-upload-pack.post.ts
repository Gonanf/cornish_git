import { handleUploadPackPOST  } from "$/routes/git";
import { repoKey } from "$/keys";
export default eventHandler(async (event) => {
    const owner = getRouterParam(event,'owner');
    const repo = getRouterParam(event,'repo');

    return handleUploadPackPOST(event.context.cloudflare.env, repoKey(owner!, repo!), event.context.cloudflare.request, event.context.cloudflare.context);
})
