import { default_extension, name } from "@primate/binding/python/common";
import build from "./build.js";

export default ({ extension = default_extension, packages = [] } = {}) => ({
  name: `primate:${name}`,
  build: build({ name, extension, packages }),
});
