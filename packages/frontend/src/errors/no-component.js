import error from "@primate/core/logger/error";

export default error({
  name: "NoComponent",
  message: "missing component {0}",
  fix: "create {1} or remove route function",
  module: "primate/frontend",
});