import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import rule from './no-physical-direction-properties.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-physical-direction-properties', rule, {
  valid: [
    { code: `const cls = "flex items-center ms-4 me-2";` },
    { code: `const cls = "ps-control-pad-inline pe-control-pad-inline";` },
    { code: `const cls = "border-s-2 border-e-2";` },
    { code: `const cls = "rounded-s rounded-e";` },
    { code: `const cls = "text-start text-end";` },
    { code: `const cls = "[inset-inline-start:0]";` },
    { code: `const cls = "sm:[inset-inline-start:0]";` },
    { code: `const style = { insetInlineStart: 'var(--gutter)' };` },
    { code: `const style = { marginInlineStart: 'var(--gutter)', marginInlineEnd: 'var(--gutter)' };` },
    { code: `const style = { borderInlineStart: '1px solid red' };` },
    { code: `const el = <div className="ms-gutter me-gutter" style={{ paddingInlineStart: 'var(--pad)' }} />;` },
    { code: `const cls = \`ms-4 \${variant}\`;` },
    { code: `const text = "Turn right at the light.";` },
  ],
  invalid: [
    {
      code: `const cls = "left-0";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "right-4";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "ml-4";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "mr-4";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "pl-2";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "pr-2";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "border-l-2";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "border-r-2";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "rounded-l-lg";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "rounded-r-lg";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "text-left";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "text-right";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "sm:hover:ml-4";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = \`ml-4 \${variant}\`;`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const el = <div className="left-0" />;`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const style = { left: '0' };`,
      errors: [{ messageId: 'physicalStyleProperty' }],
    },
    {
      code: `const style = { marginLeft: '4px' };`,
      errors: [{ messageId: 'physicalStyleProperty' }],
    },
    {
      code: `const style = { paddingRight: '4px' };`,
      errors: [{ messageId: 'physicalStyleProperty' }],
    },
    {
      code: `const el = <div style={{ borderRightWidth: '1px' }} />;`,
      errors: [{ messageId: 'physicalStyleProperty' }],
    },
    {
      code: `const style = { borderLeft: '1px solid red' };`,
      errors: [{ messageId: 'physicalStyleProperty' }],
    },
    {
      code: `const style = { borderRight: '1px solid red' };`,
      errors: [{ messageId: 'physicalStyleProperty' }],
    },
    {
      code: `const cls = "[left:10px]";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "[margin-left:4px]";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const cls = "sm:hover:[right:0]";`,
      errors: [{ messageId: 'physicalClass' }],
    },
    {
      code: `const el = <div className="mt-gutter [border-left-width:2px]" />;`,
      errors: [{ messageId: 'physicalClass' }],
    },
  ],
});
