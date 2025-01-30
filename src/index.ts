import { ZLangParser } from "./parser/parser";
import fs from "fs";
function main(){
    const f = fs.readFileSync("./test/simple.zr",{encoding:"utf-8"});
    const zl = ZLangParser.parse(f);
    console.log(JSON.stringify(zl));
}
main();
