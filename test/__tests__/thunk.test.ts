import { init, h, thunk, VNode } from "../../src/index";

const patch = init([]);

describe("thunk", function () {
  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = vnode0 = document.createElement("div");
  });
  it("returns vnode with data and render function", function () {
    function numberInSpan(n: number) {
      return h("span", `Number is ${n}`);
    }
    const vnode = thunk("span", "num", numberInSpan, [22]);
    expect(vnode.sel).toEqual("span");
    expect(vnode.data.key).toEqual("num");
    expect(vnode.data.args).toEqual([22]);
  });
  it("calls render function once on data change", function () {
    let called = 0;
    function numberInSpan(n: number) {
      called++;
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    const vnode1 = h("div", [thunk("span", "num", numberInSpan, [1])]);
    const vnode2 = h("div", [thunk("span", "num", numberInSpan, [2])]);
    patch(vnode0, vnode1);
    expect(called).toStrictEqual(1);
    patch(vnode1, vnode2);
    expect(called).toStrictEqual(2);
  });
  it("does not call render function on data unchanged", function () {
    let called = 0;
    function numberInSpan(n: number) {
      called++;
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    const vnode1 = h("div", [thunk("span", "num", numberInSpan, [1])]);
    const vnode2 = h("div", [thunk("span", "num", numberInSpan, [1])]);
    patch(vnode0, vnode1);
    expect(called).toStrictEqual(1);
    patch(vnode1, vnode2);
    expect(called).toStrictEqual(1);
  });
  it("calls render function once on data-length change", function () {
    let called = 0;
    function numberInSpan(n: number) {
      called++;
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    const vnode1 = h("div", [thunk("span", "num", numberInSpan, [1])]);
    const vnode2 = h("div", [thunk("span", "num", numberInSpan, [1, 2])]);
    patch(vnode0, vnode1);
    expect(called).toStrictEqual(1);
    patch(vnode1, vnode2);
    expect(called).toStrictEqual(2);
  });
  it("calls render function once on function change", function () {
    let called = 0;
    function numberInSpan(n: number) {
      called++;
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    function numberInSpan2(n: number) {
      called++;
      return h("span", { key: "num" }, `Number really is ${n}`);
    }
    const vnode1 = h("div", [thunk("span", "num", numberInSpan, [1])]);
    const vnode2 = h("div", [thunk("span", "num", numberInSpan2, [1])]);
    patch(vnode0, vnode1);
    expect(called).toStrictEqual(1);
    patch(vnode1, vnode2);
    expect(called).toStrictEqual(2);
  });
  it("renders correctly", function () {
    let called = 0;
    function numberInSpan(n: number) {
      called++;
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    const vnode1 = h("div", [thunk("span", "num", numberInSpan, [1])]);
    const vnode2 = h("div", [thunk("span", "num", numberInSpan, [1])]);
    const vnode3 = h("div", [thunk("span", "num", numberInSpan, [2])]);
    elm = patch(vnode0, vnode1).elm;
    expect(elm.firstChild.tagName.toLowerCase()).toStrictEqual("span");
    expect(elm.firstChild.innerHTML).toStrictEqual("Number is 1");
    elm = patch(vnode1, vnode2).elm;
    expect(elm.firstChild.tagName.toLowerCase()).toStrictEqual("span");
    expect(elm.firstChild.innerHTML).toStrictEqual("Number is 1");
    elm = patch(vnode2, vnode3).elm;
    expect(elm.firstChild.tagName.toLowerCase()).toStrictEqual("span");
    expect(elm.firstChild.innerHTML).toStrictEqual("Number is 2");
    expect(called).toStrictEqual(2);
  });
  it.skip("supports leaving out the `key` argument", function () {
    function vnodeFn(s: string) {
      return h("span.number", "Hello " + s);
    }
    const vnode1 = thunk("span.number", vnodeFn, ["World!"]);
    elm = patch(vnode0, vnode1).elm;
    expect(elm.innerText).toStrictEqual("Hello World!");
  });
  it("renders correctly when root", function () {
    let called = 0;
    function numberInSpan(n: number) {
      called++;
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    const vnode1 = thunk("span", "num", numberInSpan, [1]);
    const vnode2 = thunk("span", "num", numberInSpan, [1]);
    const vnode3 = thunk("span", "num", numberInSpan, [2]);

    elm = patch(vnode0, vnode1).elm;
    expect(elm.tagName.toLowerCase()).toStrictEqual("span");
    expect(elm.innerHTML).toStrictEqual("Number is 1");

    elm = patch(vnode1, vnode2).elm;
    expect(elm.tagName.toLowerCase()).toStrictEqual("span");
    expect(elm.innerHTML).toStrictEqual("Number is 1");

    elm = patch(vnode2, vnode3).elm;
    expect(elm.tagName.toLowerCase()).toStrictEqual("span");
    expect(elm.innerHTML).toStrictEqual("Number is 2");
    expect(called).toStrictEqual(2);
  });
  it("can be replaced and removed", function () {
    function numberInSpan(n: number) {
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    function oddEven(n: number): VNode {
      const prefix = n % 2 === 0 ? "Even" : "Odd";
      return h("div", { key: oddEven as any }, `${prefix}: ${n}`);
    }
    const vnode1 = h("div", [thunk("span", "num", numberInSpan, [1])]);
    const vnode2 = h("div", [thunk("div", "oddEven", oddEven, [4])]);

    elm = patch(vnode0, vnode1).elm;
    expect(elm.firstChild.tagName.toLowerCase()).toStrictEqual("span");
    expect(elm.firstChild.innerHTML).toStrictEqual("Number is 1");

    elm = patch(vnode1, vnode2).elm;
    expect(elm.firstChild.tagName.toLowerCase()).toStrictEqual("div");
    expect(elm.firstChild.innerHTML).toStrictEqual("Even: 4");
  });
  it("can be replaced and removed when root", function () {
    function numberInSpan(n: number) {
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    function oddEven(n: number): VNode {
      const prefix = n % 2 === 0 ? "Even" : "Odd";
      return h("div", { key: oddEven as any }, `${prefix}: ${n}`);
    }
    const vnode1 = thunk("span", "num", numberInSpan, [1]);
    const vnode2 = thunk("div", "oddEven", oddEven, [4]);

    elm = patch(vnode0, vnode1).elm;
    expect(elm.tagName.toLowerCase()).toStrictEqual("span");
    expect(elm.innerHTML).toStrictEqual("Number is 1");

    elm = patch(vnode1, vnode2).elm;
    expect(elm.tagName.toLowerCase()).toStrictEqual("div");
    expect(elm.innerHTML).toStrictEqual("Even: 4");
  });
  it("invokes destroy hook on thunks", function () {
    let called = 0;
    function destroyHook() {
      called++;
    }
    function numberInSpan(n: number) {
      return h(
        "span",
        { key: "num", hook: { destroy: destroyHook } },
        `Number is ${n}`
      );
    }
    const vnode1 = h("div", [
      h("div", "Foo"),
      thunk("span", "num", numberInSpan, [1]),
      h("div", "Foo"),
    ]);
    const vnode2 = h("div", [h("div", "Foo"), h("div", "Foo")]);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    expect(called).toStrictEqual(1);
  });
  it("invokes remove hook on thunks", function () {
    let called = 0;
    function hook() {
      called++;
    }
    function numberInSpan(n: number) {
      return h(
        "span",
        { key: "num", hook: { remove: hook } },
        `Number is ${n}`
      );
    }
    const vnode1 = h("div", [
      h("div", "Foo"),
      thunk("span", "num", numberInSpan, [1]),
      h("div", "Foo"),
    ]);
    const vnode2 = h("div", [h("div", "Foo"), h("div", "Foo")]);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    expect(called).toStrictEqual(1);
  });
});
