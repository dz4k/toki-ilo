
import toki_ilo from "./toki-ilo.mjs";
import fs from "node:fs"

toki_ilo(fs.readFileSync(0, "utf-8"))
