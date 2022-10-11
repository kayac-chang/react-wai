import { defineConfig } from "cypress";
import webpackConfig from "./webpack.config";

export default defineConfig({
  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
      webpackConfig,
    },
  },
});
