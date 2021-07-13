import { init, h, attributesModule } from "../../src/index";

const patch = init([attributesModule]);

describe("svg", function () {
  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement("svg");
    vnode0 = elm;
  });

  it("removes child svg elements", function () {
    const a = h("svg", {}, [h("g"), h("g")]);
    const b = h("svg", {}, [h("g")]);
    const result = patch(patch(vnode0, a), b).elm as SVGElement;
    expect(result.childNodes.length).toStrictEqual(1);
  });

  it("adds correctly xlink namespaced attribute", function () {
    const xlinkNS = "http://www.w3.org/1999/xlink";
    const testUrl = "/test";
    const a = h("svg", {}, [
      h(
        "use",
        {
          attrs: { "xlink:href": testUrl },
        },
        []
      ),
    ]);

    const result = patch(vnode0, a).elm as SVGElement;
    expect(result.childNodes.length).toStrictEqual(1);
    const child = result.childNodes[0] as SVGUseElement;
    expect(child.getAttribute("xlink:href")).toStrictEqual(testUrl);
    expect(child.getAttributeNS(xlinkNS, "href")).toStrictEqual(testUrl);
  });

  it("adds correctly xml namespaced attribute", function () {
    const xmlNS = "http://www.w3.org/XML/1998/namespace";
    const testAttrValue = "und";
    const a = h("svg", { attrs: { "xml:lang": testAttrValue } }, []);

    const result = patch(vnode0, a).elm as SVGElement;
    expect(result.getAttributeNS(xmlNS, "lang")).toStrictEqual(testAttrValue);
    expect(result.getAttribute("xml:lang")).toStrictEqual(testAttrValue);
  });
});
