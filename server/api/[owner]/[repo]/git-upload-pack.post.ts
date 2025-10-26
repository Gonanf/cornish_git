export default eventHandler(async (event) => {
    const protocol = getRequestHeader(event,"Git-Protocol");
    if (!/version=2/.test(protocol!) || !protocol){
        throw createError({
        statusCode: 400,
        statusMessage: 'Not supported protocol version',
        })
    }
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
        
    }
})