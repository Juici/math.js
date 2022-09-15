/**
 * @typedef {import("rollup").Plugin} Plugin
 */

/**
 * @param {"commonjs" | "module"} type
 * @returns {Plugin}
 */
export default function emitModulePackageJson(type) {
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
