const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "/src/contentScript/constants/infura.ts");

const content = fs.readFileSync(filePath, "utf8");

const regex =
  /const INFURA_API_KEY\s*=\s*"([^"]*)";\s*\nconst INFURA_API_KEY_SECRET\s*=\s*"([^"]*)";/;

const matches = content.match(regex);

if (matches && matches[1] && matches[2]) {
  console.error(
    "Error: INFURA_API_KEY or INFURA_API_KEY_SECRET has not been cleared."
  );
  process.exit(1);
}
