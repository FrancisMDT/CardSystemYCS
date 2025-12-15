const dotenv = require("dotenv");
const expand = require("dotenv-expand");

const env = dotenv.config({ path: ".env" });

if (env.error) {
	console.error("Failed to load .env:", env.error);
	process.exit(1);
}

expand.expand(env);

// DEBUG LOG
console.log("Loaded PORT:", process.env.PORT);

const { execSync } = require("node:child_process");

execSync(`next dev -p ${process.env.PORT} --turbopack`, { stdio: "inherit" });
