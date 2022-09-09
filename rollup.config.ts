import type { OutputOptions, Plugin, RollupOptions } from "rollup";

import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

function buildConfig(
  output: OutputOptions,
  plugins: Plugin[] = [],
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

export default async function (
  _command: Record<string, unknown>,
): Promise<RollupOptions | RollupOptions[]> {
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
