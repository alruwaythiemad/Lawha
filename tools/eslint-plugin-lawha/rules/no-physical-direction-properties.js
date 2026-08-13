// Flags physical left/right layout values in component code — AD-21
// requires dir/lang to be derived once at the root and every descendant to
// use CSS logical properties, so the browser mirrors layout automatically
// under dir="rtl" instead of a component branching on locale. This rule
// doesn't know about packages/tokens itself; callers allowlist that
// package (and its generated CSS output) at the ESLint config level, same
// as no-literal-design-values.
//
// DOM-order-vs-visual-order concerns (`order`, `row-reverse`,
// `grid-template-areas`, explicit grid placement) are NOT covered here —
// that's `no-dom-order-inversion.js`'s job (Story 1.4). Don't conflate the
// two.

const PHYSICAL_CLASS_RULES = [
  { re: /^-?left-/, logical: 'inset-inline-start-*' },
  { re: /^-?right-/, logical: 'inset-inline-end-*' },
  { re: /^-?ml-/, logical: 'ms-*' },
  { re: /^-?mr-/, logical: 'me-*' },
  { re: /^-?pl-/, logical: 'ps-*' },
  { re: /^-?pr-/, logical: 'pe-*' },
  { re: /^border-l(-|$)/, logical: 'border-s-*' },
  { re: /^border-r(-|$)/, logical: 'border-e-*' },
  { re: /^rounded-l(-|$)/, logical: 'rounded-s-*' },
  { re: /^rounded-r(-|$)/, logical: 'rounded-e-*' },
  { re: /^text-left$/, logical: 'text-start' },
  { re: /^text-right$/, logical: 'text-end' },
];

const PHYSICAL_STYLE_PROPERTIES = {
  left: 'insetInlineStart',
  right: 'insetInlineEnd',
  marginLeft: 'marginInlineStart',
  marginRight: 'marginInlineEnd',
  paddingLeft: 'paddingInlineStart',
  paddingRight: 'paddingInlineEnd',
  borderLeft: 'borderInlineStart',
  borderRight: 'borderInlineEnd',
  borderLeftWidth: 'borderInlineStartWidth',
  borderRightWidth: 'borderInlineEndWidth',
  borderLeftColor: 'borderInlineStartColor',
  borderRightColor: 'borderInlineEndColor',
  borderLeftStyle: 'borderInlineStartStyle',
  borderRightStyle: 'borderInlineEndStyle',
  borderTopLeftRadius: 'borderStartStartRadius',
  borderTopRightRadius: 'borderStartEndRadius',
  borderBottomLeftRadius: 'borderEndStartRadius',
  borderBottomRightRadius: 'borderEndEndRadius',
};

function camelToKebab(name) {
  return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

// Same physical→logical map as PHYSICAL_STYLE_PROPERTIES, keyed by the
// kebab-case CSS property name so it can also catch Tailwind's standalone
// arbitrary-property bracket syntax (`[left:10px]`, `[margin-left:4px]`) —
// not just the dash-prefixed arbitrary-*value* form (`left-[10px]`) that
// PHYSICAL_CLASS_RULES matches.
const PHYSICAL_CSS_PROPERTY_NAMES = new Map(
  Object.entries(PHYSICAL_STYLE_PROPERTIES).map(([camel, logicalCamel]) => [camelToKebab(camel), camelToKebab(logicalCamel)]),
);

function stripVariantPrefix(token) {
  // Strip Tailwind variant prefixes (hover:, sm:, dark:, rtl:, ...) that
  // precede the base utility — only look at the portion before any bracket,
  // since an arbitrary-property token's own `[property:value]` colon is not
  // a variant separator and must not be stripped along with it.
  const bracketStart = token.indexOf('[');
  const searchable = bracketStart === -1 ? token : token.slice(0, bracketStart);
  const lastColon = searchable.lastIndexOf(':');
  return lastColon === -1 ? token : token.slice(lastColon + 1);
}

function logicalEquivalentForClass(token) {
  const base = stripVariantPrefix(token);

  const bracketMatch = base.match(/^-?\[([a-z-]+)\s*:/);
  if (bracketMatch) {
    const logical = PHYSICAL_CSS_PROPERTY_NAMES.get(bracketMatch[1]);
    return logical ? `[${logical}:...]` : null;
  }

  for (const { re, logical } of PHYSICAL_CLASS_RULES) {
    if (re.test(base)) return logical;
  }
  return null;
}

function checkClassString(text, report, node) {
  for (const token of text.split(/\s+/).filter(Boolean)) {
    const logical = logicalEquivalentForClass(token);
    if (logical) {
      report(node, 'physicalClass', { value: token, logical });
    }
  }
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow physical left/right layout classes and CSS properties — use CSS logical properties instead so layout mirrors automatically under dir="rtl" (AD-21, FR47).',
    },
    schema: [],
    messages: {
      physicalClass: 'Physical utility class "{{value}}" found — use its logical equivalent ("{{logical}}") instead so layout mirrors under dir="rtl".',
      physicalStyleProperty: 'Physical style property "{{property}}" found — use "{{logical}}" instead so layout mirrors under dir="rtl".',
    },
  },
  create(context) {
    const report = (node, messageId, data) => context.report({ node, messageId, data });

    function isPhysicalStylePropertyValue(node) {
      const parent = node.parent;
      if (!parent || parent.type !== 'Property' || parent.value !== node) return false;
      const key = parent.key.type === 'Identifier' ? parent.key.name : parent.key.type === 'Literal' ? String(parent.key.value) : null;
      return Boolean(key && key in PHYSICAL_STYLE_PROPERTIES);
    }

    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        // Property() below reports style-object values with a more precise
        // message (property name) — don't double-report the same literal.
        if (isPhysicalStylePropertyValue(node)) return;
        checkClassString(node.value, report, node);
      },
      TemplateElement(node) {
        const text = node.value.raw;
        if (!text) return;
        checkClassString(text, report, node);
      },
      Property(node) {
        const key = node.key.type === 'Identifier' ? node.key.name : node.key.type === 'Literal' ? String(node.key.value) : null;
        if (!key || !(key in PHYSICAL_STYLE_PROPERTIES)) return;
        report(node.value, 'physicalStyleProperty', { property: key, logical: PHYSICAL_STYLE_PROPERTIES[key] });
      },
    };
  },
};

export default rule;
