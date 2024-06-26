import * as A from "rcompat/array";
import { dim } from "rcompat/colors";
import crypto from "rcompat/crypto";
import { assert } from "rcompat/invariant";
import * as O from "rcompat/object";
import { memory } from "./drivers/exports.js";
import errors from "./errors.js";
import modes from "./modes.js";
import primary from "./primary.js";

const last = -1;
const ending = -3;
const {
  EmptyStoreDirectory,
  InvalidType,
  MissingPrimaryKey,
  MissingStoreDirectory,
  TransactionRolledBack,
} = errors;

const make_transaction = async env => {
  const [transaction] = await Promise.all(env.drivers.map(driver =>
    driver.transact(env.stores
      .filter(store => (store.driver ?? env.defaults.driver) === driver),
    )));

  return {
    id: crypto.randomUUID(),
    transaction,
  };
};

const valid_type = ({ base, validate }) =>
  base !== undefined && typeof validate === "function";

const valid = (type, name, store) =>
  valid_type(type) ? type : InvalidType.throw(name, store);

export default ({
  // directory for stores
  directory = "stores",
  // default database driver
  driver = memory(),
  // loose: validate non-empty fields, accept empty/non-defined [default]
  // strict: all fields must be non-empty before saving
  mode = modes.loose,
} = {}) => {
  assert(Object.values(modes).includes(mode),
    "`mode` must be 'strict' or 'loose'");
  const module = "primate/store";
  let env = {};
  let active = false;

  return {
    name: "primate:store",
    async build(app, next) {
      await app.stage(app.root.join(directory), directory);

      return next(app);
    },
    async serve(app, next) {
      const root = app.runpath(directory);

      if (!await root.exists()) {
        MissingStoreDirectory.warn(app.log, root);
        return next(app);
      }

      const defaults = {
        mode,
        readonly: false,
        ambiguous: false,
      };

      const loaded = [];
      const stores = await Promise.all((await root.collect(/^.*.js$/u))
        // accept only uppercase-first files in store filename
        .filter(path => /^[A-Z]/u.test(path.name))
        .map(path => [path.debase(root, "/").path.slice(0, ending), path])
        // accept only lowercase-first directories in store path
        .filter(([name]) =>
          name.split("/").slice(0, last).every(part => /^[a-z]/u.test(part)))
        .map(async ([store, file]) => {
          const exports = await file.import();

          const schema = O.transform(exports.default, entry => entry
            .filter(([property, type]) => valid(type, property, store)));

          exports.ambiguous !== true && schema.id === undefined
            && MissingPrimaryKey.throw(primary, store,
              "export const ambiguous = true;");

          const pathed = store.replaceAll("/", ".");

          loaded.push(pathed);

          return [pathed, {
            ...O.exclude(exports, ["default"]),
            schema,
            name: exports.name ?? store.replaceAll("/", "_"),
            defaults,
          }];
        }),
      );

      app.log.info(`loading ${loaded.map(l => dim(l)).join(" ")}`, { module });

      if (A.empty(stores)) {
        EmptyStoreDirectory.warn(app.log, root);
        return next(app);
      }

      app.log.info("all stores nominal", { module });

      const default_driver = await driver();

      env = {
        root,
        log: app.log,
        stores,
        defaults: {
          driver: default_driver,
          ...defaults,
        },
        drivers: [...new Set(stores.map(({ driver: $driver }) =>
          $driver ?? default_driver))],
      };

      active = true;

      return next({ ...app, stores });
    },
    async route(request, next) {
      if (!active) {
        return next(request);
      }

      const { id, transaction } = await make_transaction(env);

      try {
        return await transaction([], stores => {
          const store = stores.reduce((base, [name, store]) =>
            O.extend(base, O.inflate(name, store))
          , {});
          return next({ ...request, store });
        },
        );
      } catch (error) {
        env.log.auto(error);
        TransactionRolledBack.warn(env.log, id, error.name);

        // let core handle error
        throw error;
      }
    },
  };
};
