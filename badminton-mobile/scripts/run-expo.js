const { spawnSync } = require("child_process");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const expoArgs = process.argv.slice(2);
const expoCli = require.resolve("expo/bin/cli", { paths: [projectRoot] });

const result = spawnSync(process.execPath, [expoCli, ...expoArgs], {
  cwd: projectRoot,
  env: {
    ...process.env,
    NODE_PATH: path.join(projectRoot, "node_modules"),
  },
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
