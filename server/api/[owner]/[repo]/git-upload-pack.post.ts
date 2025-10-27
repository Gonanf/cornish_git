export default eventHandler(async (event) => {
    const protocol = getRequestHeader(event,"Git-Protocol");
    if (!/version=2/.test(protocol!) || !protocol){
        throw createError({
        statusCode: 400,
        statusMessage: 'Not supported protocol version',
        })
    }

    const owner = getRouterParam(event,'owner');
    const repo = getRouterParam(event,'repo');
    const raw_body = await readRawBody(event);

    const data = new GitPKT().parsePKT(new TextEncoder().encode(raw_body)).parseCommand();

    if (!data?.command){
        throw createError({
        statusCode: 400,
        statusMessage: 'Command not found',
        })
    }

    console.log(data);
    
    if (data!.command === "ls-refs"){
        const CORNISH_GIT = event.context.cloudflare.env
        const temp_id = CORNISH_GIT.DO.idFromName(owner + "/" + repo);
        const stub = CORNISH_GIT.DO.get(temp_id);
        const head = await stub.storage.get("head");
        const refs = await stub.storage.get("refs")
        
        const target = stored?.target || "refs/heads/main";
        const match = refs.find((r) => r.name === target);
        const resolved = match
        ? ({ target, oid: match.oid } as Head)
        : ({ target, unborn: true } as Head);

        
    return new Response(resolved, {
      status: 200,
      headers: {
        "Content-Type": "application/x-git-upload-pack-result",
        "Cache-Control": "no-cache",
      },
    });
    }
})
