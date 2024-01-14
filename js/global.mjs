/*
This file must be used with `declare`:

  [declare `jisp:global.mjs`]

Partial reference:

  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
*/

const _ = undefined

export {
  /*
  Built-in constants.
  Some of these are keywords.
  Some are regular predeclared identifiers.
  */

  _ as undefined,
  _ as null,
  _ as false,
  _ as true,
  _ as NaN,
  _ as Infinity,

  _ as arguments,
  _ as this,
  _ as super,

  /*
  Built-in singletons and functions.
  */

  _ as globalThis,
  _ as console,
  _ as document, // Only in some JS environments.
  _ as decodeURI,
  _ as decodeURIComponent,
  _ as encodeURI,
  _ as encodeURIComponent,
  _ as setTimeout,
  _ as clearTimeout,
  _ as setInterval,
  _ as clearInterval,

  /*
  Built-in classes and namespaces.
  */

  _ as Array,
  _ as ArrayBuffer,
  _ as AsyncFunction,
  _ as AsyncGenerator,
  _ as AsyncGeneratorFunction,
  _ as AsyncIterator,
  _ as Atomics,
  _ as BigInt,
  _ as BigInt64Array,
  _ as BigUint64Array,
  _ as Boolean,
  _ as DataView,
  _ as Date,
  _ as Error,
  _ as FinalizationRegistry,
  _ as Float32Array,
  _ as Float64Array,
  _ as Function,
  _ as Generator,
  _ as GeneratorFunction,
  _ as Int16Array,
  _ as Int32Array,
  _ as Int8Array,
  _ as Intl,
  _ as Iterator,
  _ as JSON,
  _ as Map,
  _ as Math,
  _ as Number,
  _ as Object,
  _ as Promise,
  _ as Proxy,
  _ as Reflect,
  _ as RegExp,
  _ as Set,
  _ as SharedArrayBuffer,
  _ as String,
  _ as Symbol,
  _ as TypeError,
  _ as Uint16Array,
  _ as Uint32Array,
  _ as Uint8Array,
  _ as Uint8ClampedArray,
  _ as WeakMap,
  _ as WeakRef,
  _ as WeakSet,
}
