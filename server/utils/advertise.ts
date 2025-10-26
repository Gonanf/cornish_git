import {H3Event, EventHandlerRequest} from 'h3'

export const FLUSH = "0000";
export const DELIMETER = "0001";
export const END = "0002";

export class GitPKT {

    data: Uint8Array | undefined;
    constructor(array?: Array<string | Uint8Array>){
        if (!array) return;

        //Convert all strings into a stream of bytes
        const transformed: Array<Uint8Array> = array.map(x => typeof x === "string" ? this.formatPKT(new TextEncoder().encode(x)) : this.formatPKT(x));
        
        //Get the size of all (items + header) + a final flush
        this.data = new Uint8Array(transformed.reduce((acc,x) => acc + x.byteLength,0) + 4);

        transformed.reduce((acc,x) => {
            this.data?.set(x,acc);
            return acc + x.byteLength;
        },0)

        //Then finish the message
        this.data?.set(new TextEncoder().encode(FLUSH),this.data.byteLength - 4);
    }
    
    //Format a string to the Git wire protocol
    formatPKT(item: Uint8Array): Uint8Array{
        //The total length of the payload (The size + header of 4 bytes)
        const len = item.byteLength + 4
        const header = new TextEncoder().encode(len.toString(16).padStart(4, "0"));

        const result = new Uint8Array(header.byteLength + item.byteLength);
        
        //Add the header first
        result.set(header,0)
        //Add the payload after the header (+4)
        result.set(item,header.byteLength)

        return result;
    }

    get value(){
        return this.data;
    }
}

export function AdverticeUpload(event: H3Event){
    const message = new GitPKT([
        "version 2\n",
        "agent=cornish_git/0.1\n",
        "ls-refs\n",
        "fetch\n",
        "side-band-64k\n",
        "ofs-delta\n",
        "object-format=sha1\n"
    ]);

    setResponseStatus(event, 202);
    appendResponseHeaders(event,{
        "Content-Type": "application/x-git-upload-pack-advertisement",
        "Cache-Control": "no-cache",
    });

    return message.data;
}

