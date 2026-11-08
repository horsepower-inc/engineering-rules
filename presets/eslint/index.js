// ESLint flat-config pieces for ADR 0002 (access) and ADR 0003 (AI gateway). No plugin needed: core rules only.

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
