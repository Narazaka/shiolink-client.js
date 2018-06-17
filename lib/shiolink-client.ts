import { RawShiori } from "shiori-encode-layer";
import * as uuidv4 from "uuid/v4";

const crlf = "\x0d\x0a";

export class ShiolinkClient implements RawShiori {
    input: NodeJS.ReadableStream;
    output: NodeJS.WritableStream;

    constructor(input: NodeJS.ReadableStream, output: NodeJS.WritableStream) {
        this.input = input;
        this.output = output;
    }

    load(dirpath: string) {
        return new Promise<number>((resolve, reject) => {
            this.output.write(`*L:${dirpath}${crlf}`, (error: any) => error ? reject(error) : resolve(1));
        });
    }

    request(request: Buffer) {
        const checkRequest = `*S:${uuidv4()}${crlf}`;
        return new Promise((resolve, reject) => {
            this.input.once("data", (checkResponseBuffer: Buffer) => {
                const checkResponse = checkResponseBuffer.toString("utf8");
                if (checkRequest !== checkResponse) reject(new Error(`WRONG CHECK CODE [${checkResponse}]`));
                resolve();
            });
            this.output.write(checkRequest);
        }).then(() => new Promise<Buffer>((resolve) => {
            this.input.once("data", (response: Buffer) => {
                resolve(response);
            });
            this.output.write(request);
        }));
    }

    unload() {
        return new Promise<number>((resolve, reject) => {
            this.output.write(`*U:${crlf}`, (error: any) => error ? reject(error) : resolve(1));
        });
    }
}
