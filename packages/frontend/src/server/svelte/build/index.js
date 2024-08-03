import build from "#build";
import create_root from "#svelte/client/create-root";
import expose from "#svelte/client/expose";
import name from "#svelte/name";
import client from "./client.js";
import publish from "./publish.js";
import server from "./server.js";

export default extension => build({
  create_root,
  extension,
  name,
  actions: { compile: { client, server }, expose, publish },
});