import { Command } from "commander";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import { callCssValidator, callHtmlValidator } from "../utlil/validator.js";

const findFilesByExt = async (
  input: string,
  ext: `.${string}`
): Promise<string[]> => {
  const info = await stat(input);
  const basename = path.basename(input);

  // prevent mac files
  if (basename.startsWith("__MACOSX") || basename.startsWith("._")) return [];

  if (info.isFile() && path.extname(input) === ext) {
    // if file is of correct extension, return it
    return [input];
  } else if (info.isDirectory()) {
    // if it is a directory, travers its files instead
    const files = await readdir(input);
    const found = await Promise.all(
      files.map((f) => findFilesByExt(path.join(input, f), ext))
    );
    return found.flat();
  }

  return [];
};

export const validateCmd = new Command("validate")
  .argument("<input>")
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
