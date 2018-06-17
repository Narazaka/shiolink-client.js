import * as assert from "assert";
import { spawn } from "child_process";
import * as path from "path";
import { ShioriEncodeLayer } from "shiori-encode-layer";
import { Shiorif } from "shiorif";
import * as ShioriJK from "shiorijk";
import { ShiolinkClient } from "../lib/shiolink-client";

const shiolinkAdapterPath = path.join(__dirname, "shiolink_adapter.exe");
const dllpath = (dir: string, dll: string) => path.join(__dirname, "shiori", dir, dll);
const dirpath = (dir: string) => path.join(__dirname, "shiori", dir) + path.sep;

const shioris = [
    {charset: "Shift_JIS", dir: "aya5-sjis", dll: "aya5.dll"},
    {charset: "UTF-8", dir: "aya5-utf8", dll: "aya5.dll"},
    {charset: "Shift_JIS", dir: "kawari", dll: "shiori.dll"},
    {charset: "Shift_JIS", dir: "kawari7", dll: "shiori.dll"},
    {charset: undefined, dir: "misaka", dll: "misaka.dll"},
    {charset: "Shift_JIS", dir: "satori", dll: "satori.dll"},
    {charset: "Shift_JIS", dir: "yaya-sjis", dll: "yaya.dll"},
    {charset: "UTF-8", dir: "yaya-utf8", dll: "yaya.dll"},
];

describe("ShiolinkClient", () => {
    for (const shiori of shioris) {
        describe(`${shiori.dir}`, () => {
            it("works", async () => {
                const ps = spawn(shiolinkAdapterPath, [dllpath(shiori.dir, shiori.dll)]);
                ps.stdout.resume();

                const client = new ShioriEncodeLayer(new ShiolinkClient(ps.stdout, ps.stdin));
                ps.on("close", (code) => {
                    assert.equal(code, 0);
                });

                const shiorif = new Shiorif(client);
                shiorif.autoConvertRequestVersion = "2.6";
                shiorif.autoAdjustToResponseCharset = true;
                shiorif.defaultHeaders = {
                    Charset: "Shift_JIS",
                    Sender: "materia",
                };

                assert.equal(await shiorif.load(dirpath(shiori.dir)), 1);

                let getVersionString = await client.request(new ShioriJK.Message.Request({
                    request_line: {version: "2.6", method: "GET Version"},
                    headers: {
                        Charset: "Shift_JIS",
                        Sender: "materia",
                    },
                }).toString());
                // for misaka
                getVersionString = getVersionString.replace(/\x0d\x0a\x0d\x0a\x0d\x0a/, "\x0d\x0a\x0d\x0a");
                const getVersion = {response: new ShioriJK.Shiori.Response.Parser().parse(getVersionString)};
                if (getVersion.response.status_line.version!.startsWith("3")) {
                    shiorif.autoConvertRequestVersion = "3.0";
                }
                if (getVersion.response.headers.header.Charset) {
                    shiorif.defaultHeaders.Charset = getVersion.response.headers.header.Charset;
                }
                const onBoot = (await shiorif.get3("OnBoot", {Reference0: "ソビエトロシア"})).response.to("3.0");
                assert.equal(onBoot.headers.Value, "能勢電鉄の表現とソビエトロシアだよ");
                assert.equal(onBoot.headers.header.Charset, shiori.charset);
                assert.equal(
                    (await shiorif.get3("OnTest", {Reference0: "ソビエトロシアテスト"})).response.to("3.0").headers.Value,
                    "能勢電鉄の表現とソビエトロシアテストテストだよ",
                );
                assert.equal(await shiorif.unload(), 1);
            });
        });
    }
});
