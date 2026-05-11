export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type WithTimestamps<T> = T & {
  created_at: string;
  updated_at?: string;
};

export type NonEmptyArray<T> = [T, ...T[]];
