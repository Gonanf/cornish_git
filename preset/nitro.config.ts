import type { NitroPreset } from "nitropack";
import { fileURLToPath } from "node:url";

export default <NitroPreset>{
    extends: "cloudflare-module",
    entry: fileURLToPath(new URL("./entry.ts", import.meta.url)),
    rollupConfig: {
    output: {
      format: "esm",
      exports: "named",
    },
  },
};
