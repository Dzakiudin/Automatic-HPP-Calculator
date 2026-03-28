/**
 * PostCSS plugin to unwrap @layer rules for older browser compatibility.
 * Android WebView on API 29 (Android 10) does not support @layer,
 * which causes Tailwind CSS v4 styles to be completely ignored.
 * This plugin removes the @layer wrapper while keeping the inner rules.
 */
const plugin = () => {
  return {
    postcssPlugin: 'postcss-unwrap-layer',
    AtRule: {
      layer: (atRule) => {
        // Unwrap: move all child nodes out and remove the @layer wrapper
        if (atRule.nodes && atRule.nodes.length > 0) {
          atRule.replaceWith(atRule.nodes);
        } else {
          atRule.remove();
        }
      },
    },
  };
};

plugin.postcss = true;

export default plugin;
