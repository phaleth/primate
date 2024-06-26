import { File } from "rcompat/fs";
import * as O from "rcompat/object";
import handler from "./handler.js";
import compile from "./compile.js";
import normalize from "./normalize.js";
import peers from "./peers.js";
import depend from "../depend.js";

export default async ({
  name,
  dependencies,
  default_extension,
}) => {
  const normalized = normalize(name);
  const base = new File(import.meta.url).up(2).join(name);
  const exports_path = base.join("client", "exports.js");
  const imports_path = base.join("imports.js");
  const on = O.filter(peers, ([key]) => dependencies.includes(key));

  return ({
    extension = default_extension,
    // active SPA browsing
    spa = true,
  } = {}) => {
    let imports, exports;

    return {
      name: `primate:${name}`,
      async init(app, next) {
        await depend(on, `frontend:${name}`);

        imports = await imports_path.import();
        exports = await exports_path.import();

        app.register(extension, {
          handle: handler({
            app,
            name,
            render: imports.render,
            client: exports.default,
            normalize: normalized,
            spa,
          }),
          compile: await compile({
            app,
            extension,
            name,
            create_root: exports.create_root,
            normalize: normalized,
            compile: imports.compile,
          }),
        });

        return next(app);
      },
      async build(app, next) {
        app.build.plugin(imports.publish(app, extension));
        const code = "export { default as spa } from '@primate/frontend/spa';";
        app.build.export(code);
        await imports.prepare(app);
        return next(app);
      },
    };
  };
};
