import { Command } from "commander";
import { parsePath, zipFlat } from "../utlil/file.js";

export const unzipCmd = new Command("unzip")
  .argument("<input>", "Path where the zip is located", parsePath)
  .argument("<output>", "Path where to put the unzipped files", parsePath)
  .action(async (input: string, output: string) => {
    try {
      console.log(`unzipping <${input}>...`);
      await zipFlat(input, output);
      console.log(`unzipped <${input}>`);
    } catch (e) {
      console.error(`Error while unzipping <${input}>: ${e}`);
    }
  });
