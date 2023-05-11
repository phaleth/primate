import {Logger} from "primate";
import validate from "./validate.js";
import errors from "./errors.js";

const transform = direction => ({types, schema, document, path}) =>
  Object.fromEntries(Object.entries(document)
    .filter(([field]) => schema[field]?.type !== undefined)
    .map(([field, value]) => {
      try {
        return [field, types[schema[field].type]?.[direction](value) ?? value];
      } catch (error) {
        const {name} = schema[field];
        errors.CannotUnpackValue.throw({name, value, field, path, document});
      }
    }));

const pack = transform("in");
const unpack = transform("out");

export default class Store {
  #schema;
  #config = {};
  #path;

  constructor(name, schema = {}, config = {}) {
    this.#schema = schema;
    this.#path = name.replaceAll("_", ".");
    this.#config = {name: name.toLowerCase(), ...config};
  }

  get driver() {
    return this.#config.driver;
  }

  get primary() {
    return this.#config.primary;
  }

  get name() {
    return this.#config.name;
  }

  get readonly() {
    return this.#config.readonly;
  }

  get strict() {
    return this.#config.strict;
  }

  async validate(input) {
    return validate({
      /* name of the primary field as well the driver's primary validate
       * function */
      primary: {
        name: this.primary,
        value: {...await this.driver.primary()},
      },
      /* the input to be validated */
      input,
      /* the schema to validate against */
      schema: this.#schema,
      /* whether all fields must be non-empty */
      strict: this.#config.strict,
    });
  }

  #pack(document) {
    return pack({
      types: this.driver.types,
      schema: this.#schema,
      document,
      path: this.#path,
    });
  }

  #unpack(document) {
    return unpack({
      types: this.driver.types,
      schema: this.#schema,
      document,
      path: this.#path,
    });
  }

  new() {
    return this.driver.primary().then(({generate}) =>
      ({[this.primary]: generate()}));
  }

  async get(value) {
    const {name} = this;
    const path = this.#path;

    const document = await this.driver.get(name, this.primary, value);

    document === undefined && errors.NoDocumentFound.throw({path, value});

    return this.#unpack(document);
  }

  async find(criteria) {
    const documents = await this.driver.find(this.name, criteria);
    return documents.map(document => this.#unpack(document));
  }

  async #validate(input, write) {
    const {error, document} = await this.validate(input);
    const keys = Object.keys(error);

    return keys.length === 0
      ? {document: this.readonly ? document : await write(this.#pack(document))}
      : (() => {
        throw new Logger.Warn(`validation failed for ${keys.join(", ")}`);
      })();
  }

  #generate() {
    return this.driver.primary().then(({generate}) => generate());
  }

  async insert(document = {}) {
    const {primary} = this;

    return this.#validate({
      ...document,
      [primary]: document[primary] ?? await this.#generate(),
    }, validated => this.driver.insert(this.name, validated));
  }

  update(criteria, document = {}) {
    return this.#validate(document, validated =>
      this.driver.update(this.name, criteria, validated));
  }

  save(document) {
    const {primary} = this;

    return document[primary] === undefined
      ? this.insert(document)
      : this.update({[primary]: document[primary]}, document);
  }

  delete(criteria) {
    return this.driver.delete(this.name, criteria);
  }
}
