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
const patch = init([classModule, propsModule, eventListenersModule]);
describe("hooks", function () {
  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  describe("element hooks", function () {
    it("calls `create` listener before inserted into parent but after children", function () {
      const result = [];
      const cb: CreateHook = (empty, vnode) => {
        expect(vnode.elm).toBeInstanceOf(Element);
        expect((vnode.elm as HTMLDivElement).children.length).toStrictEqual(2);
        expect(vnode.elm!.parentNode).toStrictEqual(null);
        result.push(vnode);
      };
      const vnode1 = h("div", [
        h("span", "First sibling"),
        h("div", { hook: { create: cb } }, [
          h("span", "Child 1"),
          h("span", "Child 2"),
        ]),
        h("span", "Can't touch me"),
      ]);
      patch(vnode0, vnode1);
      expect(1).toStrictEqual(result.length);
    });
    it("calls `insert` listener after both parents, siblings and children have been inserted", function () {
      const result = [];
      const cb: InsertHook = (vnode) => {
        expect(vnode.elm).toBeInstanceOf(Element);
        expect((vnode.elm as HTMLDivElement).children.length).toStrictEqual(2);
        expect(vnode.elm!.parentNode!.children.length).toStrictEqual(3);
        result.push(vnode);
      };
      const vnode1 = h("div", [
        h("span", "First sibling"),
        h("div", { hook: { insert: cb } }, [
          h("span", "Child 1"),
          h("span", "Child 2"),
        ]),
        h("span", "Can touch me"),
      ]);
      patch(vnode0, vnode1);
      expect(1).toStrictEqual(result.length);
    });
    it("calls `prepatch` listener", function () {
      const result = [];
      const cb: PrePatchHook = (oldVnode, vnode) => {
        expect(oldVnode).toStrictEqual(vnode1.children![1]);
        expect(vnode).toStrictEqual(vnode2.children![1]);
        result.push(vnode);
      };
      const vnode1 = h("div", [
        h("span", "First sibling"),
        h("div", { hook: { prepatch: cb } }, [
          h("span", "Child 1"),
          h("span", "Child 2"),
        ]),
      ]);
      const vnode2 = h("div", [
        h("span", "First sibling"),
        h("div", { hook: { prepatch: cb } }, [
          h("span", "Child 1"),
          h("span", "Child 2"),
        ]),
      ]);
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      expect(result.length).toStrictEqual(1);
    });
    it("calls `postpatch` after `prepatch` listener", function () {
      let pre = 0;
      let post = 0;
      function preCb() {
        pre++;
      }
      function postCb() {
        expect(pre).toStrictEqual(post + 1);
        post++;
      }
      const vnode1 = h("div", [
        h("span", "First sibling"),
        h("div", { hook: { prepatch: preCb, postpatch: postCb } }, [
          h("span", "Child 1"),
          h("span", "Child 2"),
        ]),
      ]);
      const vnode2 = h("div", [
        h("span", "First sibling"),
        h("div", { hook: { prepatch: preCb, postpatch: postCb } }, [
          h("span", "Child 1"),
          h("span", "Child 2"),
        ]),
      ]);
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      expect(pre).toStrictEqual(1);
      expect(post).toStrictEqual(1);
    });
    it("calls `update` listener", function () {
      const result1: VNode[] = [];
      const result2: VNode[] = [];
      function cb(result: VNode[], oldVnode: VNode, vnode: VNode) {
        if (result.length > 0) {
          console.log(result[result.length - 1]);
          console.log(oldVnode);
          expect(result[result.length - 1]).toStrictEqual(oldVnode);
        }
        result.push(vnode);
      }
      const vnode1 = h("div", [
        h("span", "First sibling"),
        h("div", { hook: { update: cb.bind(null, result1) } }, [
          h("span", "Child 1"),
          h("span", { hook: { update: cb.bind(null, result2) } }, "Child 2"),
        ]),
      ]);
      const vnode2 = h("div", [
        h("span", "First sibling"),
        h("div", { hook: { update: cb.bind(null, result1) } }, [
          h("span", "Child 1"),
          h("span", { hook: { update: cb.bind(null, result2) } }, "Child 2"),
        ]),
      ]);
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      expect(result1.length).toStrictEqual(1);
      expect(result2.length).toStrictEqual(1);
    });
    it("calls `remove` listener", function () {
      const result = [];
      const cb: RemoveHook = (vnode, rm) => {
        const parent = vnode.elm!.parentNode as HTMLDivElement;
        expect(vnode.elm).toBeInstanceOf(Element);
        expect((vnode.elm as HTMLDivElement).children.length).toStrictEqual(2);
        expect(parent.children.length).toStrictEqual(2);
        result.push(vnode);
        rm();
        expect(parent.children.length).toStrictEqual(1);
      };
      const vnode1 = h("div", [
        h("span", "First sibling"),
        h("div", { hook: { remove: cb } }, [
          h("span", "Child 1"),
          h("span", "Child 2"),
        ]),
      ]);
      const vnode2 = h("div", [h("span", "First sibling")]);
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      expect(1).toStrictEqual(result.length);
    });
    it("calls `destroy` listener when patching text node over node with children", function () {
      let calls = 0;
      function cb() {
        calls++;
      }
      const vnode1 = h("div", [
        h("div", { hook: { destroy: cb } }, [h("span", "Child 1")]),
      ]);
      const vnode2 = h("div", "Text node");
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      expect(calls).toStrictEqual(1);
    });
    it("calls `init` and `prepatch` listeners on root", function () {
      let count = 0;
      const init: InitHook = (vnode) => {
        expect(vnode).toStrictEqual(vnode2);
        count += 1;
      };
      const prepatch: PrePatchHook = (oldVnode, vnode) => {
        expect(vnode).toStrictEqual(vnode1);
        count += 1;
      };
      const vnode1 = h("div", { hook: { init: init, prepatch: prepatch } });
      patch(vnode0, vnode1);
      expect(1).toStrictEqual(count);
      const vnode2 = h("span", { hook: { init: init, prepatch: prepatch } });
      patch(vnode1, vnode2);
      expect(2).toStrictEqual(count);
    });
    it("removes element when all remove listeners are done", function () {
      let rm1, rm2, rm3;
      const patch = init([
        {
          remove: function (_, rm) {
            rm1 = rm;
          },
        },
        {
          remove: function (_, rm) {
            rm2 = rm;
          },
        },
      ]);
      const vnode1 = h("div", [
        h("a", {
          hook: {
            remove: function (_, rm) {
              rm3 = rm;
            },
          },
        }),
      ]);
      const vnode2 = h("div", []);
      elm = patch(vnode0, vnode1).elm;
      expect(elm.children.length).toStrictEqual(1);
      elm = patch(vnode1, vnode2).elm;
      expect(elm.children.length).toStrictEqual(1);
      (rm1 as any)();
      expect(elm.children.length).toStrictEqual(1);
      (rm3 as any)();
      expect(elm.children.length).toStrictEqual(1);
      (rm2 as any)();
      expect(elm.children.length).toStrictEqual(0);
    });
    it("invokes remove hook on replaced root", function () {
      const result = [];
      const parent = document.createElement("div");
      const vnode0 = document.createElement("div");
      parent.appendChild(vnode0);
      const cb: RemoveHook = (vnode, rm) => {
        result.push(vnode);
        rm();
      };
      const vnode1 = h("div", { hook: { remove: cb } }, [
        h("b", "Child 1"),
        h("i", "Child 2"),
      ]);
      const vnode2 = h("span", [h("b", "Child 1"), h("i", "Child 2")]);
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      expect(1).toStrictEqual(result.length);
    });
  });
  describe("module hooks", function () {
    it("invokes `pre` and `post` hook", function () {
      const result: string[] = [];
      const patch = init([
        {
          pre: function () {
            result.push("pre");
          },
        },
        {
          post: function () {
            result.push("post");
          },
        },
      ]);
      const vnode1 = h("div");
      patch(vnode0, vnode1);
      expect(result).toEqual(["pre", "post"]);
    });
    it("invokes global `destroy` hook for all removed children", function () {
      const result = [];
      const cb: DestroyHook = (vnode) => {
        result.push(vnode);
      };
      const vnode1 = h("div", [
        h("span", "First sibling"),
        h("div", [
          h("span", { hook: { destroy: cb } }, "Child 1"),
          h("span", "Child 2"),
        ]),
      ]);
      const vnode2 = h("div");
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      expect(result.length).toStrictEqual(1);
    });
    it("handles text vnodes with `undefined` `data` property", function () {
      const vnode1 = h("div", [" "]);
      const vnode2 = h("div", []);
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
    });
    it("invokes `destroy` module hook for all removed children", function () {
      let created = 0;
      let destroyed = 0;
      const patch = init([
        {
          create: function () {
            created++;
          },
        },
        {
          destroy: function () {
            destroyed++;
          },
        },
      ]);
      const vnode1 = h("div", [
        h("span", "First sibling"),
        h("div", [h("span", "Child 1"), h("span", "Child 2")]),
      ]);
      const vnode2 = h("div");
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      expect(created).toStrictEqual(4);
      expect(destroyed).toStrictEqual(4);
    });
    it("does not invoke `create` and `remove` module hook for text nodes", function () {
      let created = 0;
      let removed = 0;
      const patch = init([
        {
          create: function () {
            created++;
          },
        },
        {
          remove: function () {
            removed++;
          },
        },
      ]);
      const vnode1 = h("div", [
        h("span", "First child"),
        "",
        h("span", "Third child"),
      ]);
      const vnode2 = h("div");
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      expect(created).toStrictEqual(2);
      expect(removed).toStrictEqual(2);
    });
    it("does not invoke `destroy` module hook for text nodes", function () {
      let created = 0;
      let destroyed = 0;
      const patch = init([
        {
          create: function () {
            created++;
          },
        },
        {
          destroy: function () {
            destroyed++;
          },
        },
      ]);
      const vnode1 = h("div", [
        h("span", "First sibling"),
        h("div", [h("span", "Child 1"), h("span", ["Text 1", "Text 2"])]),
      ]);
      const vnode2 = h("div");
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      expect(created).toStrictEqual(4);
      expect(destroyed).toStrictEqual(4);
    });
  });

  describe("short circuiting", function () {
    it("does not update strictly equal vnodes", function () {
      const result = [];
      const cb: UpdateHook = (vnode) => {
        result.push(vnode);
      };
      const vnode1 = h("div", [
        h("span", { hook: { update: cb } }, "Hello"),
        h("span", "there"),
      ]);
      patch(vnode0, vnode1);
      patch(vnode1, vnode1);
      expect(result.length).toStrictEqual(0);
    });
    it("does not update strictly equal children", function () {
      const result = [];
      function cb(vnode: VNode) {
        result.push(vnode);
      }
      const vnode1 = h("div", [
        h("span", { hook: { patch: cb } as any }, "Hello"),
        h("span", "there"),
      ]);
      const vnode2 = h("div");
      vnode2.children = vnode1.children;
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      expect(result.length).toStrictEqual(0);
    });
  });
});
