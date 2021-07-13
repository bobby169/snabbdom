import { datasetModule, init, h } from "../../src/index";

const patch = init([datasetModule]);

describe("dataset", function () {
  beforeEach(function () {
    if (!Object.hasOwnProperty.call(HTMLElement.prototype, "dataset")) {
    }
  });

  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  it("is set on initial element creation", function () {
    elm = patch(vnode0, h("div", { dataset: { foo: "foo" } })).elm;
    expect(elm.dataset.foo).toStrictEqual("foo");
  });
  it("updates dataset", function () {
    const vnode1 = h("i", { dataset: { foo: "foo", bar: "bar" } });
    const vnode2 = h("i", { dataset: { baz: "baz" } });
    elm = patch(vnode0, vnode1).elm;
    expect(elm.dataset.foo).toStrictEqual("foo");
    expect(elm.dataset.bar).toStrictEqual("bar");
    elm = patch(vnode1, vnode2).elm;
    expect(elm.dataset.baz).toStrictEqual("baz");
    expect(elm.dataset.foo).toStrictEqual(undefined);
  });
  it("can be memoized", function () {
    const cachedDataset = { foo: "foo", bar: "bar" };
    const vnode1 = h("i", { dataset: cachedDataset });
    const vnode2 = h("i", { dataset: cachedDataset });
    elm = patch(vnode0, vnode1).elm;
    expect(elm.dataset.foo).toStrictEqual("foo");
    expect(elm.dataset.bar).toStrictEqual("bar");
    elm = patch(vnode1, vnode2).elm;
    expect(elm.dataset.foo).toStrictEqual("foo");
    expect(elm.dataset.bar).toStrictEqual("bar");
  });
  it("handles string conversions", function () {
    const vnode1 = h("i", {
      dataset: {
        empty: "",
        dash: "-",
        dashed: "foo-bar",
        camel: "fooBar",
        integer: 0 as any,
        float: 0.1 as any,
      },
    });
    elm = patch(vnode0, vnode1).elm;

    expect(elm.dataset.empty).toStrictEqual("");
    expect(elm.dataset.dash).toStrictEqual("-");
    expect(elm.dataset.dashed).toStrictEqual("foo-bar");
    expect(elm.dataset.camel).toStrictEqual("fooBar");
    expect(elm.dataset.integer).toStrictEqual("0");
    expect(elm.dataset.float).toStrictEqual("0.1");
  });
});
