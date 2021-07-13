import shuffle from "lodash.shuffle";
import {
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  h,
  toVNode,
  vnode,
  VNode,
  htmlDomApi,
  CreateHook,
  InsertHook,
  PrePatchHook,
  RemoveHook,
  InitHook,
  DestroyHook,
  UpdateHook,
  Key,
} from "../../../src/index";

const hasSvgClassList = "classList" in SVGElement.prototype;
const patch = init([classModule, propsModule, eventListenersModule]);

function prop<T>(name: string) {
  return function (obj: { [index: string]: T }) {
    return obj[name];
  };
}

function map(fn: any, list: any[]) {
  const ret = [];
  for (let i = 0; i < list.length; ++i) {
    ret[i] = fn(list[i]);
  }
  return ret;
}
const inner = prop("innerHTML");
describe("patch", function () {
  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  describe("created element", function () {
    it("has tag", function () {
      elm = patch(vnode0, h("div")).elm;
      expect(elm.tagName).toEqual("DIV");
    });
    it("has different tag and id", function () {
      const elm = document.createElement("div");
      vnode0.appendChild(elm);
      const vnode1 = h("span#id");
      const patched = patch(elm, vnode1).elm as HTMLSpanElement;
      expect(patched.tagName).toEqual("SPAN");
      expect(patched.id).toEqual("id");
    });
    it("has id", function () {
      elm = patch(vnode0, h("div", [h("div#unique")])).elm;
      expect(elm.firstChild.id).toEqual("unique");
    });
    it("has correct namespace", function () {
      const SVGNamespace = "http://www.w3.org/2000/svg";
      const XHTMLNamespace = "http://www.w3.org/1999/xhtml";

      elm = patch(vnode0, h("div", [h("div", { ns: SVGNamespace })])).elm;
      expect(elm.firstChild.namespaceURI).toEqual(SVGNamespace);

      // verify that svg tag automatically gets svg namespace
      elm = patch(
        vnode0,
        h("svg", [
          h("foreignObject", [h("div", ["I am HTML embedded in SVG"])]),
        ])
      ).elm;
      expect(elm.namespaceURI).toEqual(SVGNamespace);
      expect(elm.firstChild.namespaceURI).toEqual(SVGNamespace);
      expect(elm.firstChild.firstChild.namespaceURI).toEqual(XHTMLNamespace);

      // verify that svg tag with extra selectors gets svg namespace
      elm = patch(vnode0, h("svg#some-id")).elm;
      expect(elm.namespaceURI).toEqual(SVGNamespace);

      // verify that non-svg tag beginning with 'svg' does NOT get namespace
      elm = patch(vnode0, h("svg-custom-el")).elm;
      expect(elm.namespaceURI).not.toEqual(SVGNamespace);
    });
    it("receives classes in selector", function () {
      elm = patch(vnode0, h("div", [h("i.am.a.class")])).elm;
      expect(elm.firstChild.classList).toContain("am");
      expect(elm.firstChild.classList).toContain("a");
      expect(elm.firstChild.classList).toContain("class");
    });
    it("receives classes in class property", function () {
      elm = patch(
        vnode0,
        h("i", { class: { am: true, a: true, class: true, not: false } })
      ).elm;
      expect(elm.classList).toContain("am");
      expect(elm.classList).toContain("a");
      expect(elm.classList).toContain("class");
      expect(elm.classList).not.toContain("not");
    });
    it("receives classes in selector when namespaced", function () {
      if (!hasSvgClassList) {
      } else {
        elm = patch(vnode0, h("svg", [h("g.am.a.class.too")])).elm;
        expect(elm.firstChild.classList).toContain("am");
        expect(elm.firstChild.classList).toContain("a");
        expect(elm.firstChild.classList).toContain("class");
      }
    });
    it("receives classes in class property when namespaced", function () {
      if (!hasSvgClassList) {
        this.skip();
      } else {
        elm = patch(
          vnode0,
          h("svg", [
            h("g", {
              class: { am: true, a: true, class: true, not: false, too: true },
            }),
          ])
        ).elm;
        expect(elm.firstChild.classList).toContain("am");
        expect(elm.firstChild.classList).toContain("a");
        expect(elm.firstChild.classList).toContain("class");
        expect(elm.firstChild.classList).not.toContain("not");
      }
    });
    it("handles classes from both selector and property", function () {
      elm = patch(
        vnode0,
        h("div", [h("i.has", { class: { classes: true } })])
      ).elm;
      expect(elm.firstChild.classList).toContain("has");
      expect(elm.firstChild.classList).toContain("classes");
    });
    it("can create elements with text content", function () {
      elm = patch(vnode0, h("div", ["I am a string"])).elm;
      expect(elm.innerHTML).toEqual("I am a string");
    });
    it("can create elements with span and text content", function () {
      elm = patch(vnode0, h("a", [h("span"), "I am a string"])).elm;
      expect(elm.childNodes[0].tagName).toEqual("SPAN");
      expect(elm.childNodes[1].textContent).toEqual("I am a string");
    });
    it("can create elements with props", function () {
      elm = patch(vnode0, h("a", { props: { src: "http://localhost/" } })).elm;
      expect(elm.src).toEqual("http://localhost/");
    });
    it("can create an element created inside an iframe", function (done) {
      const frame = document.createElement("iframe");
      frame.onload = function () {
        frame.contentDocument!.body.innerHTML = "<div>Thing 1</div>";
        const div0 = frame.contentDocument!.body.querySelector(
          "div"
        ) as HTMLDivElement;
        patch(div0, h("div", "Thing 2"));
        const div1 = frame.contentDocument!.body.querySelector(
          "div"
        ) as HTMLDivElement;
        expect(div1.textContent).toEqual("Thing 2");
        frame.remove();
        done();
      };
      document.body.appendChild(frame);
    });
    it("is a patch of the root element", function () {
      const elmWithIdAndClass = document.createElement("div");
      elmWithIdAndClass.id = "id";
      elmWithIdAndClass.className = "class";
      const vnode1 = h("div#id.class", [h("span", "Hi")]);
      elm = patch(elmWithIdAndClass, vnode1).elm;
      expect(elm).toEqual(elmWithIdAndClass);
      expect(elm.tagName).toEqual("DIV");
      expect(elm.id).toEqual("id");
      expect(elm.className).toEqual("class");
    });
    it("can create comments", function () {
      elm = patch(vnode0, h("!", "test")).elm;
      expect(elm.nodeType).toEqual(document.COMMENT_NODE);
      expect(elm.textContent).toEqual("test");
    });
  });

  describe("patching an element", function () {
    it("changes the elements classes", function () {
      const vnode1 = h("i", { class: { i: true, am: true, horse: true } });
      const vnode2 = h("i", { class: { i: true, am: true, horse: false } });
      patch(vnode0, vnode1);
      elm = patch(vnode1, vnode2).elm;
      expect(elm.classList).toContain("i");
      expect(elm.classList).toContain("am");
      expect(elm.classList).not.toContain("horse");
    });
    it("changes classes in selector", function () {
      const vnode1 = h("i", { class: { i: true, am: true, horse: true } });
      const vnode2 = h("i", { class: { i: true, am: true, horse: false } });
      patch(vnode0, vnode1);
      elm = patch(vnode1, vnode2).elm;
      expect(elm.classList).toContain("i");
      expect(elm.classList).toContain("am");
      expect(elm.classList).not.toContain("horse");
    });
    it("preserves memoized classes", function () {
      const cachedClass = { i: true, am: true, horse: false };
      const vnode1 = h("i", { class: cachedClass });
      const vnode2 = h("i", { class: cachedClass });
      elm = patch(vnode0, vnode1).elm;
      expect(elm.classList).toContain("i");
      expect(elm.classList).toContain("am");
      expect(elm.classList).not.toContain("horse");
      elm = patch(vnode1, vnode2).elm;
      expect(elm.classList).toContain("i");
      expect(elm.classList).toContain("am");
      expect(elm.classList).not.toContain("horse");
    });
    it("removes missing classes", function () {
      const vnode1 = h("i", { class: { i: true, am: true, horse: true } });
      const vnode2 = h("i", { class: { i: true, am: true } });
      patch(vnode0, vnode1);
      elm = patch(vnode1, vnode2).elm;
      expect(elm.classList).toContain("i");
      expect(elm.classList).toContain("am");
      expect(elm.classList).not.toContain("horse");
    });
    it("changes an elements props", function () {
      const vnode1 = h("a", { props: { src: "http://other/" } });
      const vnode2 = h("a", { props: { src: "http://localhost/" } });
      patch(vnode0, vnode1);
      elm = patch(vnode1, vnode2).elm;
      expect(elm.src).toEqual("http://localhost/");
    });
    it("can set prop value to `0`", function () {
      const patch = init([propsModule, styleModule]);
      const view = (scrollTop: number) =>
        h(
          "div",
          {
            style: { height: "100px", overflowY: "scroll" },
            props: { scrollTop },
          },
          [h("div", { style: { height: "200px" } })]
        );
      const vnode1 = view(0);
      const mountPoint = document.body.appendChild(
        document.createElement("div")
      );
      const { elm } = patch(mountPoint, vnode1);
      if (!(elm instanceof HTMLDivElement)) throw new Error();
      expect(elm.scrollTop).toEqual(0);
      const vnode2 = view(20);
      patch(vnode1, vnode2);
      expect(elm.scrollTop).toBeGreaterThan(18);
      expect(elm.scrollTop).toBeLessThanOrEqual(20);
      const vnode3 = view(0);
      patch(vnode2, vnode3);
      expect(elm.scrollTop).toEqual(0);
      document.body.removeChild(mountPoint);
    });
    it("can set prop value to empty string", function () {
      const vnode1 = h("p", { props: { textContent: "foo" } });
      const { elm } = patch(vnode0, vnode1);
      if (!(elm instanceof HTMLParagraphElement)) throw new Error();
      expect(elm.textContent).toEqual("foo");
      const vnode2 = h("p", { props: { textContent: "" } });
      patch(vnode1, vnode2);
      expect(elm.textContent).toEqual("");
    });
    it("preserves memoized props", function () {
      const cachedProps = { src: "http://other/" };
      const vnode1 = h("a", { props: cachedProps });
      const vnode2 = h("a", { props: cachedProps });
      elm = patch(vnode0, vnode1).elm;
      expect(elm.src).toEqual("http://other/");
      elm = patch(vnode1, vnode2).elm;
      expect(elm.src).toEqual("http://other/");
    });
    it("removes custom props", function () {
      const vnode1 = h("a", { props: { src: "http://other/" } });
      const vnode2 = h("a");
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      expect(elm.src).toEqual(undefined);
    });
    it("cannot remove native props", function () {
      const vnode1 = h("a", { props: { href: "http://example.com/" } });
      const vnode2 = h("a");
      const { elm: elm1 } = patch(vnode0, vnode1);
      if (!(elm1 instanceof HTMLAnchorElement)) throw new Error();
      expect(elm1.href).toEqual("http://example.com/");
      const { elm: elm2 } = patch(vnode1, vnode2);
      if (!(elm2 instanceof HTMLAnchorElement)) throw new Error();
      expect(elm2.href).toEqual("http://example.com/");
    });
    it("does not delete custom props", function () {
      const vnode1 = h("p", { props: { a: "foo" } });
      const vnode2 = h("p");
      const { elm } = patch(vnode0, vnode1);
      if (!(elm instanceof HTMLParagraphElement)) throw new Error();
      expect((elm as any).a).toEqual("foo");
      patch(vnode1, vnode2);
      expect((elm as any).a).toEqual("foo");
    });

    describe("custom elements", function () {
      if ("customElements" in window) {
        describe("customized built-in element", function () {
          const isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent
          );

          if (!isSafari) {
            class A extends HTMLParagraphElement {}
            class B extends HTMLParagraphElement {}

            beforeAll(function () {
              if ("customElements" in window) {
                customElements.define("p-a", A, { extends: "p" });
                customElements.define("p-b", B, { extends: "p" });
              }
            });
            it("can create custom elements", function () {
              if ("customElements" in window) {
                const vnode1 = h("p", { is: "p-a" });
                elm = patch(vnode0, vnode1).elm;
                expect(elm).toBeInstanceOf(A);
              }
            });
            it("handles changing is attribute", function () {
              const vnode1 = h("p", { is: "p-a" });
              const vnode2 = h("p", { is: "p-b" });
              elm = patch(vnode0, vnode1).elm;
              expect(elm).toBeInstanceOf(A);
              elm = patch(vnode1, vnode2).elm;
              expect(elm).toBeInstanceOf(B);
            });
          } else {
            it.skip("safari does not support customized built-in elements", () => {});
          }
        });
      } else {
        it.skip("browser does not support custom elements", () => {});
      }
    });

    describe("using toVNode()", function () {
      it("can remove previous children of the root element", function () {
        const h2 = document.createElement("h2");
        h2.textContent = "Hello";
        const prevElm = document.createElement("div");
        prevElm.id = "id";
        prevElm.className = "class";
        prevElm.appendChild(h2);
        const nextVNode = h("div#id.class", [h("span", "Hi")]);
        elm = patch(toVNode(prevElm), nextVNode).elm;
        expect(elm).toEqual(prevElm);
        expect(elm.tagName).toEqual("DIV");
        expect(elm.id).toEqual("id");
        expect(elm.className).toEqual("class");
        expect(elm.childNodes.length).toEqual(1);
        expect(elm.childNodes[0].tagName).toEqual("SPAN");
        expect(elm.childNodes[0].textContent).toEqual("Hi");
      });
      it("can support patching in a DocumentFragment", function () {
        const prevElm = document.createDocumentFragment();
        const nextVNode = vnode(
          "",
          {},
          [h("div#id.class", [h("span", "Hi")])],
          undefined,
          prevElm as any
        );
        elm = patch(toVNode(prevElm), nextVNode).elm;
        expect(elm).toEqual(prevElm);
        expect(elm.nodeType).toEqual(11);
        expect(elm.childNodes.length).toEqual(1);
        expect(elm.childNodes[0].tagName).toEqual("DIV");
        expect(elm.childNodes[0].id).toEqual("id");
        expect(elm.childNodes[0].className).toEqual("class");
        expect(elm.childNodes[0].childNodes.length).toEqual(1);
        expect(elm.childNodes[0].childNodes[0].tagName).toEqual("SPAN");
        expect(elm.childNodes[0].childNodes[0].textContent).toEqual("Hi");
      });
      it("can remove some children of the root element", function () {
        const h2 = document.createElement("h2");
        h2.textContent = "Hello";
        const prevElm = document.createElement("div");
        prevElm.id = "id";
        prevElm.className = "class";
        const text = document.createTextNode("Foobar");
        const reference = {};
        (text as any).testProperty = reference; // ensures we dont recreate the Text Node
        prevElm.appendChild(text);
        prevElm.appendChild(h2);
        const nextVNode = h("div#id.class", ["Foobar"]);
        elm = patch(toVNode(prevElm), nextVNode).elm;
        expect(elm).toEqual(prevElm);
        expect(elm.tagName).toEqual("DIV");
        expect(elm.id).toEqual("id");
        expect(elm.className).toEqual("class");
        expect(elm.childNodes.length).toEqual(1);
        expect(elm.childNodes[0].nodeType).toEqual(3);
        expect(elm.childNodes[0].wholeText).toEqual("Foobar");
        expect(elm.childNodes[0].testProperty).toEqual(reference);
      });
      it("can remove text elements", function () {
        const h2 = document.createElement("h2");
        h2.textContent = "Hello";
        const prevElm = document.createElement("div");
        prevElm.id = "id";
        prevElm.className = "class";
        const text = document.createTextNode("Foobar");
        prevElm.appendChild(text);
        prevElm.appendChild(h2);
        const nextVNode = h("div#id.class", [h("h2", "Hello")]);
        elm = patch(toVNode(prevElm), nextVNode).elm;
        expect(elm).toEqual(prevElm);
        expect(elm.tagName).toEqual("DIV");
        expect(elm.id).toEqual("id");
        expect(elm.className).toEqual("class");
        expect(elm.childNodes.length).toEqual(1);
        expect(elm.childNodes[0].nodeType).toEqual(1);
        expect(elm.childNodes[0].textContent).toEqual("Hello");
      });
      it("can work with domApi", function () {
        const domApi = {
          ...htmlDomApi,
          tagName: function (elm: Element) {
            return "x-" + elm.tagName.toUpperCase();
          },
        };
        const h2 = document.createElement("h2");
        h2.id = "hx";
        h2.setAttribute("data-env", "xyz");
        const text = document.createTextNode("Foobar");
        const elm = document.createElement("div");
        elm.id = "id";
        elm.className = "class other";
        elm.setAttribute("data", "value");
        elm.appendChild(h2);
        elm.appendChild(text);
        const vnode = toVNode(elm, domApi);
        expect(vnode.sel).toEqual("x-div#id.class.other");
        expect(vnode.data).toEqual({ attrs: { data: "value" } });
        const children = vnode.children as [VNode, VNode];
        expect(children[0].sel).toEqual("x-h2#hx");
        expect(children[0].data).toEqual({ attrs: { "data-env": "xyz" } });
        expect(children[1].text).toEqual("Foobar");
      });
    });

    describe("updating children with keys", function () {
      function spanNum(n?: null | Key) {
        if (n == null) {
          return n;
        } else if (typeof n === "string") {
          return h("span", {}, n);
        } else if (typeof n === "number") {
          return h("span", { key: n }, n.toString());
        } else {
          return h("span", { key: n }, "symbol");
        }
      }
      describe("addition of elements", function () {
        it("appends elements", function () {
          const vnode1 = h("span", [1].map(spanNum));
          const vnode2 = h("span", [1, 2, 3].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(1);
          elm = patch(vnode1, vnode2).elm;
          expect(elm.children.length).toEqual(3);
          expect(elm.children[1].innerHTML).toEqual("2");
          expect(elm.children[2].innerHTML).toEqual("3");
        });
        it("prepends elements", function () {
          const vnode1 = h("span", [4, 5].map(spanNum));
          const vnode2 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(2);
          elm = patch(vnode1, vnode2).elm;
          expect(map(inner, elm.children)).toStrictEqual([
            "1",
            "2",
            "3",
            "4",
            "5",
          ]);
        });
        it("add elements in the middle", function () {
          const vnode1 = h("span", [1, 2, 4, 5].map(spanNum));
          const vnode2 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(4);
          expect(elm.children.length).toEqual(4);
          elm = patch(vnode1, vnode2).elm;
          expect(map(inner, elm.children)).toStrictEqual([
            "1",
            "2",
            "3",
            "4",
            "5",
          ]);
        });
        it("add elements at begin and end", function () {
          const vnode1 = h("span", [2, 3, 4].map(spanNum));
          const vnode2 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(3);
          elm = patch(vnode1, vnode2).elm;
          expect(map(inner, elm.children)).toStrictEqual([
            "1",
            "2",
            "3",
            "4",
            "5",
          ]);
        });
        it("adds children to parent with no children", function () {
          const vnode1 = h("span", { key: "span" });
          const vnode2 = h("span", { key: "span" }, [1, 2, 3].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(0);
          elm = patch(vnode1, vnode2).elm;
          expect(map(inner, elm.children)).toStrictEqual(["1", "2", "3"]);
        });
        it("removes all children from parent", function () {
          const vnode1 = h("span", { key: "span" }, [1, 2, 3].map(spanNum));
          const vnode2 = h("span", { key: "span" });
          elm = patch(vnode0, vnode1).elm;
          expect(map(inner, elm.children)).toStrictEqual(["1", "2", "3"]);
          elm = patch(vnode1, vnode2).elm;
          expect(elm.children.length).toEqual(0);
        });
        it("update one child with same key but different sel", function () {
          const vnode1 = h("span", { key: "span" }, [1, 2, 3].map(spanNum));
          const vnode2 = h("span", { key: "span" }, [
            spanNum(1),
            h("i", { key: 2 }, "2"),
            spanNum(3),
          ]);
          elm = patch(vnode0, vnode1).elm;
          expect(map(inner, elm.children)).toStrictEqual(["1", "2", "3"]);
          elm = patch(vnode1, vnode2).elm;
          expect(map(inner, elm.children)).toStrictEqual(["1", "2", "3"]);
          expect(elm.children.length).toEqual(3);
          expect(elm.children[1].tagName).toEqual("I");
        });
      });
      describe("removal of elements", function () {
        it("removes elements from the beginning", function () {
          const vnode1 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          const vnode2 = h("span", [3, 4, 5].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(5);
          elm = patch(vnode1, vnode2).elm;
          expect(map(inner, elm.children)).toStrictEqual(["3", "4", "5"]);
        });
        it("removes elements from the end", function () {
          const vnode1 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          const vnode2 = h("span", [1, 2, 3].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(5);
          elm = patch(vnode1, vnode2).elm;
          expect(elm.children.length).toEqual(3);
          expect(elm.children[0].innerHTML).toEqual("1");
          expect(elm.children[1].innerHTML).toEqual("2");
          expect(elm.children[2].innerHTML).toEqual("3");
        });
        it("removes elements from the middle", function () {
          const vnode1 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          const vnode2 = h("span", [1, 2, 4, 5].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(5);
          elm = patch(vnode1, vnode2).elm;
          expect(elm.children.length).toEqual(4);
          expect(elm.children[0].innerHTML).toStrictEqual("1");
          expect(elm.children[0].innerHTML).toEqual("1");
          expect(elm.children[1].innerHTML).toEqual("2");
          expect(elm.children[2].innerHTML).toEqual("4");
          expect(elm.children[3].innerHTML).toEqual("5");
        });
      });
      describe("element reordering", function () {
        it("moves element forward", function () {
          const vnode1 = h("span", [1, 2, 3, 4].map(spanNum));
          const vnode2 = h("span", [2, 3, 1, 4].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(4);
          elm = patch(vnode1, vnode2).elm;
          expect(elm.children.length).toEqual(4);
          expect(elm.children[0].innerHTML).toEqual("2");
          expect(elm.children[1].innerHTML).toEqual("3");
          expect(elm.children[2].innerHTML).toEqual("1");
          expect(elm.children[3].innerHTML).toEqual("4");
        });
        it("moves element to end", function () {
          const vnode1 = h("span", [1, 2, 3].map(spanNum));
          const vnode2 = h("span", [2, 3, 1].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(3);
          elm = patch(vnode1, vnode2).elm;
          expect(elm.children.length).toEqual(3);
          expect(elm.children[0].innerHTML).toEqual("2");
          expect(elm.children[1].innerHTML).toEqual("3");
          expect(elm.children[2].innerHTML).toEqual("1");
        });
        it("moves element backwards", function () {
          const vnode1 = h("span", [1, 2, 3, 4].map(spanNum));
          const vnode2 = h("span", [1, 4, 2, 3].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(4);
          elm = patch(vnode1, vnode2).elm;
          expect(elm.children.length).toEqual(4);
          expect(elm.children[0].innerHTML).toEqual("1");
          expect(elm.children[1].innerHTML).toEqual("4");
          expect(elm.children[2].innerHTML).toEqual("2");
          expect(elm.children[3].innerHTML).toEqual("3");
        });
        it("swaps first and last", function () {
          const vnode1 = h("span", [1, 2, 3, 4].map(spanNum));
          const vnode2 = h("span", [4, 2, 3, 1].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(4);
          elm = patch(vnode1, vnode2).elm;
          expect(elm.children.length).toEqual(4);
          expect(elm.children[0].innerHTML).toEqual("4");
          expect(elm.children[1].innerHTML).toEqual("2");
          expect(elm.children[2].innerHTML).toEqual("3");
          expect(elm.children[3].innerHTML).toEqual("1");
        });
      });
      describe("combinations of additions, removals and reorderings", function () {
        it("move to left and replace", function () {
          const vnode1 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          const vnode2 = h("span", [4, 1, 2, 3, 6].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(5);
          elm = patch(vnode1, vnode2).elm;
          expect(elm.children.length).toEqual(5);
          expect(elm.children[0].innerHTML).toEqual("4");
          expect(elm.children[1].innerHTML).toEqual("1");
          expect(elm.children[2].innerHTML).toEqual("2");
          expect(elm.children[3].innerHTML).toEqual("3");
          expect(elm.children[4].innerHTML).toEqual("6");
        });
        it("moves to left and leaves hole", function () {
          const vnode1 = h("span", [1, 4, 5].map(spanNum));
          const vnode2 = h("span", [4, 6].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(3);
          elm = patch(vnode1, vnode2).elm;
          expect(map(inner, elm.children)).toStrictEqual(["4", "6"]);
        });
        it("handles moved and set to undefined element ending at the end", function () {
          const vnode1 = h("span", [2, 4, 5].map(spanNum));
          const vnode2 = h("span", [4, 5, 3].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(3);
          elm = patch(vnode1, vnode2).elm;
          expect(elm.children.length).toEqual(3);
          expect(elm.children[0].innerHTML).toEqual("4");
          expect(elm.children[1].innerHTML).toEqual("5");
          expect(elm.children[2].innerHTML).toEqual("3");
        });
        it("moves a key in non-keyed nodes with a size up", function () {
          const vnode1 = h("span", [1, "a", "b", "c"].map(spanNum));
          const vnode2 = h("span", ["d", "a", "b", "c", 1, "e"].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          expect(elm.childNodes.length).toEqual(4);
          expect(elm.textContent).toEqual("1abc");
          elm = patch(vnode1, vnode2).elm;
          expect(elm.childNodes.length).toEqual(6);
          expect(elm.textContent).toEqual("dabc1e");
        });
        it("accepts symbol as key", function () {
          const vnode1 = h("span", [Symbol()].map(spanNum));
          const vnode2 = h(
            "span",
            [Symbol("1"), Symbol("2"), Symbol("3")].map(spanNum)
          );
          elm = patch(vnode0, vnode1).elm;
          expect(elm.children.length).toEqual(1);
          elm = patch(vnode1, vnode2).elm;
          expect(elm.children.length).toEqual(3);
          expect(elm.children[1].innerHTML).toEqual("symbol");
          expect(elm.children[2].innerHTML).toEqual("symbol");
        });
      });
      it("reverses elements", function () {
        const vnode1 = h("span", [1, 2, 3, 4, 5, 6, 7, 8].map(spanNum));
        const vnode2 = h("span", [8, 7, 6, 5, 4, 3, 2, 1].map(spanNum));
        elm = patch(vnode0, vnode1).elm;
        expect(elm.children.length).toEqual(8);
        elm = patch(vnode1, vnode2).elm;
        expect(map(inner, elm.children)).toStrictEqual([
          "8",
          "7",
          "6",
          "5",
          "4",
          "3",
          "2",
          "1",
        ]);
      });
      it("something", function () {
        const vnode1 = h("span", [0, 1, 2, 3, 4, 5].map(spanNum));
        const vnode2 = h("span", [4, 3, 2, 1, 5, 0].map(spanNum));
        elm = patch(vnode0, vnode1).elm;
        expect(elm.children.length).toEqual(6);
        elm = patch(vnode1, vnode2).elm;
        expect(map(inner, elm.children)).toStrictEqual([
          "4",
          "3",
          "2",
          "1",
          "5",
          "0",
        ]);
      });
      it("handles random shuffles", function () {
        let n;
        let i;
        const arr = [];
        const opacities: string[] = [];
        const elms = 14;
        const samples = 5;
        function spanNumWithOpacity(n: number, o: string) {
          return h("span", { key: n, style: { opacity: o } }, n.toString());
        }
        for (n = 0; n < elms; ++n) {
          arr[n] = n;
        }
        for (n = 0; n < samples; ++n) {
          const vnode1 = h(
            "span",
            arr.map(function (n) {
              return spanNumWithOpacity(n, "1");
            })
          );
          const shufArr = shuffle(arr.slice(0));
          let elm: HTMLDivElement | HTMLSpanElement =
            document.createElement("div");
          elm = patch(elm, vnode1).elm as HTMLSpanElement;
          for (i = 0; i < elms; ++i) {
            expect(elm.children[i].innerHTML).toEqual(i.toString());
            opacities[i] = Math.random().toFixed(5).toString();
          }
          const vnode2 = h(
            "span",
            arr.map(function (n) {
              return spanNumWithOpacity(shufArr[n], opacities[n]);
            })
          );
          elm = patch(vnode1, vnode2).elm as HTMLSpanElement;
          for (i = 0; i < elms; ++i) {
            expect(elm.children[i].innerHTML).toEqual(shufArr[i].toString());
            const opacity = (elm.children[i] as HTMLSpanElement).style.opacity;
            expect(opacities[i].indexOf(opacity)).toEqual(0);
          }
        }
      });
      it("supports null/undefined children", function () {
        const vnode1 = h("i", [0, 1, 2, 3, 4, 5].map(spanNum));
        const vnode2 = h(
          "i",
          [null, 2, undefined, null, 1, 0, null, 5, 4, null, 3, undefined].map(
            spanNum
          )
        );
        elm = patch(vnode0, vnode1).elm;
        expect(elm.children.length).toEqual(6);
        elm = patch(vnode1, vnode2).elm;
        expect(map(inner, elm.children)).toStrictEqual([
          "2",
          "1",
          "0",
          "5",
          "4",
          "3",
        ]);
      });
      it("supports all null/undefined children", function () {
        const vnode1 = h("i", [0, 1, 2, 3, 4, 5].map(spanNum));
        const vnode2 = h("i", [null, null, undefined, null, null, undefined]);
        const vnode3 = h("i", [5, 4, 3, 2, 1, 0].map(spanNum));
        patch(vnode0, vnode1);
        elm = patch(vnode1, vnode2).elm;
        expect(elm.children.length).toEqual(0);
        elm = patch(vnode2, vnode3).elm;
        expect(map(inner, elm.children)).toStrictEqual([
          "5",
          "4",
          "3",
          "2",
          "1",
          "0",
        ]);
      });
      it("handles random shuffles with null/undefined children", function () {
        let i;
        let j;
        let r;
        let len;
        let arr;
        const maxArrLen = 15;
        const samples = 5;
        let vnode1 = vnode0;
        let vnode2;
        for (i = 0; i < samples; ++i, vnode1 = vnode2) {
          len = Math.floor(Math.random() * maxArrLen);
          arr = [];
          for (j = 0; j < len; ++j) {
            if ((r = Math.random()) < 0.5) arr[j] = String(j);
            else if (r < 0.75) arr[j] = null;
            else arr[j] = undefined;
          }
          shuffle(arr);
          vnode2 = h("div", arr.map(spanNum));
          elm = patch(vnode1, vnode2).elm;
          expect(map(inner, elm.children)).toStrictEqual(
            arr.filter(function (x) {
              return x != null;
            })
          );
        }
      });
    });

    describe("updating children without keys", function () {
      it("appends elements", function () {
        const vnode1 = h("div", [h("span", "Hello")]);
        const vnode2 = h("div", [h("span", "Hello"), h("span", "World")]);
        elm = patch(vnode0, vnode1).elm;
        expect(map(inner, elm.children)).toEqual(["Hello"]);
        elm = patch(vnode1, vnode2).elm;
        expect(map(inner, elm.children)).toEqual(["Hello", "World"]);
      });
      it("handles unmoved text nodes", function () {
        const vnode1 = h("div", ["Text", h("span", "Span")]);
        const vnode2 = h("div", ["Text", h("span", "Span")]);
        elm = patch(vnode0, vnode1).elm;
        expect(elm.childNodes[0].textContent).toStrictEqual("Text");
        elm = patch(vnode1, vnode2).elm;
        expect(elm.childNodes[0].textContent).toStrictEqual("Text");
      });
      it("handles changing text children", function () {
        const vnode1 = h("div", ["Text", h("span", "Span")]);
        const vnode2 = h("div", ["Text2", h("span", "Span")]);
        elm = patch(vnode0, vnode1).elm;
        expect(elm.childNodes[0].textContent).toStrictEqual("Text");
        elm = patch(vnode1, vnode2).elm;
        expect(elm.childNodes[0].textContent).toStrictEqual("Text2");
      });
      it("handles unmoved comment nodes", function () {
        const vnode1 = h("div", [h("!", "Text"), h("span", "Span")]);
        const vnode2 = h("div", [h("!", "Text"), h("span", "Span")]);
        elm = patch(vnode0, vnode1).elm;
        expect(elm.childNodes[0].textContent).toStrictEqual("Text");
        elm = patch(vnode1, vnode2).elm;
        expect(elm.childNodes[0].textContent).toStrictEqual("Text");
      });
      it("handles changing comment text", function () {
        const vnode1 = h("div", [h("!", "Text"), h("span", "Span")]);
        const vnode2 = h("div", [h("!", "Text2"), h("span", "Span")]);
        elm = patch(vnode0, vnode1).elm;
        expect(elm.childNodes[0].textContent).toStrictEqual("Text");
        elm = patch(vnode1, vnode2).elm;
        expect(elm.childNodes[0].textContent).toStrictEqual("Text2");
      });
      it("handles changing empty comment", function () {
        const vnode1 = h("div", [h("!"), h("span", "Span")]);
        const vnode2 = h("div", [h("!", "Test"), h("span", "Span")]);
        elm = patch(vnode0, vnode1).elm;
        expect(elm.childNodes[0].textContent).toStrictEqual("");
        elm = patch(vnode1, vnode2).elm;
        expect(elm.childNodes[0].textContent).toStrictEqual("Test");
      });
      it("prepends element", function () {
        const vnode1 = h("div", [h("span", "World")]);
        const vnode2 = h("div", [h("span", "Hello"), h("span", "World")]);
        elm = patch(vnode0, vnode1).elm;
        expect(map(inner, elm.children)).toEqual(["World"]);
        elm = patch(vnode1, vnode2).elm;
        expect(map(inner, elm.children)).toEqual(["Hello", "World"]);
      });
      it("prepends element of different tag type", function () {
        const vnode1 = h("div", [h("span", "World")]);
        const vnode2 = h("div", [h("div", "Hello"), h("span", "World")]);
        elm = patch(vnode0, vnode1).elm;
        expect(map(inner, elm.children)).toEqual(["World"]);
        elm = patch(vnode1, vnode2).elm;
        expect(map(prop("tagName"), elm.children)).toEqual(["DIV", "SPAN"]);
        expect(map(inner, elm.children)).toEqual(["Hello", "World"]);
      });
      it("removes elements", function () {
        const vnode1 = h("div", [
          h("span", "One"),
          h("span", "Two"),
          h("span", "Three"),
        ]);
        const vnode2 = h("div", [h("span", "One"), h("span", "Three")]);
        elm = patch(vnode0, vnode1).elm;
        expect(map(inner, elm.children)).toEqual(["One", "Two", "Three"]);
        elm = patch(vnode1, vnode2).elm;
        expect(map(inner, elm.children)).toEqual(["One", "Three"]);
      });
      it("removes a single text node", function () {
        const vnode1 = h("div", "One");
        const vnode2 = h("div");
        patch(vnode0, vnode1);
        expect(elm.textContent).toStrictEqual("One");
        patch(vnode1, vnode2);
        expect(elm.textContent).toStrictEqual("");
      });
      it("removes a single text node when children are updated", function () {
        const vnode1 = h("div", "One");
        const vnode2 = h("div", [h("div", "Two"), h("span", "Three")]);
        patch(vnode0, vnode1);
        expect(elm.textContent).toStrictEqual("One");
        patch(vnode1, vnode2);
        expect(map(prop("textContent"), elm.childNodes)).toEqual([
          "Two",
          "Three",
        ]);
      });
      it("removes a text node among other elements", function () {
        const vnode1 = h("div", ["One", h("span", "Two")]);
        const vnode2 = h("div", [h("div", "Three")]);
        patch(vnode0, vnode1);
        expect(map(prop("textContent"), elm.childNodes)).toEqual([
          "One",
          "Two",
        ]);
        patch(vnode1, vnode2);
        expect(elm.childNodes.length).toStrictEqual(1);
        expect(elm.childNodes[0].tagName).toStrictEqual("DIV");
        expect(elm.childNodes[0].textContent).toStrictEqual("Three");
      });
      it("reorders elements", function () {
        const vnode1 = h("div", [
          h("span", "One"),
          h("div", "Two"),
          h("b", "Three"),
        ]);
        const vnode2 = h("div", [
          h("b", "Three"),
          h("span", "One"),
          h("div", "Two"),
        ]);
        elm = patch(vnode0, vnode1).elm;
        expect(map(inner, elm.children)).toEqual(["One", "Two", "Three"]);
        elm = patch(vnode1, vnode2).elm;
        expect(map(prop("tagName"), elm.children)).toEqual([
          "B",
          "SPAN",
          "DIV",
        ]);
        expect(map(inner, elm.children)).toEqual(["Three", "One", "Two"]);
      });
      it("supports null/undefined children", function () {
        const vnode1 = h("i", [null, h("i", "1"), h("i", "2"), null]);
        const vnode2 = h("i", [
          h("i", "2"),
          undefined,
          undefined,
          h("i", "1"),
          undefined,
        ]);
        const vnode3 = h("i", [
          null,
          h("i", "1"),
          undefined,
          null,
          h("i", "2"),
          undefined,
          null,
        ]);
        elm = patch(vnode0, vnode1).elm;
        expect(map(inner, elm.children)).toEqual(["1", "2"]);
        elm = patch(vnode1, vnode2).elm;
        expect(map(inner, elm.children)).toEqual(["2", "1"]);
        elm = patch(vnode2, vnode3).elm;
        expect(map(inner, elm.children)).toEqual(["1", "2"]);
      });
      it("supports all null/undefined children", function () {
        const vnode1 = h("i", [h("i", "1"), h("i", "2")]);
        const vnode2 = h("i", [null, undefined]);
        const vnode3 = h("i", [h("i", "2"), h("i", "1")]);
        patch(vnode0, vnode1);
        elm = patch(vnode1, vnode2).elm;
        expect(elm.children.length).toStrictEqual(0);
        elm = patch(vnode2, vnode3).elm;
        expect(map(inner, elm.children)).toEqual(["2", "1"]);
      });
    });
  });
});
