import { h, VNode } from "../../../src/index";
describe("hyperscript", function () {
  it("can create vnode with proper tag", function () {
    expect(h("div").sel).toEqual("div");
    expect(h("a").sel).toEqual("a");
  });
  it("can create vnode with children", function () {
    const vnode = h("div", [h("span#hello"), h("b.world")]);
    expect(vnode.sel).toEqual("div");
    const children = vnode.children as [VNode, VNode];
    expect(children[0].sel).toEqual("span#hello");
    expect(children[1].sel).toEqual("b.world");
  });
  it("can create vnode with one child vnode", function () {
    const vnode = h("div", h("span#hello"));
    expect(vnode.sel).toEqual("div");
    const children = vnode.children as [VNode];
    expect(children[0].sel).toEqual("span#hello");
  });
  it("can create vnode with props and one child vnode", function () {
    const vnode = h("div", {}, h("span#hello"));
    expect(vnode.sel).toEqual("div");
    const children = vnode.children as [VNode];
    expect(children[0].sel).toEqual("span#hello");
  });
  it("can create vnode with text content", function () {
    const vnode = h("a", ["I am a string"]);
    const children = vnode.children as [VNode];
    expect(children[0].text).toEqual("I am a string");
  });
  it("can create vnode with text content in string", function () {
    const vnode = h("a", "I am a string");
    expect(vnode.text).toEqual("I am a string");
  });
  it("can create vnode with props and text content in string", function () {
    const vnode = h("a", {}, "I am a string");
    expect(vnode.text).toEqual("I am a string");
  });
  it("can create vnode with null props", function () {
    let vnode = h("a", null);
    expect(vnode.data).toEqual({});
    vnode = h("a", null, ["I am a string"]);
    const children = vnode.children as [VNode];
    expect(children[0].text).toEqual("I am a string");
  });
  it("can create vnode for comment", function () {
    const vnode = h("!", "test");
    expect(vnode.sel).toEqual("!");
    expect(vnode.text).toEqual("test");
  });
});
