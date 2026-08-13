// Flags user-visible text assembled by string concatenation / multi-slot
// template literals / .join() instead of going through a single catalogue
// format() call with named placeholders (AD-22) — this binds even for
// accessible names assembled from several parts.
//
// This is necessarily heuristic, like no-literal-design-values in Story
// 1.1: it only looks at JSX child/attribute position and direct/one-level-
// nested arguments to a resolved catalogue format() call. Known gaps it
// cannot catch: string-building indirected through a helper function
// (`buildLabel(a, b)` that concatenates internally), string assembly
// assigned to a variable before being rendered, bare JSX text sitting next
// to an interpolated expression (e.g. `<div>Hello, {name}!</div>`) — flagging
// that pattern generically would over-fire on legitimate cases like
// `<span>{count} items</span>`), or a `format`-named call that isn't
// actually the catalogue accessor and wasn't imported from `@lawha/i18n`.
// Don't treat this rule as a complete guarantee of AD-22 — it's a
// mechanical floor, not a proof.

function isJsxChildExpression(node) {
  const parent = node.parent;
  return Boolean(parent && parent.type === 'JSXExpressionContainer' && parent.parent && (parent.parent.type === 'JSXElement' || parent.parent.type === 'JSXFragment'));
}

function isJsxAttributeValue(node) {
  const parent = node.parent;
  return Boolean(parent && parent.type === 'JSXExpressionContainer' && parent.parent && parent.parent.type === 'JSXAttribute');
}

function isFlaggedPosition(node, formatLocalNames) {
  function calleeIsFormat(callee) {
    if (!callee) return false;
    if (callee.type === 'Identifier') return formatLocalNames.has(callee.name);
    if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') return formatLocalNames.has(callee.property.name);
    return false;
  }

  function isDirectArgumentOfFormatCall(n) {
    const parent = n.parent;
    return Boolean(parent && parent.type === 'CallExpression' && parent.arguments.includes(n) && calleeIsFormat(parent.callee));
  }

  function isValueInFormatValuesObject(n) {
    const property = n.parent;
    if (!property || property.type !== 'Property' || property.value !== n) return false;
    const objectExpr = property.parent;
    if (!objectExpr || objectExpr.type !== 'ObjectExpression') return false;
    return isDirectArgumentOfFormatCall(objectExpr);
  }

  return isJsxChildExpression(node) || isJsxAttributeValue(node) || isDirectArgumentOfFormatCall(node) || isValueInFormatValuesObject(node);
}

function containsStringOperand(node) {
  if (node.type === 'Literal') return typeof node.value === 'string';
  if (node.type === 'TemplateLiteral') return true;
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    return containsStringOperand(node.left) || containsStringOperand(node.right);
  }
  return false;
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow assembling user-visible text via "+" concatenation, multi-slot template literals, or .join() — use a catalogue format() call with named placeholders instead (AD-22).',
    },
    schema: [],
    messages: {
      assembledConcatenation: 'String concatenation ("+") used to build user-visible text — use a single catalogue format() call with named placeholders instead (AD-22).',
      assembledTemplate: 'Template literal with multiple interpolations used to build user-visible text — use a single catalogue format() call with named placeholders instead (AD-22).',
      assembledJoin: '.join() used to build user-visible text — use a single catalogue format() call with named placeholders instead (AD-22).',
    },
  },
  create(context) {
    const report = (node, messageId) => context.report({ node, messageId });
    // Seeded with the bare identifier 'format' so unimported/local helpers
    // named exactly `format` keep working as before; import tracking below
    // additionally resolves an aliased catalogue import (`import { format as
    // t } from '@lawha/i18n'`), which the bare-name check alone would miss.
    const formatLocalNames = new Set(['format']);

    return {
      ImportDeclaration(node) {
        if (node.source.value !== '@lawha/i18n') return;
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier' && specifier.imported.name === 'format') {
            formatLocalNames.add(specifier.local.name);
          }
        }
      },
      BinaryExpression(node) {
        if (node.operator !== '+') return;
        // Only the outermost "+" in a chain has a non-BinaryExpression
        // parent to check against — inner nodes are skipped naturally.
        if (node.parent && node.parent.type === 'BinaryExpression' && node.parent.operator === '+') return;
        if (!containsStringOperand(node)) return;
        if (isFlaggedPosition(node, formatLocalNames)) {
          report(node, 'assembledConcatenation');
        }
      },
      TemplateLiteral(node) {
        if (node.expressions.length <= 1) return;
        if (isFlaggedPosition(node, formatLocalNames)) {
          report(node, 'assembledTemplate');
        }
      },
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression') return;
        if (node.callee.property.type !== 'Identifier' || node.callee.property.name !== 'join') return;
        if (isFlaggedPosition(node, formatLocalNames)) {
          report(node, 'assembledJoin');
        }
      },
    };
  },
};

export default rule;
