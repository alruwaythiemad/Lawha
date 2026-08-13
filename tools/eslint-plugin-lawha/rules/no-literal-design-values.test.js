import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import rule from './no-literal-design-values.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-literal-design-values', rule, {
  valid: [
    { code: `const cls = "bg-electric text-foreground";` },
    { code: `const cls = "rounded-DEFAULT p-control-pad-block";` },
    { code: `const style = { borderRadius: 'var(--rounded-default)' };` },
    { code: `const style = { padding: 0 };` },
    { code: `const style = { background: 'transparent' };` },
    { code: `const el = <div className="bg-electric" style={{ color: 'var(--color-foreground)' }} />;` },
    { code: `const style = { fontFamily: 'var(--font-inter)' };` },
    { code: `const cls = \`bg-electric \${variant}\`;` },
  ],
  invalid: [
    {
      code: `const color = "#0F2BFF";`,
      errors: [{ messageId: 'hexColor' }],
    },
    {
      code: `const color = "rgba(0, 0, 0, 0.5)";`,
      errors: [{ messageId: 'colorFunction' }],
    },
    {
      code: `const cls = "bg-[#0F2BFF]";`,
      errors: [{ messageId: 'arbitraryColor' }],
    },
    {
      code: `const cls = "rounded-[4px]";`,
      errors: [{ messageId: 'arbitraryLength' }],
    },
    {
      code: `const cls = "p-[13px]";`,
      errors: [{ messageId: 'arbitraryLength' }],
    },
    {
      code: `const style = { borderRadius: '4px' };`,
      errors: [{ messageId: 'styleLiteral' }],
    },
    {
      code: `const style = { background: '#FFFFFF' };`,
      errors: [{ messageId: 'styleLiteral' }],
    },
    {
      code: `const el = <div style={{ padding: 12 }} />;`,
      errors: [{ messageId: 'styleLiteral' }],
    },
    {
      code: `const style = { fontSize: '18px' };`,
      errors: [{ messageId: 'styleLiteral' }],
    },
    {
      code: `const style = { minBlockSize: '44px' };`,
      errors: [{ messageId: 'styleLiteral' }],
    },
    {
      code: `const style = { fontWeight: '700' };`,
      errors: [{ messageId: 'styleLiteral' }],
    },
    {
      code: `const style = { color: 'black' };`,
      errors: [{ messageId: 'styleLiteral' }],
    },
    {
      code: `const color = "oklch(0.7 0.15 250)";`,
      errors: [{ messageId: 'colorFunction' }],
    },
    {
      code: `const cls = "w-[50%]";`,
      errors: [{ messageId: 'arbitraryLength' }],
    },
    {
      code: `const cls = \`bg-[#0F2BFF]\`;`,
      errors: [{ messageId: 'arbitraryColor' }],
    },
    {
      code: `const cls = \`bg-[#\${hex}]\`;`,
      errors: [{ messageId: 'dynamicArbitraryValue' }],
    },
  ],
});
