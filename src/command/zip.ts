import { Command } from "commander";
import decompress from "decompress";
import { unlink } from "fs/promises";
import path from "path";

const zipFlat = async (
  input: Parameters<typeof decompress>[0],
  output: string
) => {
  const files = await decompress(input, output);

  await Promise.all(
    files
      .filter((f) => f.path.endsWith(".zip"))
      .map(async (f) => {
        const name = path.basename(f.path, ".zip");
        console.log(`unzipping <${f.path}> ...`);
        await zipFlat(f.data, path.join(output, name));
        await unlink(path.join(output, f.path));
        console.log(`unzipped <${f.path}>.`);
      })
  );
};

export const unzip = new Command("unzip")
  .argument("<input>")
  .argument("<output>")
  .action(async (input: string, output: string) => {
    try {
      await zipFlat(input, output);
      console.log(`<${input}> was unzipped.`);
    } catch (e) {
      console.error(`Error while unzipping <${input}>: ${e}`);
    }
  });
