/**
 * @typedef { import('./types').CreateFormOptions } CreateFormOptions
 */
/**
 * Create a form.
 *
 * @param {CreateFormOptions} options
 *
 * @return {Promise<Form>}
 */
export function createForm(options: CreateFormOptions): Promise<Form>;
export { FormFieldRegistry } from "./core";
export * from "./render";
export * from "./util";
export type CreateFormOptions = import('./types').CreateFormOptions;
import Form from "./Form";
export const schemaVersion: 4;
export { Form };
