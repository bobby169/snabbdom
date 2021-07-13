import { init, attributesModule, h } from "../../src/index";

const patch = init([attributesModule]);

describe("attributes", function () {
  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  it("have their provided values", function () {
    const vnode1 = h("div", {
      attrs: { href: "/foo", minlength: 1, selected: true, disabled: false },
    });
    elm = patch(vnode0, vnode1).elm;
    expect(elm.getAttribute("href")).toStrictEqual("/foo");
    expect(elm.getAttribute("minlength")).toStrictEqual("1");
    expect(elm.hasAttribute("selected")).toStrictEqual(true);
    expect(elm.getAttribute("selected")).toStrictEqual("");
    expect(elm.hasAttribute("disabled")).toStrictEqual(false);
  });
  it("can be memoized", function () {
    const cachedAttrs = { href: "/foo", minlength: 1, selected: true };
    const vnode1 = h("div", { attrs: cachedAttrs });
    const vnode2 = h("div", { attrs: cachedAttrs });
    elm = patch(vnode0, vnode1).elm;
    expect(elm.getAttribute("href")).toStrictEqual("/foo");
    expect(elm.getAttribute("minlength")).toStrictEqual("1");
    expect(elm.getAttribute("selected")).toStrictEqual("");
    elm = patch(vnode1, vnode2).elm;
    expect(elm.getAttribute("href")).toStrictEqual("/foo");
    expect(elm.getAttribute("minlength")).toStrictEqual("1");
    expect(elm.getAttribute("selected")).toStrictEqual("");
  });
  it("are not omitted when falsy values are provided", function () {
    const vnode1 = h("div", {
      attrs: { href: null as any, minlength: 0, value: "", title: "undefined" },
    });
    elm = patch(vnode0, vnode1).elm;
    expect(elm.hasAttribute("href")).toBeTruthy();
    expect(elm.hasAttribute("minlength")).toBeTruthy();
    expect(elm.hasAttribute("value")).toBeTruthy();
    expect(elm.hasAttribute("title")).toBeTruthy();
  });
  it("are set correctly when namespaced", function () {
    const vnode1 = h("div", { attrs: { "xlink:href": "#foo" } });
    elm = patch(vnode0, vnode1).elm;
    expect(
      elm.getAttributeNS("http://www.w3.org/1999/xlink", "href")
    ).toStrictEqual("#foo");
  });
  it("should not touch class nor id fields", function () {
    elm = document.createElement("div");
    elm.id = "myId";
    elm.className = "myClass";
    vnode0 = elm;
    const vnode1 = h("div#myId.myClass", { attrs: {} }, ["Hello"]);
    elm = patch(vnode0, vnode1).elm;
    expect(elm.tagName).toStrictEqual("DIV");
    expect(elm.id).toStrictEqual("myId");
    expect(elm.className).toStrictEqual("myClass");
    expect(elm.textContent).toStrictEqual("Hello");
  });
  describe("boolean attribute", function () {
    it("is present and empty string if the value is truthy", function () {
      const vnode1 = h("div", {
        attrs: { required: true, readonly: 1, noresize: "truthy" },
      });
      elm = patch(vnode0, vnode1).elm;
      expect(elm.hasAttribute("required")).toStrictEqual(true);
      expect(elm.getAttribute("required")).toStrictEqual("");
      expect(elm.hasAttribute("readonly")).toStrictEqual(true);
      expect(elm.getAttribute("readonly")).toStrictEqual("1");
      expect(elm.hasAttribute("noresize")).toStrictEqual(true);
      expect(elm.getAttribute("noresize")).toStrictEqual("truthy");
    });
    it("is omitted if the value is false", function () {
      const vnode1 = h("div", { attrs: { required: false } });
      elm = patch(vnode0, vnode1).elm;
      expect(elm.hasAttribute("required")).toStrictEqual(false);
      expect(elm.getAttribute("required")).toStrictEqual(null);
    });
    it("is not omitted if the value is falsy", function () {
      const vnode1 = h("div", {
        attrs: { readonly: 0, noresize: null as any },
      });
      elm = patch(vnode0, vnode1).elm;
      expect(elm.hasAttribute("readonly")).toBeTruthy();
      expect(elm.hasAttribute("noresize")).toBeTruthy();
    });
  });
  describe("Object.prototype property", function () {
    it("is not considered as a boolean attribute and shouldn't be omitted", function () {
      const vnode1 = h("div", { attrs: { constructor: true } });
      elm = patch(vnode0, vnode1).elm;
      expect(elm.hasAttribute("constructor")).toStrictEqual(true);
      expect(elm.getAttribute("constructor")).toStrictEqual("");
      const vnode2 = h("div", { attrs: { constructor: false } });
      elm = patch(vnode0, vnode2).elm;
      expect(elm.hasAttribute("constructor")).toStrictEqual(false);
    });
  });
});
