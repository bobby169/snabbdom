import { init, styleModule, h, toVNode } from "../../src/index";

const patch = init([styleModule]);

const featureDiscoveryElm = document.createElement("div");
featureDiscoveryElm.style.setProperty("--foo", "foo");
const hasCssVariables =
  featureDiscoveryElm.style.getPropertyValue("--foo") === "foo";

describe("style", function () {
  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  it("is being styled", function () {
    elm = patch(vnode0, h("div", { style: { fontSize: "12px" } })).elm;
    expect(elm.style.fontSize).toStrictEqual("12px");
  });
  it("can be memoized", function () {
    const cachedStyles = { fontSize: "14px", display: "inline" };
    const vnode1 = h("i", { style: cachedStyles });
    const vnode2 = h("i", { style: cachedStyles });
    elm = patch(vnode0, vnode1).elm;
    expect(elm.style.fontSize).toStrictEqual("14px");
    expect(elm.style.display).toStrictEqual("inline");
    elm = patch(vnode1, vnode2).elm;
    expect(elm.style.fontSize).toStrictEqual("14px");
    expect(elm.style.display).toStrictEqual("inline");
  });
  it("updates styles", function () {
    const vnode1 = h("i", { style: { fontSize: "14px", display: "inline" } });
    const vnode2 = h("i", { style: { fontSize: "12px", display: "block" } });
    const vnode3 = h("i", { style: { fontSize: "10px", display: "block" } });
    elm = patch(vnode0, vnode1).elm;
    expect(elm.style.fontSize).toStrictEqual("14px");
    expect(elm.style.display).toStrictEqual("inline");
    elm = patch(vnode1, vnode2).elm;
    expect(elm.style.fontSize).toStrictEqual("12px");
    expect(elm.style.display).toStrictEqual("block");
    elm = patch(vnode2, vnode3).elm;
    expect(elm.style.fontSize).toStrictEqual("10px");
    expect(elm.style.display).toStrictEqual("block");
  });
  it("explicialy removes styles", function () {
    const vnode1 = h("i", { style: { fontSize: "14px" } });
    const vnode2 = h("i", { style: { fontSize: "" } });
    const vnode3 = h("i", { style: { fontSize: "10px" } });
    elm = patch(vnode0, vnode1).elm;
    expect(elm.style.fontSize).toStrictEqual("14px");
    patch(vnode1, vnode2);
    expect(elm.style.fontSize).toStrictEqual("");
    patch(vnode2, vnode3);
    expect(elm.style.fontSize).toStrictEqual("10px");
  });
  it("implicially removes styles from element", function () {
    const vnode1 = h("div", [h("i", { style: { fontSize: "14px" } })]);
    const vnode2 = h("div", [h("i")]);
    const vnode3 = h("div", [h("i", { style: { fontSize: "10px" } })]);
    patch(vnode0, vnode1);
    expect(elm.firstChild.style.fontSize).toStrictEqual("14px");
    patch(vnode1, vnode2);
    expect(elm.firstChild.style.fontSize).toStrictEqual("");
    patch(vnode2, vnode3);
    expect(elm.firstChild.style.fontSize).toStrictEqual("10px");
  });
  it("updates css variables", function () {
    if (!hasCssVariables) {
    } else {
      const vnode1 = h("div", { style: { "--myVar": 1 as any } });
      const vnode2 = h("div", { style: { "--myVar": 2 as any } });
      const vnode3 = h("div", { style: { "--myVar": 3 as any } });
      elm = patch(vnode0, vnode1).elm;
      expect(elm.style.getPropertyValue("--myVar")).toStrictEqual("1");
      elm = patch(vnode1, vnode2).elm;
      expect(elm.style.getPropertyValue("--myVar")).toStrictEqual("2");
      elm = patch(vnode2, vnode3).elm;
      expect(elm.style.getPropertyValue("--myVar")).toStrictEqual("3");
    }
  });
  it("explicialy removes css variables", function () {
    if (!hasCssVariables) {
    } else {
      const vnode1 = h("i", { style: { "--myVar": 1 as any } });
      const vnode2 = h("i", { style: { "--myVar": "" } });
      const vnode3 = h("i", { style: { "--myVar": 2 as any } });
      elm = patch(vnode0, vnode1).elm;
      expect(elm.style.getPropertyValue("--myVar")).toStrictEqual("1");
      patch(vnode1, vnode2);
      expect(elm.style.getPropertyValue("--myVar")).toStrictEqual("");
      patch(vnode2, vnode3);
      expect(elm.style.getPropertyValue("--myVar")).toStrictEqual("2");
    }
  });
  it("implicially removes css variables from element", function () {
    if (!hasCssVariables) {
    } else {
      const vnode1 = h("div", [h("i", { style: { "--myVar": 1 as any } })]);
      const vnode2 = h("div", [h("i")]);
      const vnode3 = h("div", [h("i", { style: { "--myVar": 2 as any } })]);
      patch(vnode0, vnode1);
      expect(elm.firstChild.style.getPropertyValue("--myVar")).toStrictEqual(
        "1"
      );
      patch(vnode1, vnode2);
      expect(elm.firstChild.style.getPropertyValue("--myVar")).toStrictEqual(
        ""
      );
      patch(vnode2, vnode3);
      expect(elm.firstChild.style.getPropertyValue("--myVar")).toStrictEqual(
        "2"
      );
    }
  });
  it("updates delayed styles in next frame", function (done) {
    const vnode1 = h("i", {
      style: { fontSize: "14px", delayed: { fontSize: "16px" } as any },
    });
    const vnode2 = h("i", {
      style: { fontSize: "18px", delayed: { fontSize: "20px" } as any },
    });
    elm = patch(vnode0, vnode1).elm;
    expect(elm.style.fontSize).toStrictEqual("14px");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        expect(elm.style.fontSize).toStrictEqual("16px");
        elm = patch(vnode1, vnode2).elm;
        expect(elm.style.fontSize).toStrictEqual("18px");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            expect(elm.style.fontSize).toStrictEqual("20px");
            done();
          });
        });
      });
    });
  });
  it.skip("applies tranform as transition on remove", function (done) {
    const btn = h(
      "button",
      {
        style: {
          transition: "transform 0.1s",
          remove: { transform: "translateY(100%)" } as any,
        },
      },
      ["A button"]
    );
    const vnode1 = h("div.parent", {}, [btn]);
    const vnode2 = h("div.parent", {}, [null]);
    document.body.appendChild(vnode0);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    const button = document.querySelector("button") as HTMLButtonElement;
    expect(button).not.toStrictEqual(null);
    button.addEventListener("transitionend", function () {
      expect(document.querySelector("button")).toStrictEqual(null);
      done();
    });
  });
  describe("using toVNode()", function () {
    it("handles (ignoring) comment nodes", function () {
      const comment = document.createComment("yolo");
      const prevElm = document.createElement("div");
      prevElm.appendChild(comment);
      const nextVNode = h("div", [h("span", "Hi")]);
      elm = patch(toVNode(prevElm), nextVNode).elm;
      expect(elm).toStrictEqual(prevElm);
      expect(elm.tagName).toStrictEqual("DIV");
      expect(elm.childNodes.length).toStrictEqual(1);
      expect(elm.childNodes[0].tagName).toStrictEqual("SPAN");
      expect(elm.childNodes[0].textContent).toStrictEqual("Hi");
    });
  });
});
