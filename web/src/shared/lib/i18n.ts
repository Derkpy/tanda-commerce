import es from "@/locales/es.json";

const strings = es as Record<string, unknown>;

export function t(key: string, values?: Record<string, string | number>) {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, strings);

  if (typeof value !== "string") {
    return key;
  }

  if (!values) {
    return value;
  }

  return Object.entries(values).reduce(
    (text, [placeholder, replacement]) =>
      text.replaceAll(`{{${placeholder}}}`, String(replacement)),
    value,
  );
}
