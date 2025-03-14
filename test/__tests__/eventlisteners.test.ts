import { VNode, init, eventListenersModule, h } from "../../src/index";

const patch = init([eventListenersModule]);

describe("event listeners", function () {
  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  it("attaches click event handler to element", function () {
    const result = [];
    function clicked(ev: Event) {
      result.push(ev);
    }
    const vnode = h("div", { on: { click: clicked } }, [
      h("a", "Click my parent"),
    ]);
    elm = patch(vnode0, vnode).elm;
    elm.click();
    expect(1).toStrictEqual(result.length);
  });
  it("does not attach new listener", function () {
    const result: number[] = [];
    // function clicked(ev) { result.push(ev); }
    const vnode1 = h(
      "div",
      {
        on: {
          click: function () {
            result.push(1);
          },
        },
      },
      [h("a", "Click my parent")]
    );
    const vnode2 = h(
      "div",
      {
        on: {
          click: function () {
            result.push(2);
          },
        },
      },
      [h("a", "Click my parent")]
    );
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    elm = patch(vnode1, vnode2).elm;
    elm.click();
    expect(result).toEqual([1, 2]);
  });
  it("detach attached click event handler to element", function () {
    const result: Event[] = [];
    function clicked(ev: Event) {
      result.push(ev);
    }
    const vnode1 = h("div", { on: { click: clicked } }, [
      h("a", "Click my parent"),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    expect(1).toStrictEqual(result.length);
    const vnode2 = h("div", { on: {} }, [h("a", "Click my parent")]);
    elm = patch(vnode1, vnode2).elm;
    elm.click();
    expect(1).toStrictEqual(result.length);
  });
  it("multiple event handlers for same event on same element", function () {
    let called = 0;
    function clicked(ev: Event, vnode: VNode) {
      ++called;
      // Check that the first argument is an event
      expect(true).toStrictEqual("target" in ev);
      // Check that the second argument was a vnode
      expect(vnode.sel).toStrictEqual("div");
    }
    const vnode1 = h("div", { on: { click: [clicked, clicked, clicked] } }, [
      h("a", "Click my parent"),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    expect(3).toStrictEqual(called);
    const vnode2 = h("div", { on: { click: [clicked, clicked] } }, [
      h("a", "Click my parent"),
    ]);
    elm = patch(vnode1, vnode2).elm;
    elm.click();
    expect(5).toStrictEqual(called);
  });
  it("access to virtual node in event handler", function () {
    const result: VNode[] = [];
    function clicked(this: VNode, ev: Event, vnode: VNode) {
      result.push(this);
      result.push(vnode);
    }
    const vnode1 = h("div", { on: { click: clicked } }, [
      h("a", "Click my parent"),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    expect(2).toStrictEqual(result.length);
    expect(vnode1).toStrictEqual(result[0]);
    expect(vnode1).toStrictEqual(result[1]);
  });
  it("shared handlers in parent and child nodes", function () {
    const result = [];
    const sharedHandlers = {
      click: function (ev: Event) {
        result.push(ev);
      },
    };
    const vnode1 = h("div", { on: sharedHandlers }, [
      h("a", { on: sharedHandlers }, "Click my parent"),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    expect(1).toStrictEqual(result.length);
    elm.firstChild.click();
    expect(3).toStrictEqual(result.length);
  });
});
