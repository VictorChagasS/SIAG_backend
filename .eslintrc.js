module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: [
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js", "commitlint.config.js"],
  settings: {
    "import/extensions": [".js", ".ts"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
      alias: {
        map: [["@", __dirname]],
        extensions: [".js", ".ts", ".d.ts"],
      },
    },
  },
  rules: {
    "no-nested-ternary": "off",
    "consistent-return": "off",
    "array-callback-return": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "import/prefer-default-export": "off",
    "no-param-reassign": "off",
    "import/no-extraneous-dependencies": "off",
    "func-style": ["error", "declaration"],
    "prefer-arrow-callback": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "linebreak-style": "off",
    "no-console": "warn",
    "class-methods-use-this": "off",
    "max-classes-per-file": "off",
    "max-len": "off",
    "import/no-cycle": "off",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    semi: ["error", "always"],
    eqeqeq: ["error", "always"],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "function",
        format: ["camelCase", "PascalCase"],
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
      {
        selector: ["interface", "typeAlias"],
        format: ["PascalCase"],
        prefix: ["I"],
      },
    ],
  },
};