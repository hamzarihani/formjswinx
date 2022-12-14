/**
 * @typedef { { container } } Config
 * @typedef { import('didi').Injector } Injector
 * @typedef { import('../core/EventBus').default } EventBus
 * @typedef { import('../Form').default } Form
 */
/**
 * @param {Config} config
 * @param {EventBus} eventBus
 * @param {Form} form
 * @param {Injector} injector
 */
declare function Renderer(config: Config, eventBus: any, form: Form, injector: any): void;
declare namespace Renderer {
    const $inject: string[];
}
export default Renderer;
export type Config = {
    container;
};
export type Injector = any;
export type EventBus = any;
export type Form = import('../Form').default;
