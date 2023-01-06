import {File, Path} from "runtime-compat/filesystem";

export {default as Bundler} from "./src/Bundler.js";

export {default as Domain} from "./src/domain/Domain.js";
export {default as Storeable} from "./src/types/Storeable.js";

export * from "./src/errors.js";

export {default as MemoryStore} from "./src/store/Memory.js";
export {default as Store} from "./src/store/Store.js";

export {default as extend_object} from "./src/extend_object.js";

import _conf from "./src/conf.js";
const conf = _conf();
import _html from "./src/handlers/html.js";
const {paths: {components: path}} = conf;
const loadFile = async file => [file.base, await file.read()];
const components = await path.exists
  ? Object.fromEntries(await Promise.all((
    await File.collect(path, ".html")).map(loadFile)))
  : {};
export const html = _html(components);

export {default as json} from "./src/handlers/json.js";
export {default as redirect} from "./src/handlers/redirect.js";
export {http404} from "./src/handlers/http.js";

export {default as DOMParser} from "./src/handlers/DOM/Parser.js";
