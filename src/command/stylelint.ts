import { Command } from "commander";
import path from "path";
import stylelint from "stylelint";
import config from "../../.stylelintrc.json" assert { type: "json" };
import { parsePath } from "../utlil/file.js";

type Severity = stylelint.Severity | "info";

export const stylelintCmd = new Command("stylelint")
  .argument("<input>", "Path which is searched for CSS documents", parsePath)
  .action(async (input: string) => {
    const result = await stylelint.lint({
      files: path.resolve(input),
      config,
      quietDeprecationWarnings: true,
    });

    for (const r of result.results) {
      if (r.source === undefined)
        throw new Error("Something went wrong. Source was undefined.");

      const file = path.basename(r.source);

      console.log(
        `${file}: ${
          !!r.invalidOptionWarnings.length
            ? r.invalidOptionWarnings.map((iow) => iow.text).join(", ")
            : r.errored
            ? "ERROR"
            : "OK"
        }`
      );

      if (!r.errored || !!r.invalidOptionWarnings.length) continue;

      const numErrors = r.warnings.reduce(
        (sum, w) => (w.severity === "error" ? sum + 1 : sum),
        0
      );
      console.log(`- Errors: ${numErrors}`);

      const numWarnings = r.warnings.reduce(
        (sum, w) => (w.severity === "warning" ? sum + 1 : sum),
        0
      );
      console.log(`- Warnings: ${numWarnings}`);

      const numInfos = r.warnings.reduce(
        (sum, w) => ((w.severity as Severity) === "info" ? sum + 1 : sum),
        0
      );
      console.log(`- Infos: ${numInfos}`);

      const violatedRules = r.warnings.reduce<Map<string, number>>((map, w) => {
        map.set(w.rule, (map.get(w.rule) ?? 0) + 1);
        return map;
      }, new Map());

      console.log("- Violated rules:");
      for (const [key, num] of violatedRules) {
        const sev =
          r.warnings.find((w) => w.rule === key)?.severity ?? "unknown";
        console.log(`-- (${sev}) ${num}x ${key}`);
      }
    }
  });
