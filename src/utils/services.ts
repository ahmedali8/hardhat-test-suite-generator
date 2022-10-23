import * as fs from "fs";
import { sync as mkdirp } from "mkdirp";
import * as prettier from "prettier";
import { Services } from "typechain";

export const services: Services = {
  fs,
  prettier,
  mkdirp,
};
