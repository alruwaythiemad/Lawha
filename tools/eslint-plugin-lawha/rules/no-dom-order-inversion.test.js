import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import rule from './no-dom-order-inversion.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-dom-order-inversion', rule, {
  valid: [
    // Only one native focusable element, no custom component in the file —
    // count is reliable and low, so an order class is not flagged.
    { code: `const el = <button className="order-2">Go</button>;` },
    // Two native focusables, but no disallowed classes/properties at all.
    { code: `const el = <div className="flex"><button>A</button><button>B</button></div>;` },
    // Source-order/logical-property reflow only.
    { code: `const el = <div className="flex flex-row"><button>A</button><button>B</button></div>;` },
    { code: `const el = <div style={{ flexDirection: 'row' }}><button>A</button><button>B</button></div>;` },
    // "order" appears only as a plain English word / unrelated identifier, not a utility token.
    { code: `const text = "Please order the items.";` },
    { code: `const style = { color: 'order-red' };` },
    // Business-domain tokens that merely start with "order-" are not the Tailwind order utility.
    { code: `const el = <div><button className="order-confirmation">A</button><button>B</button></div>;` },
    { code: `const el = <div><button className="order-history">A</button><button>B</button></div>;` },
    // A plain object property named like a style key, not inside a JSX style attribute, is not a CSS violation.
    { code: `const config = { order: 2 }; const el = <div><button>A</button><button>B</button></div>;` },
    // <a> with an href is focusable via the href check alone; without href/tabIndex/role it's inert.
    { code: `const el = <div><a>A</a><button>B</button></div>;` },
  ],
  invalid: [
    {
      code: `const el = <div><button className="order-2">A</button><button>B</button></div>;`,
      errors: [{ messageId: 'orderClass' }],
    },
    {
      code: `const el = <div className="flex flex-row-reverse"><input /><input /></div>;`,
      errors: [{ messageId: 'reverseClass' }],
    },
    {
      code: `const el = <div className="flex flex-col-reverse"><button>A</button><button>B</button></div>;`,
      errors: [{ messageId: 'reverseClass' }],
    },
    {
      code: `const el = <div className="[grid-template-areas:'a b']"><button>A</button><button>B</button></div>;`,
      errors: [{ messageId: 'gridTemplateAreasClass' }],
    },
    {
      code: `const el = <div><button className="col-start-2">A</button><button>B</button></div>;`,
      errors: [{ messageId: 'gridPlacementClass' }],
    },
    {
      code: `const el = <div><button className="row-start-2">A</button><button>B</button></div>;`,
      errors: [{ messageId: 'gridPlacementClass' }],
    },
    {
      code: `const el = <div><button style={{ order: 2 }}>A</button><button>B</button></div>;`,
      errors: [{ messageId: 'orderStyleProperty' }],
    },
    {
      code: `const el = <div style={{ flexDirection: 'row-reverse' }}><button>A</button><button>B</button></div>;`,
      errors: [{ messageId: 'reverseStyleProperty' }],
    },
    {
      code: `const el = <div style={{ flexDirection: 'column-reverse' }}><input /><input /></div>;`,
      errors: [{ messageId: 'reverseStyleProperty' }],
    },
    {
      code: `const el = <div style={{ gridTemplateAreas: '"a b"' }}><button>A</button><button>B</button></div>;`,
      errors: [{ messageId: 'gridTemplateAreasStyleProperty' }],
    },
    {
      code: `const el = <div style={{ gridColumn: 2 }}><button>A</button><button>B</button></div>;`,
      errors: [{ messageId: 'gridPlacementStyleProperty' }],
    },
    {
      code: `const el = <div style={{ gridRowStart: 2 }}><button>A</button><button>B</button></div>;`,
      errors: [{ messageId: 'gridPlacementStyleProperty' }],
    },
    {
      code: `const cls = \`order-3 \${variant}\`; const el = <div><button>A</button><button>B</button></div>;`,
      errors: [{ messageId: 'orderClass' }],
    },
    // Custom JSX component present anywhere in the file makes the native
    // focusable count unreliable — falls back to unconditional flagging.
    {
      code: `const el = <Link className="order-2" href="/x">A</Link>;`,
      errors: [{ messageId: 'orderClass' }],
    },
    // A class string embedded in an unrelated object-literal value (e.g. a
    // cva/clsx variant map) must still be scanned, not silently skipped.
    {
      code: `const variants = { primary: "order-2" }; const el = <div><button>A</button><button>B</button></div>;`,
      errors: [{ messageId: 'orderClass' }],
    },
    // Tailwind arbitrary-property bracket syntax.
    {
      code: `const el = <div><button className="[order:2]">A</button><button>B</button></div>;`,
      errors: [{ messageId: 'orderClass' }],
    },
    {
      code: `const el = <div><button className="[flex-direction:row-reverse]">A</button><button>B</button></div>;`,
      errors: [{ messageId: 'reverseClass' }],
    },
    {
      code: `const el = <div><button className="[grid-column:1/3]">A</button><button>B</button></div>;`,
      errors: [{ messageId: 'gridPlacementClass' }],
    },
    // <a role="button" tabIndex={0}> without href is a valid focusable anchor pattern.
    {
      code: `const el = <div><a role="button" tabIndex={0} className="order-2">A</a><button>B</button></div>;`,
      errors: [{ messageId: 'orderClass' }],
    },
    // A non-literal role expression can't be statically ruled out as interactive — treated conservatively.
    {
      code: `const el = <div><span role={isActive ? 'button' : 'presentation'} className="order-2">A</span><button>B</button></div>;`,
      errors: [{ messageId: 'orderClass' }],
    },
  ],
});
