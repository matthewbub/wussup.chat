import * as reactPlugin from "vite-plugin-react";
import type { UserConfig } from "vite";
import path from "path";

const config: UserConfig = {
  jsx: "react",
  plugins: [reactPlugin],
  define: {
    "process.env.NODE_ENV": process.env.NODE_ENV,
  },
  resolvers: [
    {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  ],
};

export default config;
