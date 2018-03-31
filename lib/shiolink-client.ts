import { Shiori } from "shioriloader";
import * as uuidv4 from "uuid/v4";

const crlf = "\x0d\x0a";

export class ShiolinkClient implements Shiori {
    input: NodeJS.ReadableStream;
    output: NodeJS.WritableStream;

    constructor(input: NodeJS.ReadableStream, output: NodeJS.WritableStream) {
        this.input = input;
        this.output = output;
    }

    load(dirpath: string) {
        return new Promise<number>((resolve, reject) => {
            this.output.write(`*L:${dirpath}${crlf}`, (error: any) => error ? reject(error) : resolve());
        });
    }

    request(request: string) {
        const checkRequest = `*S:${uuidv4()}${crlf}`;
        return new Promise((resolve, reject) => {
            this.input.once("data", (error, checkResponse) => {
                if (error) return reject(error);
                if (checkRequest !== checkResponse) reject();
                resolve();
            });
            this.output.write(checkRequest);
        }).then(() => new Promise<string>((resolve, reject) => {
            this.input.once("data", (error, response) => {
                if (error) return reject(error);
                resolve(response);
            });
            this.output.write(request);
        }));
    }

    unload() {
        return new Promise<number>((resolve, reject) => {
            this.output.write(`*U:${crlf}`, (error: any) => error ? reject(error) : resolve());
        });
    }
}
