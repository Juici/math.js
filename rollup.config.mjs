import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

import emitModulePackageJson from "./build-plugins/emit-module-package-json.mjs";

/**
 * @typedef {import("rollup").ModuleFormat} ModuleFormat
 * @typedef {import("rollup").OutputOptions} OutputOptions
 * @typedef {import("rollup").Plugin} Plugin
 * @typedef {import("rollup").RollupOptions} RollupOptions
 * @typedef {import("rollup").WarningHandlerWithDefault} WarningHandlerWithDefault
 */

/**
 * @type {WarningHandlerWithDefault}
 */
function onwarn(warning, rollupWarn) {
  rollupWarn(warning);
  if (warning.code === "CIRCULAR_DEPENDENCY") {
    throw new Error("Please eliminate the circular dependencies listed above and retry the build");
  }
}

/**
 * @param {ModuleFormat} format
 * @returns {"commonjs" | "module"}
 */
function packageType(format) {
  switch (format) {
    case "es":
    case "esm":
      return "module";
    default:
      return "commonjs";
  }
}

/**
 * @param {OutputOptions & { format: ModuleFormat }} output
 * @param {Array<Plugin>} plugins
 * @returns {RollupOptions}
 */
function buildConfig(output, plugins = []) {
  return {
    input: "src/index.ts",
    output: {
      externalLiveBindings: false,
      generatedCode: {
        arrowFunctions: true,
        constBindings: true,
        objectShorthand: true,
        symbols: true,
      },
      sourcemap: true,
      ...output,
    },
    plugins: [
      nodeResolve(),
      json({ preferConst: true }),
      commonjs({ sourceMap: true }),
      typescript({ sourceMap: true, exclude: ["**/__tests__/**"] }),
      emitModulePackageJson(packageType(output.format)),
      ...plugins,
    ],
    strictDeprecations: true,
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
    onwarn,
  };
}

/**
 * @param {Record<string, unknown>} _command
 * @returns {Promise<RollupOptions | Array<RollupOptions>}
 */
export default async function config(_command) {
  return [
    buildConfig({
      file: "dist/cjs/index.js",
      format: "cjs",
    }),
    buildConfig({
      file: "dist/esm/index.js",
      format: "esm",
    }),
  ];
}
