/**
 * Either type - represents a value that can be either a success (Right) or an error (Left)
 */
export type Either<L, R> = Left<L> | Right<R>;

/**
 * Left represents an error/failure case
 */
export interface Left<L> {
  readonly _tag: 'Left';
  readonly value: L;
}

/**
 * Right represents a success case
 */
export interface Right<R> {
  readonly _tag: 'Right';
  readonly value: R;
}

/**
 * Creates a Left (error) instance
 */
export const left = <L>(value: L): Left<L> => ({
  _tag: 'Left',
  value,
});

/**
 * Creates a Right (success) instance
 */
export const right = <R>(value: R): Right<R> => ({
  _tag: 'Right',
  value,
});

/**
 * Type guard to check if Either is Left
 */
export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> =>
  either._tag === 'Left';

/**
 * Type guard to check if Either is Right
 */
export const isRight = <L, R>(either: Either<L, R>): either is Right<R> =>
  either._tag === 'Right';

/**
 * Maps over the Right value, leaving Left unchanged
 */
export const map = <L, R, R2>(
  fn: (value: R) => R2
) => (either: Either<L, R>): Either<L, R2> => {
  if (isRight(either)) {
    return right(fn(either.value));
  }
  return either;
};

/**
 * Maps over the Left value, leaving Right unchanged
 */
export const mapLeft = <L, L2, R>(
  fn: (value: L) => L2
) => (either: Either<L, R>): Either<L2, R> => {
  if (isLeft(either)) {
    return left(fn(either.value));
  }
  return either;
};

/**
 * Flat maps over the Right value (for chaining operations that return Either)
 */
export const flatMap = <L, R, R2>(
  fn: (value: R) => Either<L, R2>
) => (either: Either<L, R>): Either<L, R2> => {
  if (isRight(either)) {
    return fn(either.value);
  }
  return either;
};

/**
 * Folds an Either into a single value using provided functions
 */
export const fold = <L, R, T>(
  onLeft: (left: L) => T,
  onRight: (right: R) => T
) => (either: Either<L, R>): T => {
  if (isLeft(either)) {
    return onLeft(either.value);
  }
  return onRight(either.value);
};

/**
 * Gets the Right value or returns a default value if Left
 */
export const getOrElse = <R>(defaultValue: R) => <L>(either: Either<L, R>): R => {
  if (isRight(either)) {
    return either.value;
  }
  return defaultValue;
};

/**
 * Gets the Right value or throws the Left value as an error
 */
export const getOrThrow = <L, R>(either: Either<L, R>): R => {
  if (isRight(either)) {
    return either.value;
  }
  throw either.value;
};

/**
 * Converts a function that might throw into an Either
 */
export const tryCatch = <L, R>(
  fn: () => R,
  onError: (error: unknown) => L
): Either<L, R> => {
  try {
    return right(fn());
  } catch (error) {
    return left(onError(error));
  }
};

/**
 * Converts an async function that might throw into an Either
 */
export const tryCatchAsync = async <L, R>(
  fn: () => Promise<R>,
  onError: (error: unknown) => L
): Promise<Either<L, R>> => {
  try {
    const result = await fn();
    return right(result);
  } catch (error) {
    return left(onError(error));
  }
};

/**
 * Combines multiple Either values - returns Right with array of values if all are Right,
 * otherwise returns the first Left encountered
 */
export const sequence = <L, R>(eithers: Either<L, R>[]): Either<L, R[]> => {
  const results: R[] = [];
  
  for (const either of eithers) {
    if (isLeft(either)) {
      return either;
    }
    results.push(either.value);
  }
  
  return right(results);
};

/**
 * Applies a function wrapped in Either to a value wrapped in Either
 */
export const apply = <L, R, R2>(
  eitherFn: Either<L, (value: R) => R2>
) => (either: Either<L, R>): Either<L, R2> => {
  if (isLeft(eitherFn)) {
    return eitherFn;
  }
  if (isLeft(either)) {
    return either;
  }
  return right(eitherFn.value(either.value));
};

// Utility types for common error handling
export type ErrorMessage = string;
export type ValidationError = {
  field: string;
  message: string;
};
export type ApiError = {
  code: number;
  message: string;
  details?: unknown;
};