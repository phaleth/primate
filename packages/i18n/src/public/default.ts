import build from "#hook/build";
import handle from "#hook/handle";
import route from "#hook/route";
import serve from "#hook/serve";
import Manager from "#Manager";
import name from "#name";
import type Module from "@primate/core/frontend/Module";

export default ({
  // default locale
  locale = "en",
} = {}): Module => {
  const manager = new Manager(locale);

  return {
    name,
    build: build(manager),
    route: route(manager),
    handle: handle(manager),
    serve: serve(manager),
  };
};

