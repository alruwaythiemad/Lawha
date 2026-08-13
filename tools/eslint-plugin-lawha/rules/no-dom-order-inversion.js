// Flags DOM-order-vs-visual-order inversions — Story 1.4's lint gate, the
// gap `no-physical-direction-properties.js` deliberately left open (see its
// header comment). DESIGN.md's mechanical spec: reflow is achieved by
// source order and auto-placement only. No `order`, no `row-reverse` /
// `column-reverse`, no `grid-template-areas`, and no explicit grid-line
// placement in any component containing more than one focusable element —
// this is the mechanical form of "tab order equals visual order".
//
// "More than one focusable element" is a heuristic, not a full
// accessibility-tree computation: native focusable tags/roles/tabIndex are
// counted directly; any custom JSX component (e.g. `<Link>`) makes the
// count unreliable (it may render something focusable we can't see here),
// so the file falls back to flagging unconditionally rather than silently
// under-enforcing — false positives here are cheap (an occasional disable
// comment), false negatives defeat the AC.

const ORDER_CLASS_RE = /^-?order-(\d+|first|last|none)$/;
const REVERSE_CLASSES = new Set(['flex-row-reverse', 'flex-col-reverse', 'row-reverse', 'column-reverse']);
const GRID_TEMPLATE_AREAS_ARBITRARY_RE = /^\[grid-template-areas\s*:/;
const GRID_PLACEMENT_CLASS_RE = /^(col-start-|col-end-|row-start-|row-end-|col-\[|row-\[|grid-column-\[|grid-row-\[)/;
// Tailwind arbitrary-property bracket syntax, e.g. `[order:2]`, `[grid-column:1/3]`,
// `[flex-direction:row-reverse]` — not caught by the class-name regexes above, which
// only match Tailwind's named-utility forms.
const ARBITRARY_PROPERTY_RE = /^-?\[([a-z-]+)\s*:\s*([^\]]*)\]/;
const GRID_PLACEMENT_ARBITRARY_PROPERTIES = new Set(['grid-column', 'grid-row', 'grid-column-start', 'grid-column-end', 'grid-row-start', 'grid-row-end']);

const ORDER_STYLE_PROPERTIES = new Set(['order']);
const GRID_PLACEMENT_STYLE_PROPERTIES = new Set(['gridColumn', 'gridRow', 'gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd']);
const RECOGNIZED_STYLE_KEYS = new Set([...ORDER_STYLE_PROPERTIES, ...GRID_PLACEMENT_STYLE_PROPERTIES, 'gridTemplateAreas', 'flexDirection']);

const NATIVE_FOCUSABLE_TAGS = new Set(['button', 'select', 'textarea']);
const INTERACTIVE_ROLE_RE = /^(button|link|menuitem|menuitemcheckbox|menuitemradio|checkbox|radio|switch|tab|option)$/i;

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

function classifyArbitraryPropertyToken(base) {
  const match = base.match(ARBITRARY_PROPERTY_RE);
  if (!match) return null;
  const [, property, rawValue] = match;
  if (property === 'order') return 'orderClass';
  if (property === 'flex-direction') {
    const value = rawValue.trim();
    return value === 'row-reverse' || value === 'column-reverse' ? 'reverseClass' : null;
  }
  if (property === 'grid-template-areas') return 'gridTemplateAreasClass';
  if (GRID_PLACEMENT_ARBITRARY_PROPERTIES.has(property)) return 'gridPlacementClass';
  return null;
}

function classifyClassToken(token) {
  const base = stripVariantPrefix(token);
  if (ORDER_CLASS_RE.test(base)) return 'orderClass';
  if (REVERSE_CLASSES.has(base)) return 'reverseClass';
  if (GRID_TEMPLATE_AREAS_ARBITRARY_RE.test(base)) return 'gridTemplateAreasClass';
  if (GRID_PLACEMENT_CLASS_RE.test(base)) return 'gridPlacementClass';
  return classifyArbitraryPropertyToken(base);
}

function collectClassViolations(text, node, violations) {
  for (const token of text.split(/\s+/).filter(Boolean)) {
    const messageId = classifyClassToken(token);
    if (messageId) violations.push({ node, messageId, data: { value: token } });
  }
}

function getAttributeValue(jsxOpeningElement, attrName) {
  for (const attr of jsxOpeningElement.attributes) {
    if (attr.type !== 'JSXAttribute') continue;
    if (attr.name.type !== 'JSXIdentifier' || attr.name.name !== attrName) continue;
    return attr;
  }
  return null;
}

function isFocusableOpeningElement(node) {
  const name = node.name;
  if (name.type === 'JSXIdentifier') {
    const tag = name.name;
    if (NATIVE_FOCUSABLE_TAGS.has(tag)) return true;
    // A plain <input> is focusable unless explicitly hidden/disabled; a bare
    // heuristic check is enough here (see module header). An <a> without
    // href falls through to the tabIndex/role checks below rather than
    // returning early, since role="button"/tabIndex on a bare <a> is a
    // valid, common focusable pattern.
    if (tag === 'input') return true;
    if (tag === 'a' && getAttributeValue(node, 'href')) return true;
  }
  if (getAttributeValue(node, 'tabIndex')) return true;
  const roleAttr = getAttributeValue(node, 'role');
  if (roleAttr) {
    if (roleAttr.value && roleAttr.value.type === 'Literal' && typeof roleAttr.value.value === 'string') {
      if (INTERACTIVE_ROLE_RE.test(roleAttr.value.value)) return true;
    } else {
      // Non-literal role value (e.g. a ternary) — can't statically verify
      // it isn't interactive, so treat conservatively as focusable, same
      // philosophy as the custom-component fallback (false positives are
      // cheap, false negatives defeat the AC).
      return true;
    }
  }
  return false;
}

function isCustomComponent(node) {
  const name = node.name;
  if (name.type === 'JSXIdentifier') return /^[A-Z]/.test(name.name);
  return name.type === 'JSXMemberExpression';
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow order/row-reverse/column-reverse/grid-template-areas/explicit grid placement in any component with more than one focusable element — DOM order must match visual order (DESIGN.md).',
    },
    schema: [],
    messages: {
      orderClass: 'CSS "order" utility class "{{value}}" found in a component with more than one focusable element — reflow must come from source order alone.',
      reverseClass: 'Reverse-direction class "{{value}}" found in a component with more than one focusable element — it inverts DOM order from visual order (doubly so under dir="rtl").',
      gridTemplateAreasClass: '"grid-template-areas" found in a component with more than one focusable element — use source order and auto-placement instead.',
      gridPlacementClass: 'Explicit grid-line placement class "{{value}}" found in a component with more than one focusable element — use source order and auto-placement instead.',
      orderStyleProperty: 'CSS "order" style property found in a component with more than one focusable element — reflow must come from source order alone.',
      reverseStyleProperty: 'Reverse-direction "{{property}}" value found in a component with more than one focusable element — it inverts DOM order from visual order.',
      gridTemplateAreasStyleProperty: '"gridTemplateAreas" style property found in a component with more than one focusable element — use source order and auto-placement instead.',
      gridPlacementStyleProperty: 'Explicit grid-line placement style property "{{property}}" found in a component with more than one focusable element — use source order and auto-placement instead.',
    },
  },
  create(context) {
    const violations = [];
    let focusableCount = 0;
    let hasCustomComponent = false;

    // Only true when `node` sits somewhere inside the object literal that is
    // the value of a JSX `style={{...}}` attribute — not just any object
    // literal property with a matching key name. Scoping this way avoids
    // flagging unrelated business objects (e.g. a sort config `{ order: 2 }`)
    // as CSS violations.
    function isInsideStyleAttribute(node) {
      let current = node.parent;
      while (current) {
        if (current.type === 'JSXAttribute' && current.name.type === 'JSXIdentifier' && current.name.name === 'style') {
          return true;
        }
        current = current.parent;
      }
      return false;
    }

    // True only for the exact literal the Property() visitor below will
    // already report on (a recognized style key, inside an actual style
    // attribute) — so the Literal visitor doesn't skip class-token scanning
    // for arbitrary strings that merely happen to share a key name with a
    // CSS property (e.g. a `order`/`gridColumn` key in an unrelated object,
    // or a class string embedded in a cva/clsx variant map).
    function isHandledStylePropertyValue(node) {
      const parent = node.parent;
      if (!parent || parent.type !== 'Property' || parent.value !== node) return false;
      const key = parent.key.type === 'Identifier' ? parent.key.name : parent.key.type === 'Literal' ? String(parent.key.value) : null;
      if (!key || !RECOGNIZED_STYLE_KEYS.has(key)) return false;
      return isInsideStyleAttribute(parent);
    }

    return {
      JSXOpeningElement(node) {
        if (isFocusableOpeningElement(node)) focusableCount += 1;
        if (isCustomComponent(node)) hasCustomComponent = true;
      },
      Literal(node) {
        if (typeof node.value !== 'string') return;
        if (isHandledStylePropertyValue(node)) return;
        collectClassViolations(node.value, node, violations);
      },
      TemplateElement(node) {
        const text = node.value.raw;
        if (!text) return;
        collectClassViolations(text, node, violations);
      },
      Property(node) {
        if (!isInsideStyleAttribute(node)) return;

        const key = node.key.type === 'Identifier' ? node.key.name : node.key.type === 'Literal' ? String(node.key.value) : null;
        if (!key) return;

        if (ORDER_STYLE_PROPERTIES.has(key)) {
          violations.push({ node: node.value, messageId: 'orderStyleProperty', data: {} });
          return;
        }

        if (GRID_PLACEMENT_STYLE_PROPERTIES.has(key)) {
          violations.push({ node: node.value, messageId: 'gridPlacementStyleProperty', data: { property: key } });
          return;
        }

        if (key === 'gridTemplateAreas') {
          violations.push({ node: node.value, messageId: 'gridTemplateAreasStyleProperty', data: {} });
          return;
        }

        if (key === 'flexDirection' && node.value.type === 'Literal' && typeof node.value.value === 'string') {
          if (node.value.value === 'row-reverse' || node.value.value === 'column-reverse') {
            violations.push({ node: node.value, messageId: 'reverseStyleProperty', data: { property: 'flexDirection' } });
          }
        }
      },
      'Program:exit'() {
        if (violations.length === 0) return;
        if (focusableCount <= 1 && !hasCustomComponent) return;
        for (const violation of violations) {
          context.report({ node: violation.node, messageId: violation.messageId, data: violation.data });
        }
      },
    };
  },
};

export default rule;
