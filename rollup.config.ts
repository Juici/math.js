import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

import type { OutputOptions, Plugin, RollupOptions } from "rollup";

function buildConfig(
  output: OutputOptions,
  plugins: Array<Plugin> = [],
): RollupOptions {
  return {
    input: "src/index.ts",
    output,
    plugins: [
      nodeResolve(),
      json({ preferConst: true }),
      commonjs(),
      typescript({ removeComments: true }),
      ...plugins,
    ],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
  };
}

export default async function config(
  _command: Record<string, unknown>,
): Promise<RollupOptions | Array<RollupOptions>> {
  return [
    buildConfig({
      file: "dist/index.cjs",
      format: "cjs",
    }),
    buildConfig({
      file: "dist/index.mjs",
      format: "esm",
    }),
  ];
}
