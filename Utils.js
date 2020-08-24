"use strict";

const SUPERSCRIPTS = {
  " ": " ",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  a: "ᵃ",
  b: "ᵇ",
  c: "ᶜ",
  d: "ᵈ",
  e: "ᵉ",
  f: "ᶠ",
  g: "ᵍ",
  h: "ʰ",
  i: "ⁱ",
  j: "ʲ",
  k: "ᵏ",
  l: "ˡ",
  m: "ᵐ",
  n: "ⁿ",
  o: "ᵒ",
  p: "ᵖ",
  r: "ʳ",
  s: "ˢ",
  t: "ᵗ",
  u: "ᵘ",
  v: "ᵛ",
  w: "ʷ",
  x: "ˣ",
  y: "ʸ",
  z: "ᶻ",
};

const toSuperScript = (x) => {
  return x
    .split("")
    .map(function (c) {
      if (c in SUPERSCRIPTS) {
        return SUPERSCRIPTS[c];
      }
      return "";
    })
    .join("");
};

const Utils = {
  isTextOnly(nodes) {
    try {
      if (nodes.length) {
        for (let i = 0; i < nodes.length; i++) {
          if (
            nodes[i] &&
            typeof nodes[i].hasOwnProperty === "function" &&
            Object.prototype.hasOwnProperty.call(nodes[i], "type") &&
            typeof nodes[i].type.hasOwnProperty === "function" &&
            (Object.prototype.hasOwnProperty.call(
              nodes[i].type,
              "displayName"
            ) ||
              Object.prototype.hasOwnProperty.call(nodes[i].type, "name"))
          ) {
            if (
              nodes[i].type.displayName !== "Text" &&
              nodes[i].type.name !== "Text"
            ) {
              return false;
            }
          } else {
            return false;
          }
        }
      }
    } catch (e) {
      return false;
    }

    // It's a miracle, I guess we're text only
    return true;
  },

  concatStyles: function concatStyles(extras, newStyle) {
    let newExtras;
    if (extras) {
      newExtras = JSON.parse(JSON.stringify(extras));

      if (extras.style) {
        newExtras.style.push(newStyle);
      } else {
        newExtras.style = [newStyle];
      }
    } else {
      newExtras = {
        style: [newStyle],
      };
    }
    return newExtras;
  },

  logDebug: function logDebug(nodeTree, level = 0) {
    for (let i = 0; i < nodeTree.length; i++) {
      const node = nodeTree[i];

      if (node) {
        const prefix = Array(level).join("-");
        console.log(
          prefix + "> " + node.key + ", NODE TYPE: " + node.type.displayName
        );
        if (Array.isArray(node.props.children)) {
          this.logDebug(node.props.children, level + 1);
        }
      }
    }
  },
  toSuperScript,
};

module.exports = Utils;
