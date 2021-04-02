import { loadSwiplBinary } from "./swipl"
import { loadProgramFile } from "./util"

loadSwiplBinary("./swipl-wasm").then(async PL => {
    console.log("INIT")
    loadProgramFile(PL, await fetch("./main.pl"))
})
