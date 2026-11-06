import type { TextareaFieldValidation, TextFieldSingleValidation } from 'payload'

/** Optional text field that, when filled, must match `pattern`. */
export const matches =
  (pattern: RegExp, message: string): TextFieldSingleValidation =>
  (value) =>
    !value || pattern.test(value) ? true : message

/** robots.txt rules typed by editors: only Allow/Disallow lines and comments (no User-agent/Sitemap). */
export const robotsRules: TextareaFieldValidation = (value) => {
  const bad = (value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#') && !/^(allow|disallow):\s*\/\S*$/i.test(line))
  return bad ? `Linha inválida: "${bad}". Use só "Allow: /caminho" ou "Disallow: /caminho".` : true
}
