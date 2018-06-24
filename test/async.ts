import * as assert from "assert";
import { spawn } from "child_process";
import * as path from "path";
import { ShioriEncodeLayer } from "shiori-encode-layer";
import { Shiorif } from "shiorif";
import { ShiolinkClient } from "../lib/shiolink-client";

const shiolinkAdapterPath = path.join(__dirname, "shiolink_adapter.exe");
const dllpath = (dir: string, dll: string) => path.join(__dirname, "shiori", dir, dll);
const dirpath = (dir: string) => path.join(__dirname, "shiori", dir) + path.sep;

const shioris = [
    {charset: "Shift_JIS", dir: "kawari", dll: "shiori.dll"},
];

describe("ShiolinkClient", () => {
    for (const shiori of shioris) {
        describe(`${shiori.dir}`, () => {
            it("works for async many iterations", async () => {
                const ps = spawn(shiolinkAdapterPath, [dllpath(shiori.dir, shiori.dll)]);
                ps.stdout.resume();

                const client = new ShioriEncodeLayer(new ShiolinkClient(ps.stdout, ps.stdin));
                ps.on("close", (code) => {
                    assert.equal(code, 0);
                });

                const shiorif = new Shiorif(client);
                shiorif.synchronized = true;
                shiorif.autoConvertRequestVersion = "3.0";
                shiorif.autoAdjustToResponseCharset = true;
                shiorif.defaultHeaders = {
                    Charset: "Shift_JIS",
                    Sender: "materia",
                };

                assert.equal(await shiorif.load(dirpath(shiori.dir)), 1);

                const transactionPromises = [];
                for (let i = 0; i < 1000; ++i) {
                    transactionPromises.push(shiorif.get3("OnTest", {Reference0: "ソビエトロシアテスト"}));
                }
                const transactions = await Promise.all(transactionPromises);
                transactions.forEach((transaction) =>
                    assert.equal(transaction.response.to("3.0").headers.Value, "能勢電鉄の表現とソビエトロシアテストテストだよ"),
                );

                assert.equal(await shiorif.unload(), 1);
            });
        });
    }
});
