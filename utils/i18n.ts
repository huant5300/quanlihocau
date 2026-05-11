import { vi } from "@/locales/vi";

type PathValue<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PathValue<T[K], R>
    : never
  : P extends keyof T
    ? T[P]
    : never;

export function t<K extends string>(key: K): PathValue<typeof vi, K> | K {
  const segments = key.split(".");
  let current: unknown = vi;

  for (const segment of segments) {
    if (
      typeof current === "object" &&
      current !== null &&
      segment in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[segment];
      continue;
    }
    return key;
  }

  return current as PathValue<typeof vi, K>;
}
