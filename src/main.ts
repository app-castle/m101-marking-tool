import { Command } from "commander";
import info from "../package.json" assert { type: "json" };
import { stylelintCmd } from "./command/stylelint.js";
import { unzipCmd } from "./command/unzip.js";
import { validateCmd } from "./command/validate.js";
import { handleExit } from "./utlil/common.js";

const cli = new Command();

cli
  .name(Object.keys(info.bin).at(0) ?? info.name)
  .description("Helps marking module 101 results.")
  .version(info.version, "-v");

cli.addCommand(unzipCmd);
cli.addCommand(stylelintCmd);
cli.addCommand(validateCmd);

cli.parse(process.argv);

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
