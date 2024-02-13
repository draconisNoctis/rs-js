# RS-JS

A collection of rust-inspired libraries

## [@rs-js/await](./pkg/await/README.md)

Allow you to write chainable `await`.

```typescript
import '@rs-js/await';

const body = await fetch('http://example.com/movies.json').await.json();
```

## [@rs-js/option](./pkg/option/README.md)

A library to handle `nullable` values in a type safe manner.

Typescript can do this on it's own with `strictNullChecks`, this is just another style to do it.

## [@rs-js/result](./pkg/result/README.md)

An implementation of the Rust Result enum for using the [Errors as Values](https://medium.com/@muelltyl/typescript-but-errors-are-values-87d0209e4901) paradigma.

```typescript
const result: Result<string, Error> = failableFunction().andThen(value => anotherFailableFunction(value));

if (result.isOk()) {
    console.log('Result:', result.value);
} else {
    console.error(result.error.message, result.stack);
}
```
