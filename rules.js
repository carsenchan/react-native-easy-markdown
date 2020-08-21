import React from "react";
const underlineRule = {
  // Specify the order in which this rule is to be run
  order: SimpleMarkdown.defaultRules.em.order - 0.5,

  // First we check whether a string matches
  match: function (source) {
    return /^<u>([\s\S]+?)<\/u>(?!_)/.exec(source);
  },

  // Then parse this string into a syntax node
  parse: function (capture, parse, state) {
    return {
      content: parse(capture[1], state),
    };
  },

  // Finally transform this syntax node into a
  // React element
  react: function (node, output) {
    return React.createElement("u", {}, output(node.content));
    // return React.DOM.u(null, output(node.content));
  },

  // Or an html element:
  // (Note: you may only need to make one of `react:` or
  // `html:`, as long as you never ask for an outputter
  // for the other type.)
  html: function (node, output) {
    return "<u>" + output(node.content) + "</u>";
  },
};

const superscriptRule = {
  // Specify the order in which this rule is to be run
  order: SimpleMarkdown.defaultRules.em.order - 0.5,

  // First we check whether a string matches
  match: function (source) {
    return /^<sup>([\s\S]+?)<\/sup>(?!_)/.exec(source);
  },

  // Then parse this string into a syntax node
  parse: function (capture, parse, state) {
    return {
      content: parse(capture[1], state),
    };
  },

  // Finally transform this syntax node into a
  // React element
  react: function (node, output) {
    return React.createElement("sup", {}, output(node.content));
    // return React.DOM.u(null, output(node.content));
  },

  // Or an html element:
  // (Note: you may only need to make one of `react:` or
  // `html:`, as long as you never ask for an outputter
  // for the other type.)
  html: function (node, output) {
    return "<sup>" + output(node.content) + "</sup>";
  },
};

const subscriptRule = {
  // Specify the order in which this rule is to be run
  order: SimpleMarkdown.defaultRules.em.order - 0.5,

  // First we check whether a string matches
  match: function (source) {
    return /^<sub>([\s\S]+?)<\/sub>(?!_)/.exec(source);
  },

  // Then parse this string into a syntax node
  parse: function (capture, parse, state) {
    return {
      content: parse(capture[1], state),
    };
  },

  // Finally transform this syntax node into a
  // React element
  react: function (node, output) {
    return React.createElement("sub", {}, output(node.content));
    // return React.DOM.u(null, output(node.content));
  },

  // Or an html element:
  // (Note: you may only need to make one of `react:` or
  // `html:`, as long as you never ask for an outputter
  // for the other type.)
  html: function (node, output) {
    return "<sub>" + output(node.content) + "</sub>";
  },
};

export default { underlineRule, superscriptRule, subscriptRule };
