/**
 * @typedef {import("eslint").Linter.Config} ESLintConfig
 */

/** @type {ESLintConfig} */
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:markdown/recommended",
    "plugin:import/errors",
    "plugin:eslint-comments/recommended",
    "plugin:prettier/recommended",
  ],
  env: {
    es2020: true,
    "shared-node-browser": true,
  },
  globals: {
    console: "readonly",
  },
  overrides: [
    {
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:import/typescript",
      ],
      files: ["*.ts"],
      plugins: ["@typescript-eslint/eslint-plugin"],
      parserOptions: {
        project: "tsconfig.json",
      },
      rules: {
        "@typescript-eslint/array-type": ["error", { default: "generic" }],
        "@typescript-eslint/ban-types": "error",
        "@typescript-eslint/no-inferrable-types": [
          "error",
          {
            ignoreParameters: true,
            ignoreProperties: true,
          },
        ],
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/prefer-includes": "warn",
        "@typescript-eslint/prefer-literal-enum-member": [
          "error",
          { allowBitwiseExpressions: true },
        ],
        "@typescript-eslint/prefer-nullish-coalescing": "warn",
        "@typescript-eslint/prefer-optional-chain": "warn",
        // "@typescript-eslint/prefer-readonly-parameter-types": "warn",
        "@typescript-eslint/prefer-string-starts-ends-with": "warn",
        "@typescript-eslint/prefer-ts-expect-error": "error",
        "@typescript-eslint/explicit-module-boundary-types": "error",

        // TS verifies these.
        "consistent-return": "off",
        "no-dupe-class-members": "off",
        "no-unused-vars": "off",

        "import/no-anonymous-default-export": [
          "error",
          {
            allowAnonymousClass: false,
            allowAnonymousFunction: false,
            allowArray: false,
            allowArrowFunction: false,
            allowCallExpression: false,
            allowLiteral: false,
            allowObject: true,
          },
        ],
      },
    },
    {
      extends: ["plugin:jest/recommended", "plugin:jest/style"],
      files: ["matchers/**", "**/__tests__/**"],
      rules: {
        "import/no-extraneous-dependencies": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "no-console": "off",
      },
    },
    {
      files: [
        "build-plugins/**",
        "scripts/**",
        ".eslintrc.cjs",
        "jest.config.mjs",
        "rollup.config.mjs",
      ],
      env: {
        node: true,
      },
      rules: {
        "no-console": "off",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  plugins: ["import", "jest"],
  rules: {
    "eslint-comments/disable-enable-pair": ["error", { allowWholeFile: true }],
    "eslint-comments/no-unused-disable": "error",

    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/__tests__/**",
          "build-plugins/**",
          "matchers/**",
          "scripts/**",
          ".eslintrc.cjs",
          "jest.config.mjs",
          "rollup.config.mjs",
        ],
      },
    ],
    "import/no-unresolved": "error",
    "import/order": [
      "error",
      {
        alphabetize: {
          order: "asc",
        },
        groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
        "newlines-between": "always",
      },
    ],

    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/valid-expect": "error",

    "no-array-constructor": "error",
    "no-caller": "error",
    "no-console": ["warn", { allow: ["warn", "error", "time", "timeEnd", "timeStamp"] }],
    "no-eval": "error",
    "no-extend-native": "warn",
    "no-extra-bind": "warn",
    "no-floating-decimal": "error",
    "no-implied-eval": "error",
    "no-label-var": "warn",
    "no-labels": ["error", { allowLoop: true, allowSwitch: true }],
    "no-multi-str": "error",
    "no-new": "warn",
    "no-new-func": "error",
    "no-new-object": "warn",
    "no-new-wrappers": "warn",
    "no-octal-escape": "warn",
    "no-proto": "error",
    "no-restricted-globals": [
      "error",
      {
        name: "global",
        message: "Use `globalThis` instead.",
      },
    ],
    "no-self-compare": "warn",
    "no-sequences": "warn",
    "no-throw-literal": "error",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-useless-call": "error",
    "no-useless-computed-key": "error",
    "no-useless-concat": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "operator-assignment": ["warn", "always"],
    "prefer-arrow-callback": ["error", { allowNamedFunctions: true }],
    "prefer-const": "error",
    "prefer-rest-params": "warn",
    "prefer-spread": "warn",
    "prefer-template": "error",
    quotes: ["error", "double", { allowTemplateLiterals: true, avoidEscape: false }],
    radix: "warn",
    "sort-imports": ["error", { ignoreDeclarationSort: true }],
  },
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
};
