import { Command } from "commander";
import info from "../package.json" assert { type: "json" };
import { css } from "./command/css.js";
import { unzip } from "./command/zip.js";

const cli = new Command();

cli
  .name(Object.keys(info.bin).at(0) ?? info.name)
  .description("Helps marking module 101 results.")
  .version(info.version, "-v");

cli.addCommand(unzip);
cli.addCommand(css);

cli.parse(process.argv);
