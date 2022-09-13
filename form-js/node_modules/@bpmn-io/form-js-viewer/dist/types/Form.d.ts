/**
 * The form.
 */
export default class Form {
    /**
     * @constructor
     * @param {FormOptions} options
     */
    constructor(options?: FormOptions);
    /**
     * @public
     * @type {String}
     */
    public _id: string;
    /**
     * @private
     * @type {Element}
     */
    private _container;
    /**
     * @private
     * @type {State}
     */
    private _state;
    get: any;
    invoke: any;
    clear(): void;
    /**
     * Destroy the form, removing it from DOM,
     * if attached.
     */
    destroy(): void;
    /**
     * Open a form schema with the given initial data.
     *
     * @param {Schema} schema
     * @param {Data} [data]
     *
     * @return Promise<{ warnings: Array<any> }>
     */
    importSchema(schema: Schema, data?: Data): Promise<any>;
    /**
     * Submit the form, triggering all field validations.
     *
     * @returns { { data: Data, errors: Errors } }
     */
    submit(): {
        data: Data;
        errors: Errors;
    };
    reset(): void;
    /**
     * @returns {Errors}
     */
    validate(): Errors;
    /**
     * @param {Element|string} parentNode
     */
    attachTo(parentNode: Element | string): void;
    detach(): void;
    /**
     * @private
     *
     * @param {boolean} [emit]
     */
    private _detach;
    /**
     * @param {FormProperty} property
     * @param {any} value
     */
    setProperty(property: FormProperty, value: any): void;
    /**
     * @param {FormEvent} type
     * @param {number} priority
     * @param {Function} handler
     */
    on(type: FormEvent, priority: number, handler: Function): void;
    /**
     * @param {FormEvent} type
     * @param {Function} handler
     */
    off(type: FormEvent, handler: Function): void;
    /**
     * @private
     *
     * @param {FormOptions} options
     * @param {Element} container
     *
     * @returns {Injector}
     */
    private _createInjector;
    /**
     * @private
     */
    private _emit;
    /**
     * @internal
     *
     * @param { { add?: boolean, field: any, remove?: number, value?: any } } update
     */
    _update(update: {
        add?: boolean;
        field: any;
        remove?: number;
        value?: any;
    }): void;
    /**
     * @internal
     */
    _getState(): State;
    /**
     * @internal
     */
    _setState(state: any): void;
}
export type Injector = any;
export type Data = import('./types').Data;
export type Errors = import('./types').Errors;
export type Schema = import('./types').Schema;
export type FormProperties = import('./types').FormProperties;
export type FormProperty = import('./types').FormProperty;
export type FormEvent = import('./types').FormEvent;
export type FormOptions = import('./types').FormOptions;
export type State = {
    data: Data;
    initialData: Data;
    errors: Errors;
    properties: FormProperties;
    schema: Schema;
};
