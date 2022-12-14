export { FormFieldRegistry };
declare namespace _default {
    const __depends__: ({
        importer: (string | typeof import("../import/Importer").default)[];
    } | {
        __init__: string[];
        formFields: (string | typeof import("../render").FormFields)[];
        renderer: (string | typeof import("../render/Renderer").default)[];
    })[];
    const eventBus: any[];
    const formFieldRegistry: (string | typeof FormFieldRegistry)[];
    const validator: (string | typeof Validator)[];
}
export default _default;
import FormFieldRegistry from "./FormFieldRegistry";
import Validator from "./Validator";
