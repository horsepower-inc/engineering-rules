// ESLint flat-config pieces for ADR 0002 (access), ADR 0003 (AI gateway), ADR 0008 (UI) and ADR 0009 (shared modules).
// No plugin needed: core rules only.

/** Role comparisons only in policy files and shared/auth. */
export function accessRules({ files, allow = ['**/*.policy.ts', '**/shared/auth/**'] }) {
  const message = 'Access is decided by policies (ADR 0002): move this check into the feature\'s *.policy.ts.';
  return [
    {
      files,
      ignores: allow,
      rules: {
        'no-restricted-syntax': [
          'error',
          { selector: 'BinaryExpression[operator=/^[!=]==?$/] > MemberExpression[property.name="role"]', message },
          { selector: 'CallExpression[callee.property.name="includes"][callee.object.name="roles"]', message },
          { selector: 'CallExpression[callee.property.name="includes"][callee.object.property.name="roles"]', message },
        ],
      },
    },
  ];
}

/** Model drivers and vendor SDKs only inside the AI gateway. */
export function aiGatewayRules({
  files,
  gateway,
  drivers = ['**/ai/drivers/**'],
  modules = ['@anthropic-ai/sdk', 'openai', '@google/genai', 'ollama'],
}) {
  const message = 'Every model call goes through the AI gateway (ADR 0003): use ai.run(...) from shared/ai.';
  return [
    {
      files,
      ignores: [gateway].flat(),
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: modules.map((name) => ({ name, message })),
            patterns: [{ group: [...drivers, ...modules.map((name) => `${name}/*`)], message }],
          },
        ],
      },
    },
  ];
}

/**
 * ADR 0008. Locale formatting only in the formatting module; the behaviour and table libraries, `style` props and
 * `<style>` elements only inside the design-system package. Uses `no-restricted-properties`, `no-restricted-imports`
 * and `no-restricted-syntax`: give these files no other config for the same rules, or the later one wins.
 */
export function uiRules({ files, designSystem = [], formatModule = [], behaviour = [] }) {
  const format = 'Format dates, times and numbers through the formatting module (ADR 0008 rule 12).';
  const library = 'Use the design-system component; only the design-system package imports this library (ADR 0008 rule 4).';
  const styling = 'No style prop or <style> element outside the design-system package: use a component variant (ADR 0008 rules 5, 6).';
  const formatters = ['DateTimeFormat', 'NumberFormat', 'RelativeTimeFormat', 'DurationFormat', 'ListFormat'];
  const configs = [
    {
      files,
      ignores: [formatModule].flat(),
      rules: {
        'no-restricted-properties': [
          'error',
          ...['toLocaleString', 'toLocaleDateString', 'toLocaleTimeString'].map((property) => ({ property, message: format })),
          ...formatters.map((property) => ({ object: 'Intl', property, message: format })),
        ],
      },
    },
  ];
  const outside = { files, ignores: [designSystem].flat(), rules: {} };
  if (behaviour.length > 0) {
    outside.rules['no-restricted-imports'] = [
      'error',
      {
        paths: behaviour.map((name) => ({ name, message: library })),
        patterns: [{ group: behaviour.map((name) => `${name}/*`), message: library }],
      },
    ];
  }
  outside.rules['no-restricted-syntax'] = [
    'error',
    { selector: 'JSXAttribute[name.name="style"]', message: styling },
    { selector: 'JSXOpeningElement[name.name="style"]', message: styling },
  ];
  configs.push(outside);
  return configs;
}

/**
 * ADR 0009. HTTP calls only through the app's HTTP or API client home: no `fetch` or `XMLHttpRequest` elsewhere.
 * Uses `no-restricted-globals`: give these files no other config for that rule, or the later one wins. `globalThis.fetch`
 * is not caught here; review item P4 covers it.
 */
export function httpRules({ files, client }) {
  const message = 'Calls go through the HTTP or API client home (ADR 0009): retries, auth refresh and errors live there.';
  return [
    {
      files,
      ignores: [client].flat(),
      rules: {
        'no-restricted-globals': [
          'error',
          { name: 'fetch', message },
          { name: 'XMLHttpRequest', message },
        ],
      },
    },
  ];
}
