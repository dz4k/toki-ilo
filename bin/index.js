
import toki_ilo from "../lib/toki-ilo.mjs";
import fs from "node:fs/promises"

await toki_ilo(await fs.readFile(0, "utf-8"))
