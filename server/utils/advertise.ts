import {H3Event, EventHandlerRequest} from 'h3'

export const FLUSH = "0000";
export const DELIMETER = "0001";
export const END = "0002";

export type Item = {type: "line" | "flush" | "delim" | "end", data?: Uint8Array}

export class GitPKT {

    data?: Uint8Array;
    items?: Item[];
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

    parsePKT(pkt: Uint8Array){
        const text_decoder = new TextDecoder();
        let offset = 0;

        this.items = [];
        while (offset + 4 <= pkt.byteLength){
            //Get the header of the line
            const header = text_decoder.decode(pkt.subarray(offset,offset + 4));
            offset += 4;
            switch (header){
                case FLUSH:
                    this.items.push({type: "flush"});
                    break;
                case DELIMETER:
                    this.items.push({type: "delim"});
                    break;
                case END:
                    this.items.push({type: "end"});
                    break;
                default:
                    //Get the base 16 line lenght total
                    const h_len = parseInt(header,16);
                    const data = pkt.subarray(offset,offset + (h_len - 4));
                    offset += h_len - 4;
                    this.items.push({type: "line", data});
            }
        }
        return this;
    }

    parseCommand(){
        if (!this.items || this.items.length <= 0) return;
        
        let command = undefined;
        const args = [];

        let delim = false;
        for (const item of this.items){
            if (item.type === "delim") {delim = true; continue;}

            if (item.type !== "line") continue;

            const text = new TextDecoder().decode(item.data!).replace(/\r?\n$/, "");
            if (!delim){
                if (text.startsWith("command=")) {
                    command = text.slice("command=".length);
                }
            }
            else{
                args.push(text);
            }
        }

        return {command, args}
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

