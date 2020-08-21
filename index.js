import React from "react";
import PropTypes from "prop-types";
import {
  TouchableOpacity,
  Text,
  View,
  Image,
  Linking,
  StyleSheet,
} from "react-native";
import SimpleMarkdown from "simple-markdown";
import _ from "lodash";
import { useMemoOne } from "use-memo-one";

import defaultStyles from "./styles";
import Utils from "./Utils";

const Markdown = ({
  children,
  debug,
  parseInline,
  markdownStyles,
  useDefaultStyles = true,
  renderLink: customRenderLink,
  renderImage: customRenderImage,
  renderListBullet: customRenderListBullet,
  ...otherProps
}) => {
  var underlineRule = {
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

  const rules = _.extend({}, SimpleMarkdown.defaultRules, {
    underline: underlineRule,
  });

  const parser = useMemoOne(() => SimpleMarkdown.parserFor(rules), []);
  const reactOutput = useMemoOne(
    () => SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(rules, "react")),
    []
  );
  const syntaxTree = React.useMemo(() => {
    const parseTree = parser(children + "\n\n", {
      inline: parseInline,
    });
    return reactOutput(parseTree);
  }, [parser, reactOutput, children]);

  const styles = React.useMemo(
    () =>
      StyleSheet.create(
        Object.assign({}, useDefaultStyles ? defaultStyles : {}, markdownStyles)
      ),
    [useDefaultStyles, markdownStyles]
  );

  function renderImage(node, key) {
    if (customRenderImage) {
      return customRenderImage(
        node.props.src,
        node.props.alt,
        node.props.title
      );
    }

    return (
      <View style={styles.imageWrapper} key={"imageWrapper_" + key}>
        <Image source={{ uri: node.props.src }} style={styles.image} />
      </View>
    );
  }

  function renderLine(node, key) {
    return <View style={styles.hr} key={"hr_" + key} />;
  }

  function renderList(node, key, ordered) {
    return (
      <View key={"list_" + key} style={styles.list}>
        {renderNodes(node.props.children, key, { ordered })}
      </View>
    );
  }

  function renderListBullet(ordered, index) {
    if (ordered) {
      return (
        <Text key={"listBullet_" + index} style={styles.listItemNumber}>
          {index + 1 + "."}
        </Text>
      );
    }

    return <View key={"listBullet_" + index} style={styles.listItemBullet} />;
  }

  function renderText(node, key, extras) {
    const style =
      extras && extras.style ? [styles.text].concat(extras.style) : styles.text;

    if (node.props) {
      return (
        <Text key={key} style={style}>
          {renderNodes(node.props.children, key, extras)}
        </Text>
      );
    } else {
      return (
        <Text key={key} style={style}>
          {node.split("\n").join(" ")}
        </Text>
      );
    }
  }

  function renderListItem(node, key, index, extras) {
    const children = renderNodes(node.props.children, key, extras);

    const SafeWrapper = Utils.isTextOnly(children) ? Text : View;

    return (
      <View style={styles.listItem} key={"listItem_" + key}>
        {customRenderListBullet
          ? customRenderListBullet(extras.ordered, index)
          : renderListBullet(extras.ordered, index)}
        <SafeWrapper
          key={"listItemContent_" + key}
          style={styles.listItemContent}
        >
          {children}
        </SafeWrapper>
      </View>
    );
  }

  function renderLink(node, key) {
    const extras = Utils.concatStyles(null, styles.link);
    const children = renderNodes(node.props.children, key, extras);

    if (customRenderLink) {
      return customRenderLink(node.props.href, node.props.title, children);
    }

    const SafeWrapper = Utils.isTextOnly(children) ? Text : TouchableOpacity;

    return (
      <SafeWrapper
        style={styles.linkWrapper}
        key={"linkWrapper_" + key}
        onPress={() => Linking.openURL(node.props.href).catch(() => {})}
      >
        {children}
      </SafeWrapper>
    );
  }

  function renderBlockQuote(node, key, extras) {
    extras = extras
      ? Object.assign(extras, { blockQuote: true })
      : { blockQuote: true };
    return renderBlock(node, key, extras);
  }

  function renderBlock(node, key, extras) {
    const style = [styles.block];
    let isBlockQuote;
    if (extras && extras.blockQuote) {
      isBlockQuote = true;

      /* Ensure that blockQuote style is applied only once, and not for
       * all nested components as well (unless there is a nested blockQuote)
       */
      delete extras.blockQuote;
    }
    const nodes = renderNodes(node.props.children, key, extras);

    if (isBlockQuote) {
      style.push(styles.blockQuote);
      return (
        <View
          key={"blockQuote_" + key}
          style={[styles.block, styles.blockQuote]}
        >
          <Text>{nodes}</Text>
        </View>
      );
    } else if (Utils.isTextOnly(nodes)) {
      return (
        <Text key={"block_text_" + key} style={styles.block}>
          {nodes}
        </Text>
      );
    } else {
      return (
        <View key={"block_" + key} style={styles.block}>
          {nodes}
        </View>
      );
    }
  }

  function renderNode(node, key, index, extras) {
    if (
      node == null ||
      node === "null" ||
      node === "undefined" ||
      node === ""
    ) {
      return null;
    }

    switch (node.type) {
      case "h1":
        return renderText(node, key, Utils.concatStyles(extras, styles.h1));
      case "h2":
        return renderText(node, key, Utils.concatStyles(extras, styles.h2));
      case "h3":
        return renderText(node, key, Utils.concatStyles(extras, styles.h3));
      case "h4":
        return renderText(node, key, Utils.concatStyles(extras, styles.h4));
      case "h5":
        return renderText(node, key, Utils.concatStyles(extras, styles.h5));
      case "h6":
        return renderText(node, key, Utils.concatStyles(extras, styles.h6));
      case "hr":
        return renderLine(node, key);
      case "div":
        return renderBlock(node, key, extras);
      case "ul":
        return renderList(node, key, false);
      case "ol":
        return renderList(node, key, true);
      case "li":
        return renderListItem(node, key, index, extras);
      case "a":
        return renderLink(node, key);
      case "img":
        return renderImage(node, key);
      case "strong":
        return renderText(node, key, Utils.concatStyles(extras, styles.strong));
      case "del":
        return renderText(node, key, Utils.concatStyles(extras, styles.del));
      case "em":
        return renderText(node, key, Utils.concatStyles(extras, styles.em));
      case "u":
        return renderText(node, key, Utils.concatStyles(extras, styles.u));
      case "blockquote":
        return renderBlockQuote(node, key);
      case undefined:
        return renderText(node, key, extras);
      default:
        if (debug) {
          console.log("Node type " + node.type + " is not supported");
        }
        return null;
    }
  }

  function renderNodes(nodes, key, extras) {
    return nodes.map((node, index) => {
      const newKey = key ? key + "_" + index : index + "";
      return renderNode(node, newKey, index, extras);
    });
  }

  const content = renderNodes(syntaxTree, null, null);

  if (debug) {
    console.log("\n\n==== LOGGING NODE TREE ===");
    Utils.logDebug(content);
  }

  return <View {...otherProps}>{content}</View>;
};

Markdown.propTypes = {
  children: PropTypes.string.isRequired,
  debug: PropTypes.bool,
  parseInline: PropTypes.bool,
  markdownStyles: PropTypes.object,
  useDefaultStyles: PropTypes.bool,
  renderImage: PropTypes.func,
  renderLink: PropTypes.func,
  renderListBullet: PropTypes.func,
};

export default Markdown;
