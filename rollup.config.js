import typescript from "@rollup/plugin-typescript";
import { babel } from "@rollup/plugin-babel";

export default {
  input: "src/core/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "es",
    },
  ],
  external: ["react", "react-dom", "next", "jwt-decode"],
  plugins: [
    typescript(),
    babel({ babelHelpers: "bundled", extensions: [".ts", ".tsx"] }),
  ],
};
