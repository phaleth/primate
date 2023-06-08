import {Path} from "runtime-compat/fs";
import loader from "./types.js";
import {mark} from "../Logger.js";

const log = {
  auto(error) {
    throw error;
  },
};
const directory = new Path("/types");
const types = defs => loader(log, directory, () => defs);

export default test => {
  test.case("errors.InvalidType", assert => {
    const throws = mark("invalid type {0}", "user");
    assert(() => types([["user", false]])).throws(throws);
  });

  test.case("errors.InvalidTypeName", assert => {
    const throws = mark("invalid type name {0}", "us$er");
    assert(() => types([["us$er", () => false]])).throws(throws);
    const throws2 = mark("invalid type name {0}", "User");
    assert(() => types([["User", () => false]])).throws(throws2);
    assert(() => types([["uSer", () => false]])).not_throws();
  });

  test.case("errors.ReservedTypeName", assert => {
    const throws1 = mark("reserved type name {0}", "get");
    assert(() => types([["get", () => false]])).throws(throws1);
    const throws2 = mark("reserved type name {0}", "raw");
    assert(() => types([["raw", () => false]])).throws(throws2);
  });
};