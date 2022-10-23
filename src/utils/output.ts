import { isArray } from "lodash";
import { dirname, relative } from "path";
import type { Options as PrettierOptions } from "prettier";
import type { FileDescription, Services } from "typechain";

import { debug } from "./debug";
import { HelperConfig } from "./helpers";

export type OutputTransformer = (
  output: string,
  services: Services,
  config: HelperConfig,
) => string;

export type Output = void | FileDescription | FileDescription[];

export const prettierOutputTransformer: OutputTransformer = (output, { prettier }, config) => {
  const prettierCfg: PrettierOptions = { ...(config.prettier || {}), parser: "typescript" };

  return prettier.format(output, prettierCfg);
};

export function processOutput(services: Services, cfg: HelperConfig, output: Output): number {
  const { fs, mkdirp } = services;
  if (!output) {
    return 0;
  }
  const outputFds = isArray(output) ? output : [output];
  let filesGenerated = 0;

  outputFds.forEach((fd) => {
    if (!fs.existsSync(fd.path)) {
      // ensure directory first
      mkdirp(dirname(fd.path));

      const finalOutput = prettierOutputTransformer(fd.contents, services, cfg);

      debug(`Writing file: ${relative(cfg.cwd, fd.path)}`);
      fs.writeFileSync(fd.path, finalOutput, "utf8");

      filesGenerated++;
    }
  });

  return filesGenerated;
}
