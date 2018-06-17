# shiolink-client.js

[![npm](https://img.shields.io/npm/v/shiolink-client.svg)](https://www.npmjs.com/package/shiolink-client)
[![npm license](https://img.shields.io/npm/l/shiolink-client.svg)](https://www.npmjs.com/package/shiolink-client)
[![npm download total](https://img.shields.io/npm/dt/shiolink-client.svg)](https://www.npmjs.com/package/shiolink-client)
[![npm download by month](https://img.shields.io/npm/dm/shiolink-client.svg)](https://www.npmjs.com/package/shiolink-client)

[![Dependency Status](https://david-dm.org/Narazaka/shiolink-client.js/status.svg)](https://david-dm.org/Narazaka/shiolink-client.js)
[![devDependency Status](https://david-dm.org/Narazaka/shiolink-client.js/dev-status.svg)](https://david-dm.org/Narazaka/shiolink-client.js?type=dev)
[![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/github/Narazaka/shiolink-client.js?svg=true&branch=master)](https://ci.appveyor.com/project/Narazaka/shiolink-client-js)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/be433c11636a4a5bad59fe94a976a4b7)](https://www.codacy.com/app/narazaka/shiolink-client.js?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Narazaka/shiolink-client.js&amp;utm_campaign=Badge_Grade)
[![Greenkeeper badge](https://badges.greenkeeper.io/Narazaka/shiolink-client.js.svg)](https://greenkeeper.io/)

SHIOLINK client SHIORI

標準入出力からSHIOLINKプロトコルを受け渡すことでSHIORIと通信する

## Install

```bash
npm install shiolink-client
```

## Usage

```typescript
import { spawn } from "child_process";
import { ShioriEncodeLayer } from "shiolink-client"; // for charset convert
import { Shiorif } from "shiorif";

async function main() {
    const ps = spawn("shiolink_adapter.exe", ["ghost/master/shiori.dll"]);
    ps.stdout.resume();

    const shiorif = new Shiorif(new ShioriEncodeLayer(new ShiolinkClient(ps.stdout, ps.stdin)));
    await shiorif.load("C:\\ukagaka\\ghost\\master\\");
    await shiorif.getVersion2();
    await shiorif.get3("OnBoot").then((tx) => console.log(tx.response.toString()));
    await shiorif.unload();
}
main();
```

## License

This is released under [Zlib License](http://narazaka.net/license/Zlib?2018).
