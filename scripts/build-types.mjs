import { createRequire } from "module";
import path from "path";
import process from "process";
import url from "url";

import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import chalk from "chalk";
import deepmerge from "deepmerge";
import fs from "graceful-fs";
import { packageDirectory as pkgDir } from "pkg-dir";
import prettier from "prettier";
import ts from "typescript";

const require = createRequire(import.meta.url);
const __filename = url.fileURLToPath(import.meta.url);

const root = path.resolve(__filename, "../..");

const buildDir = path.resolve(root, "build");

const tsconfigFile = path.resolve(root, "tsconfig.json");
const packageJsonFile = path.resolve(root, "package.json");

const inputTsFile = path.resolve(root, "src/index.ts");
const inputDtsFile = path.resolve(root, "build/src/index.d.ts");

const typescriptCompilerFolder = await pkgDir({ cwd: require.resolve("typescript") });
if (typescriptCompilerFolder === root) {
  console.log(chalk.red("Failed to find typescript compiler module"));
  process.exit(1);
}

// Remove build directory.
await removeBuildDir();

// Read the base config from the tsconfig.json file.
const tsconfig = await readTsConfig(tsconfigFile);

const prettierConfig = await prettier.resolveConfig(__filename);

// Compile TypeScript definition files.
{
  const compilerOptions = await parseCompilerOptions(tsconfig);

  const program = ts.createProgram([inputTsFile], {
    ...compilerOptions,
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
    declarationDir: buildDir,
  });

  console.log();
  console.log(chalk.blue("Compiling TypeScript definition files"));

  const emitResult = program.emit();
  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  if (emitDiagnostics(diagnostics)) {
    process.exit(1);
  }

  // Check for compiled definition files.
  const stats = await fs.promises.stat(inputDtsFile);
  if (!stats.isFile()) {
    console.log(chalk.red(`Missing definition file at '${inputDtsFile}'`));
    process.exit(1);
  }

  console.log(chalk.green("Compiled TypeScript definition files"));
}

{
  console.log();
  console.log(chalk.blue("Extracting TypeScript definition files"));

  /**
   * @type {import("@microsoft/api-extractor").IConfigFile}
   */
  const config = {
    projectFolder: root,
    mainEntryPointFilePath: inputDtsFile,
    bundledPackages: [],
    newlineKind: "lf",
    compiler: {
      overrideTsconfig: deepmerge(tsconfig, {
        compilerOptions: {
          skipLibCheck: true,
        },
      }),
    },
    dtsRollup: {
      enabled: true,
      untrimmedFilePath: "<projectFolder>/dist/index.d.ts",
    },
    apiReport: { enabled: false },
    docModel: { enabled: false },
    tsdocMetadata: { enabled: false },
    messages: {
      compilerMessageReporting: {
        default: { logLevel: "warning" },
      },
      extractorMessageReporting: {
        "ae-forgotten-export": { logLevel: "none" },
        "ae-missing-release-tag": { logLevel: "none" },
        default: { logLevel: "warning" },
      },
      tsdocMessageReporting: {
        default: { logLevel: "none" },
      },
    },
  };

  const ignoredMessages = new Set([
    "ae-forgotten-export",
    "ae-missing-release-tag",
    "console-compiler-version-notice",
    "console-preamble",
    "console-writing-dts-rollup",
  ]);

  const extractorConfig = ExtractorConfig.prepare({
    configObject: deepmerge(ExtractorConfig._defaultConfig, config),
    packageJsonFullPath: packageJsonFile,
  });

  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
    typescriptCompilerFolder,
    messageCallback: (message) => {
      if (ignoredMessages.has(message.messageId)) {
        message.logLevel = "none";
      }
    },
  });

  if (!extractorResult.succeeded || extractorResult.warningCount > 0) {
    console.log(chalk.red("Unable to extract TypeScript definition files"));

    const errors = chalk.red(pluralize(extractorResult.errorCount, "error"));
    const warnings = chalk.yellow(pluralize(extractorResult.warningCount, "warning"));

    console.log(chalk.blackBright(`API Extractor completed with ${errors} and ${warnings}`));
    process.exit(1);
  }

  const outFile = extractorResult.extractorConfig.untrimmedFilePath;
  const relativePath = chalk.bold(path.relative(root, outFile));

  // Remove build directory.
  await removeBuildDir();

  const definitions = await fs.promises.readFile(outFile, "utf-8");

  const formattedDefinitions = prettier.format(definitions, {
    ...prettierConfig,
    filepath: outFile,
  });

  await fs.promises.writeFile(outFile, formattedDefinitions);

  console.log(chalk.green(`Extracted TypeScript definition files to ${relativePath}`));
}

async function removeBuildDir() {
  await fs.promises.rm(buildDir, { force: true, recursive: true, maxRetries: 3 });
}

/**
 * @param {string} file
 */
async function readTsConfig(file) {
  const configJson = await fs.promises.readFile(file, "utf-8");

  const { config, error } = ts.parseConfigFileTextToJson(file, configJson);
  if (error && emitDiagnostics(error)) {
    process.exit(1);
  }

  return config;
}

/**
 * @param {string} file
 * @return {ts.CompilerOptions}
 */
async function parseCompilerOptions(config, file = tsconfigFile) {
  const { options, errors } = ts.convertCompilerOptionsFromJson(
    config?.compilerOptions ?? {},
    root,
    file,
  );
  if (emitDiagnostics(errors)) {
    process.exit(1);
  }

  return options;
}

/**
 * @param {ts.Diagnostic | Array<ts.Diagnostic>} diagnostics
 * @returns {boolean}n
 */
function emitDiagnostics(diagnostics) {
  if (!Array.isArray(diagnostics)) {
    diagnostics = [diagnostics];
  }

  let error = false;

  diagnostics.forEach((diagnostic) => {
    let color = chalk.reset;
    switch (diagnostic.category) {
      case ts.DiagnosticCategory.Warning:
        color = chalk.yellow;
        break;
      case ts.DiagnosticCategory.Error:
        color = chalk.red;
        error = true;
        break;
      case ts.DiagnosticCategory.Suggestion:
        color = chalk.blue;
        break;
    }

    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start,
      );
      message = `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
    }

    console.log(color(message));
  });

  return error;
}

function pluralize(n, singular, plural) {
  if (!plural) {
    plural = `${singular}s`;
  }
  const rules = new Intl.PluralRules([], { type: "cardinal" });
  const rule = rules.select(n);
  return `${n} ${rule === "one" ? singular : plural}`;
}
