type RadixNodeKey = string | symbol;
type RadixNodeMap = Map<RadixNodeKey, RadixNode>;

const REST = Symbol();
const UNIT = Symbol();
const REST_BYTE = "*";
const UNIT_BYTE = ":";

const getKey = (
  key: string
): {
  key: RadixNodeKey;
  alias?: string;
} => {
  switch (key[0]) {
    case REST_BYTE:
      return {
        key: REST,
        alias: key.slice(1),
      };
    case UNIT_BYTE:
      return {
        key: UNIT,
        alias: key.slice(1),
      };
    default:
      return { key };
  }
};

class RadixNode {
  key: RadixNodeKey;

  child: RadixNodeMap;

  alias?: string;

  value?: () => void;

  constructor({ key, alias }: { key: RadixNodeKey; alias?: string }) {
    this.key = key;
    this.alias = alias;
    this.child = new Map();
  }

  addChild(key: RadixNodeKey, child: RadixNode) {
    this.child.set(key, child);
  }

  getChild(key: RadixNodeKey) {
    return this.child.get(key);
  }

  hasChild(key: RadixNodeKey) {
    return this.child.has(key);
  }

  noChild() {
    return !this.child.size;
  }

  setValue(value: () => void) {
    if (this.value) {
      throw new Error(
        `Callback already set:
key: ${String(this.key)};
alias: ${this.alias}`
      );
    }
    this.value = value;
  }
}

const path1 = "/asd/qwe/zxc";
const path2 = "/asd/:qwe/zxc";
const path3 = "/poi/*qwe";
const path4 = "/";

const createTree = () => {
  const root = new RadixNode({ key: "" });

  const register = (path: string, value: () => void) => {
    let currentNode = root;

    const names = path.split("/").slice(1);

    for (const name of names) {
      const { key, alias } = getKey(name);
      if (currentNode.hasChild(key)) {
        currentNode = currentNode.getChild(key)!;
      } else {
        const childNode = new RadixNode({ key, alias });
        currentNode.addChild(key, childNode);
        currentNode = childNode;
      }
    }

    currentNode.setValue(value);
  };

  const matcher = (path: string) => {
    return root.child.get("asd")?.child.get("qwe")?.child.get("zxc")?.value;
  };

  return {
    matcher,
    register,
  };
};

const { register, matcher } = createTree();
register(path1, () => {});
register(path3, () => {});
console.log(matcher(path1));

/*
 * ?????????
 * 0. ??????????????? {Const} > {:Params} > {*Rest}; [??????????????????????????????????????????]
 * 1. ?????????{Const}?????????????????????
 * 2. ????????????{Const}?????????????????????{:Params}???{*Rest}
 *    ? ???{:Params}???{*Rest},????????????,???????????????[????????????????????????,?????????rest???alias...]
 *      ? ????????? ->
 *    : ??? -> 404
 */
