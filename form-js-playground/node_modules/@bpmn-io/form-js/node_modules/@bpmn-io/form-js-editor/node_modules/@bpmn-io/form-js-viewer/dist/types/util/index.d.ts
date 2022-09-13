export function findErrors(errors: any, path: any): any;
export function isRequired(field: any): any;
export function pathParse(path: any): any;
export function pathsEqual(a: any, b: any): any;
export function pathStringify(path: any): any;
export function generateIndexForType(type: any): any;
export function generateIdForType(type: any): string;
/**
 * @template T
 * @param {T} data
 * @param {(this: any, key: string, value: any) => any} [replacer]
 * @return {T}
 */
export function clone<T>(data: T, replacer?: (this: any, key: string, value: any) => any): T;
export * from "./injector";
export * from "./form";
