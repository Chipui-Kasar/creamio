import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // three.js objects (cameras, materials, instanced meshes) are mutated imperatively inside
    // useFrame / layout effects — the standard react-three-fiber pattern. The React Compiler
    // immutability rules do not model that, so they are relaxed for the 3D code only.
    files: ["src/components/shop/**/*.{ts,tsx}", "src/components/hero/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
  {
    // "detect after mount" hooks (device capabilities, URL params) must set state in an effect
    // so server and first client render match.
    files: ["src/hooks/**/*.{ts,tsx}", "src/app/render/**/*.{ts,tsx}"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
]);

export default eslintConfig;
