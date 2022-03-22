
import toki_ilo from "../lib/toki-ilo.js";
import fs from "node:fs"

await toki_ilo(fs.readFileSync(0, "utf-8"))
