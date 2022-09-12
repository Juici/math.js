import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

import emitModulePackageJson from "./build-plugins/emit-module-package-json";

import type {
  ModuleFormat,
  OutputOptions,
  Plugin,
  RollupOptions,
  WarningHandlerWithDefault,
} from "rollup";

const onwarn: WarningHandlerWithDefault = (warning, rollupWarn) => {
  rollupWarn(warning);
  if (warning.code === "CIRCULAR_DEPENDENCY") {
    throw new Error(
      "Please eliminate the circular dependencies listed above and retry the build",
    );
  }
};

function packageType(format: ModuleFormat): "commonjs" | "module" {
  switch (format) {
    case "es":
    case "esm":
      return "module";
    default:
      return "commonjs";
  }
}

function buildConfig(
  output: OutputOptions & { format: ModuleFormat },
  plugins: Array<Plugin> = [],
): RollupOptions {
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
      typescript({ sourceMap: true }),
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

export default async function config(
  _command: Record<string, unknown>,
): Promise<RollupOptions | Array<RollupOptions>> {
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
