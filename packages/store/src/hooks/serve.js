import base_name from "@primate/store/base/name";
import primary from "@primate/store/base/primary";
import EmptyStoreDirectory from "@primate/store/errors/empty-store-directory";
import InvalidType from "@primate/store/errors/invalid-type";
import NoPrimaryKey from "@primate/store/errors/no-primary-key";
import empty from "@rcompat/array/empty";
import dim from "@rcompat/cli/color/dim";
import exclude from "@rcompat/object/exclude";
import transform from "@rcompat/object/transform";

const module = base_name;

const valid_type = ({ base, validate }) =>
  base !== undefined && typeof validate === "function";

const valid = (type, name, store) =>
  valid_type(type) ? type : InvalidType.throw(name, store);

export default (directory, mode, driver_serve, env) => async (app, next) => {
  const root = app.runpath(directory);

  const defaults = {
    mode,
    readonly: false,
    ambiguous: false,
  };

  const loaded = [];

  const stores = app.files.stores.map(([name, definition]) => {
    const schema = transform(definition.default, entry => entry
      .filter(([property, type]) => valid(type, property, name)));

    definition.ambiguous !== true && schema.id === undefined
      && NoPrimaryKey.throw(primary, name,
        "export const ambiguous = true;");

    const pathed = name.replaceAll("/", ".");

    loaded.push(pathed);

    return [pathed, {
      ...exclude(definition, ["default"]),
      schema,
      name: definition.name ?? name.replaceAll("/", "_"),
      defaults,
    }];
  });

  app.log.info(`loaded ${loaded.map(l => dim(l)).join(" ")}`, { module });

  if (empty(stores)) {
    EmptyStoreDirectory.warn(app.log, root);
    return next(app);
  }

  const default_driver = await driver_serve();

  env.root = root;
  env.log = app.log;
  env.stores = stores;
  env.defaults = {
    driver: default_driver,
    ...defaults,
  };
  env.drivers = [...new Set(stores.map(({ driver }) =>
    driver ?? default_driver))];
  env.active = true;

  return next({ ...app, stores });
};
