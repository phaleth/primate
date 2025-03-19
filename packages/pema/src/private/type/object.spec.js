import bigint from "#type/bigint";
import blob from "#type/blob";
import boolean from "#type/boolean";
import date from "#type/date";
import number from "#type/number";
import object from "#type/object";
import string from "#type/string";
import symbol from "#type/symbol";
import file from "#type/file";
import array from "#type/array";
import tuple from "#type/tuple";
import expect from "#type/expect";

const s = object({ foo: string });
const s_n = object({ foo: string, bar: number });
const s_n_b = object({ foo: string, bar: number, baz: boolean });

const f = { foo: "bar" };
const fb = { foo: "bar", bar: 0 };
const fbb = { foo: "bar", bar: 0, baz: false };

export default test => {
  test.case("empty", assert => {
    assert(object({}).validate({})).equals({});
  });

  test.case("flat", assert => {
    assert(s.validate(f)).equals(f);
    assert(s_n.validate(fb)).equals(fb);

    assert(() => s.validate()).throws(expect("o", undefined));
    assert(() => s.validate(fb)).throws(expect("u", 0, ".bar"));
    assert(() => s.validate({})).throws(expect("s", undefined, ".foo"));
    assert(() => s_n.validate(f)).throws(expect("n", undefined, ".bar"));
  });

  test.case("deep", assert => {
    // recursive
    const rc = object({ foo: object({ bar: string }) });
    assert(rc.validate({ foo: { bar: "baz" }})).equals({ foo: { bar: "baz" }});
    assert(() => rc.validate({ foo: { bar: 1 }})).throws();

    // recursive implicit
    const rci = object({ foo: { bar: string }});
    assert(rci.validate({ foo: { bar: "baz" }})).equals({ foo: { bar: "baz" }});
    assert(() => rci.validate({ foo: { bar: 1 }})).throws();

    const x0 = { bigint: 0n };
    const x1 = { ...x0, blob: new Blob() };
    const x2 = { ...x1, boolean: false };
    const x3 = { ...x2, date: new Date() };
    const x4 = { ...x3, number: 0 };
    const x5 = { ...x4, string: "" };
    const x6 = { ...x5, symbol: Symbol() };
    const x7 = { ...x6, file: new File([""], "") }

    const x = {
      ...x7,
      next: {
        ...x6,
        next: {
          ...x5,
          next: {
            ...x4,
            next: {
              ...x3,
              next: {
                ...x2,
                next: {
                  ...x1,
                  next: x0,
                },
              },
            },
          },
        },
      },
    }; 

    const f0 = { bigint };
    const f1 = { ...f0, blob };
    const f2 = { ...f1, boolean };
    const f3 = { ...f2, date };
    const f4 = { ...f3, number};
    const f5 = { ...f4, string };
    const f6 = { ...f5, symbol };
    const f7 = { ...f6, file };

    const full = object({
      ...f7,
      next: {
        ...f6,
        next: {
          ...f5,
          next: {
            ...f4,
            next: {
              ...f3,
              next: {
                ...f2,
                next: {
                  ...f1,
                  next: f0,
                },
              },
            },
          },
        },
      },
    });
    assert(full.validate(x)).equals(x);
  });

  test.case("arrays", assert => {
    const o = { foo: ["bar", "baz"] };

    const oa = object({ foo: array(string)} );
    assert(oa.validate(o)).equals(o);
  });

  test.case("tuples", assert => {
    const o = { foo: ["bar", 0] };

    const ot = object({ foo: tuple([string, number])} );
    assert(ot.validate(o)).equals(o);

    const oti = object({ foo: [string, number] } );
    assert(oti.validate(o)).equals(o);
  });

  test.case("complex", assert => {
    const schema = object({
      foo: string,
      bar: {
        baz: [string, {
          x: array(boolean),
          y: [date, symbol],
        }],
      },
    });

    const og = {
      foo: "foo",
      bar: {
        baz: ["baz", {
          x: [true, false, true],
          y: [new Date, Symbol("sy")],
        }],
      },
    };

    assert(schema.validate(og)).equals(og);
  })
}
