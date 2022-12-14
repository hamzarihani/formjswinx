declare class Importer {
    /**
     * @constructor
     * @param { import('../core').FormFieldRegistry } formFieldRegistry
     * @param { import('../render/FormFields').default } formFields
     */
    constructor(formFieldRegistry: import('../core').FormFieldRegistry, formFields: import('../render/FormFields').default);
    _formFieldRegistry: import("../core").FormFieldRegistry;
    _formFields: import("../render/FormFields").default;
    /**
     * Import schema adding `id`, `_parent` and `_path`
     * information to each field and adding it to the
     * form field registry.
     *
     * @param {any} schema
     * @param {any} [data]
     *
     * @return { { warnings: Array<any>, schema: any, data: any } }
     */
    importSchema(schema: any, data?: any): {
        warnings: Array<any>;
        schema: any;
        data: any;
    };
    /**
     * @param {any} formField
     * @param {string} [parentId]
     *
     * @return {any} importedField
     */
    importFormField(formField: any, parentId?: string): any;
    importFormFields(components: any, parentId: any): void;
    /**
     * @param {Object} data
     *
     * @return {Object} importedData
     */
    importData(data: any): any;
}
declare namespace Importer {
    const $inject: string[];
}
export default Importer;
