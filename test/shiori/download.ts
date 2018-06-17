import * as fs from "fs";
import * as path from "path";
import * as shiori from "shiori-dll-downloader";

// tslint:disable no-console

export async function installDll(shioriType: shiori.ShioriType, dir: string = shioriType) {
    const downloads = shiori[shioriType]();
    const dllPath = path.join(__dirname, dir, downloads.dllName);
    if (fs.existsSync(dllPath)) {
        console.warn(`[${shioriType}] already exists ${dllPath}`);
        return;
    }
    await downloads.installDll(path.join(__dirname, dir));
    console.warn(`[${shioriType}] downloaded ${dllPath}`);
}

export async function installAll() {
    await installDll("aya5", "aya5-sjis");
    await installDll("aya5", "aya5-utf8");
    await installDll("kawari");
    await installDll("kawari7");
    await installDll("misaka");
    await installDll("satori");
    await installDll("yaya", "yaya-sjis");
    await installDll("yaya", "yaya-utf8");
}

installAll();
