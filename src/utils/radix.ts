type RadixNodeKey = string | symbol;
type RadixNodeMap = Map<RadixNodeKey, RadixNode>;

const REST = Symbol();
const UNIT = Symbol();
const REST_BYTE = "*";
const UNIT_BYTE = ":";

export class RadixNode {
  key: RadixNodeKey;

  alias?: string;

  value?: () => void;

  child: RadixNodeMap;

  constructor({ key, value }: { key: string; value?: () => void }) {
    switch (key[0]) {
      case REST_BYTE:
        this.key = REST;
        this.alias = key.slice(1);
        break;
      case UNIT_BYTE:
        this.key = UNIT;
        this.alias = key.slice(1);
        break;
      default:
        this.key = key;
    }
    this.value = value;
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
}
