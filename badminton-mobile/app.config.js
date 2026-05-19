const fs = require("fs");
const path = require("path");

function readEnvValue(name) {
  const envPath = path.join(__dirname, ".env");

  if (!fs.existsSync(envPath)) {
    return undefined;
  }

  const line = fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${name}=`));

  return line?.slice(line.indexOf("=") + 1).trim();
}

module.exports = ({ config }) => {
  const badmintonApiUrl = process.env.BADMINTON_API_URL ?? readEnvValue("BADMINTON_API_URL");

  return {
    ...config,
    extra: {
      ...config.extra,
      badmintonApiUrl,
    },
  };
};
