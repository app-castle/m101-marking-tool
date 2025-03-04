import { Command } from "commander";
import { readFile } from "fs/promises";
import path from "path";
import { findFilesByExt, parsePath } from "../utlil/file.js";
import { callCssValidator, callHtmlValidator } from "../utlil/validator.js";

export const validateCmd = new Command("validate")
  .argument(
    "<input>",
    "Path which is searched for HTML and CSS documents",
    parsePath
  )
  .option("--css", "validate CSS documents")
  .option("--html", "validate HTML documents")
  .action(async (input: string, options) => {
    const allowBoth = !options.html && !options.css;

    if (options.html || allowBoth) {
      const htmlFiles = await findFilesByExt(input, ".html");

      for (const file of htmlFiles) {
        const data = await readFile(file, "utf-8");
        await callHtmlValidator(data, path.basename(file));
      }
    }

    if (options.css || allowBoth) {
      const cssFiles = await findFilesByExt(input, ".css");

      for (const file of cssFiles) {
        const data = await readFile(file, "utf-8");
        await callCssValidator(data, path.basename(file));
      }
    }
  });
