import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import unusedImports from "eslint-plugin-unused-imports";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

export default [{
    files: ["src/**/*.{ts,js,vue}"],
    ignores: [".gitignore"],
    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: "module",
        parserOptions: {},
    },

    plugins: {
        "unused-imports": unusedImports,
        "@typescript-eslint": typescriptEslint,
    },

    rules: {
        "no-console": "off",
        "no-debugger": "off",
        "prefer-destructuring": "off",
        camelcase: "off",

        "no-use-before-define": ["error", {
            variables: true,
            functions: false,
            classes: true,
        }],

        "max-classes-per-file": ["error", 1],

        "no-global-assign": ["error", {
            exceptions: ["Object"],
        }],

        "no-unneeded-ternary": "error",
        "import/prefer-default-export": "off",
        "guard-for-in": "error",
        "arrow-parens": "off",
        semi: "warn",
        "arrow-body-style": "off",
        
        "quotes": ["error", "single", { "avoidEscape": true }],
        "quote-props": ["error", "as-needed"],

        "no-multiple-empty-lines": ["error", {
            max: 2,
            maxBOF: 1,
        }],

        "lines-between-class-members": "off",
        yoda: "error",
        "no-unused-vars": "off",
        "no-bitwise": "off",
        "no-plusplus": "off",
        "class-methods-use-this": "warn",
        "linebreak-style": 0,
        "function-paren-newline": "off",
        "unused-imports/no-unused-imports": "warn",

        "id-denylist": [
            "warn",
            "seed",
            "direction",
            "clone",
            "normalize",
            "setAttribute",
            "done",
            "all",
            "translate",
            "scale",
            "rotate",
            "position",
            "rotation",
            "children",
            "parent",
            "remove",
            "setRotation",
            "textureRepeat",
            "load",
            "image",
            "width",
            "height",
        ],

        "unused-imports/no-unused-vars": ["warn", {
            vars: "all",
            varsIgnorePattern: "^_",
            args: "after-used",
            argsIgnorePattern: "^_",
        }],

        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": ["error"],
    },

    settings: {
        "import/resolver": {
            typescript: {},
        },
    },
}, {
    files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/unit/**/*.spec.{j,t}s?(x)"],

    languageOptions: {
        globals: {
            ...globals.jest,
        },
    },
}];
