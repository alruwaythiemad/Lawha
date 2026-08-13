import noLiteralDesignValues from './rules/no-literal-design-values.js';
import noPhysicalDirectionProperties from './rules/no-physical-direction-properties.js';
import noAssembledUserVisibleStrings from './rules/no-assembled-user-visible-strings.js';
import noDomOrderInversion from './rules/no-dom-order-inversion.js';

const plugin = {
  meta: {
    name: '@lawha/eslint-plugin-lawha',
  },
  rules: {
    'no-literal-design-values': noLiteralDesignValues,
    'no-physical-direction-properties': noPhysicalDirectionProperties,
    'no-assembled-user-visible-strings': noAssembledUserVisibleStrings,
    'no-dom-order-inversion': noDomOrderInversion,
  },
};

export default plugin;
