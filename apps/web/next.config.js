const packages = Object.entries(require("./package.json").dependencies)
  .filter(([, value]) => value === "*")
  .map(([key]) => key);

const withTM = require("next-transpile-modules")(packages);

module.exports = withTM({
  reactStrictMode: true,
});
