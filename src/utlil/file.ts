import decompress from "decompress";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";

export const findFilesByExt = async (
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

export const zipFlat = async (
  input: Parameters<typeof decompress>[0],
  output: string
) => {
  // decompress current zip file
  const files = await decompress(input, output, {
    // ignore MAC files
    filter: (file) => !file.path.includes("__MACOSX"),
  });

  // recursively decompress children
  await Promise.all(
    files
      .filter((f) => f.path.endsWith(".zip"))
      .map(async (f) => {
        const name = path.basename(f.path, ".zip");

        // decompress child zip
        console.log(`unzipping <${f.path}>...`);
        await zipFlat(f.data, path.join(output, name));

        // delete zip after decompressing
        await unlink(path.join(output, f.path));
        console.log(`unzipped <${f.path}>`);
      })
  );
};
