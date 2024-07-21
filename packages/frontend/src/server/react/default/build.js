import compile from "@primate/frontend/base/compile";
import depend from "@primate/frontend/base/depend";
import server_root from "@primate/frontend/base/server-root";
import { dependencies, name } from "@primate/frontend/react/common";
import create_root from "../client/create-root.js";
import { client, server } from "./compile.js";
import prepare from "./prepare.js";
import publish from "./publish.js";

export default extension => async (app, next) => {
  await depend(dependencies, name);

  // compile server
  await server_root(app, name, create_root, server);

  const compiled = await compile({
    app,
    extension,
    name,
    create_root,
    compile: { server, client },
  });

  app.register(extension, compiled);

  app.build.plugin(publish(app, extension));
  const code = "export { default as spa } from '@primate/frontend/spa';";
  app.build.export(code);
  await prepare(app);

  return next(app);
};