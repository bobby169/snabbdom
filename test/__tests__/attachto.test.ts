import { init, RemoveHook, attachTo, h } from "../../src/index";

const patch = init([]);

describe("attachTo", function () {
  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  it("adds element to target", function () {
    const vnode1 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        attachTo(elm, h("div#attached", "Test")),
      ]),
    ]);
    elm = patch(vnode0, vnode1).elm;
    expect(elm.children.length).toStrictEqual(2);
  });
  it("updates element at target", function () {
    const vnode1 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        attachTo(elm, h("div#attached", "First text")),
      ]),
    ]);
    const vnode2 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        attachTo(elm, h("div#attached", "New text")),
      ]),
    ]);
    elm = patch(vnode0, vnode1).elm;
    expect(elm.children[0].innerHTML).toStrictEqual("First text");
    elm = patch(vnode1, vnode2).elm;
    expect(elm.children[0].innerHTML).toStrictEqual("New text");
  });
  it("element can be inserted before modal", function () {
    const vnode1 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        attachTo(elm, h("div#attached", "Text")),
      ]),
    ]);
    const vnode2 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        h("div", "A new element"),
        attachTo(elm, h("div#attached", "Text")),
      ]),
    ]);
    elm = patch(vnode0, vnode1).elm;
    expect(elm.children[0].innerHTML).toStrictEqual("Text");
    elm = patch(vnode1, vnode2).elm;
    expect(elm.children[0].innerHTML).toStrictEqual("Text");
  });
  it("removes element at target", function () {
    const vnode1 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        attachTo(elm, h("div#attached", "First text")),
      ]),
    ]);
    const vnode2 = h("div", [h("div#wrapper", [h("div", "Some element")])]);
    elm = patch(vnode0, vnode1).elm;
    expect(elm.children[0].innerHTML).toStrictEqual("First text");
    elm = patch(vnode1, vnode2).elm;
    expect(elm.children.length).toStrictEqual(1);
  });
  it("remove hook receives real element", function () {
    const rm: RemoveHook = (vnode, cb) => {
      const elm = vnode.elm as HTMLDivElement;
      expect(elm.tagName).toStrictEqual("DIV");
      expect(elm.innerHTML).toStrictEqual("First text");
      cb();
    };
    const vnode1 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        attachTo(
          elm,
          h("div#attached", { hook: { remove: rm } }, "First text")
        ),
      ]),
    ]);
    const vnode2 = h("div", [h("div#wrapper", [h("div", "Some element")])]);
    elm = patch(vnode0, vnode1).elm;
    elm = patch(vnode1, vnode2).elm;
  });
});
