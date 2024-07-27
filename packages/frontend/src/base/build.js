import compile from "@primate/frontend/base/compile";
import server_root from "@primate/frontend/base/server-root";

export default ({
  create_root,
  extension,
  name,
  actions,
}) => async (app, next) => {
  // compile server
  await server_root(app, name, create_root, actions.compile.server);

  app.register(extension, await compile({
    app,
    extension,
    name,
    create_root,
    compile: actions.compile,
  }));

  app.build.plugin(actions.publish(app, extension));
  const code = "export { default as spa } from '@primate/frontend/spa';";
  app.build.export(code);
  app.build.export(actions.expose);

  return next(app);
};
