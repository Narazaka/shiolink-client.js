import { ShiolinkClient } from "./shiolink-client";
import { ShioriEncodeLayer } from "shiori-encode-layer";

import {spawn } from "child_process";

const ps = spawn(".\\shiolink_adapter.exe", [".\\akos\\satori.dll"]);
// const ps = spawn(".\\shiolink_adapter.exe", [".\\master\\yaya.dll"]);
// const ps = spawn(".\\shiolink_adapter.exe", [".\\shiori.dll"]);

ps.stdout.resume();

const client = new ShioriEncodeLayer( new ShiolinkClient(ps.stdout, ps.stdin));

const crlf = "\x0d\x0a";

ps.on("close", (code, sig) => console.error(`CLOSE ${code} ${sig}`));

async function main() {
    try {
        console.log(await client.load(process.cwd() + "\\akos\\"));
        // console.log(await client.load(process.cwd() + "\\master\\"));
        // console.log(await client.load(process.cwd() + "\\"));
        console.log(await client.request(`GET SHIORI/3.0${crlf}Charset: Shift_JIS${crlf}ID: version${crlf}${crlf}`));
        console.log(await client.request(`GET SHIORI/3.0${crlf}Charset: Shift_JIS${crlf}ID: OnTest${crlf}Reference0: ソビエトロシア${crlf}${crlf}`));
        console.log(await client.request(`GET SHIORI/3.0${crlf}Charset: Shift_JIS${crlf}ID: OnBoot${crlf}Reference0: ソビエトロシア${crlf}${crlf}`));
        console.log(await client.unload());
    }catch(e){
        console.error("error!");
        console.error(e);
        process.exit(1);
    }
}

main();
