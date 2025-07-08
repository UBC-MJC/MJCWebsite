// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import * as reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
    {
        ignores: ["node_modules", "dist", "./eslint.config.mjs"],
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
    {
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
        plugins: {
            react: reactPlugin,
            reactHooks: reactHooks,
        },
        languageOptions: {
            ...reactPlugin.configs.flat.recommended.languageOptions,
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...reactPlugin.configs.flat["jsx-runtime"].rules,
            "no-console": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
        },
        settings: {
            react: {
                version: "detect", // Automatically detect the React version
            },
        },
    },
);
