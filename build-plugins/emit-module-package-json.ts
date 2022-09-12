import type { Plugin } from "rollup";

export default function emitModulePackageJson(
  type: "commonjs" | "module",
): Plugin {
  return {
    name: "emit-module-package-json",
    generateBundle() {
      this.emitFile({
        fileName: "package.json",
        source: `{ "type": "${type}" }`,
        type: "asset",
      });
    },
  };
}
