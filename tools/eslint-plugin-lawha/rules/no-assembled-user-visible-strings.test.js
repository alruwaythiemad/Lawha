import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import rule from './no-assembled-user-visible-strings.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-assembled-user-visible-strings', rule, {
  valid: [
    { code: `const el = <div>{format(locale, 'catalogue.key', { name })}</div>;` },
    { code: `const el = <div>{'plain literal text'}</div>;` },
    { code: `const el = <div>plain literal text</div>;` },
    { code: `const label = format(locale, 'common.greeting', { name });` },
    { code: `const el = <div>{count + 1}</div>;` },
    { code: `const el = <div>{\`\${name}\`}</div>;` },
    { code: `const cls = 'a' + 'b';` },
    { code: `const parts = list.join(', ');` },
    { code: `const el = <div className={variantA + variantB} />;` },
    { code: `import { format } from '@lawha/i18n'; const el = <div>{format(locale, 'x', { name })}</div>;` },
  ],
  invalid: [
    {
      code: `const el = <div>{'Hello, ' + name}</div>;`,
      errors: [{ messageId: 'assembledConcatenation' }],
    },
    {
      code: `const el = <div>{greeting + ', ' + name}</div>;`,
      errors: [{ messageId: 'assembledConcatenation' }],
    },
    {
      code: `const el = format(locale, 'x', { name: 'Hello, ' + name });`,
      errors: [{ messageId: 'assembledConcatenation' }],
    },
    {
      code: `const el = <div>{\`\${greeting}, \${name}\`}</div>;`,
      errors: [{ messageId: 'assembledTemplate' }],
    },
    {
      code: `const el = format(locale, 'x', { name: \`\${a}\${b}\` });`,
      errors: [{ messageId: 'assembledTemplate' }],
    },
    {
      code: `const el = <div>{parts.join(', ')}</div>;`,
      errors: [{ messageId: 'assembledJoin' }],
    },
    {
      code: `const el = format(locale, 'x', { name: parts.join(', ') });`,
      errors: [{ messageId: 'assembledJoin' }],
    },
    {
      code: `const el = <div aria-label={'Delete ' + name} />;`,
      errors: [{ messageId: 'assembledConcatenation' }],
    },
    {
      code: `const el = <div title={\`\${greeting}, \${name}\`} />;`,
      errors: [{ messageId: 'assembledTemplate' }],
    },
    {
      code: `const el = <div aria-label={parts.join(', ')} />;`,
      errors: [{ messageId: 'assembledJoin' }],
    },
    {
      code: `import { format as t } from '@lawha/i18n'; const el = t(locale, 'x', { name: 'Hello, ' + name });`,
      errors: [{ messageId: 'assembledConcatenation' }],
    },
  ],
});
