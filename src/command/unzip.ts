import { Command } from "commander";
import { zipFlat } from "../utlil/file.js";

export const unzipCmd = new Command("unzip")
  .argument("<input>")
  .argument("<output>")
  .action(async (input: string, output: string) => {
    try {
      console.log(`unzipping <${input}>...`);
      await zipFlat(input, output);
      console.log(`unzipped <${input}>`);
    } catch (e) {
      console.error(`Error while unzipping <${input}>: ${e}`);
    }
  });
