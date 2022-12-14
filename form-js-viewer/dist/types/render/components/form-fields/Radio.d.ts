declare function Radio(props: any): import("preact").JSX.Element;
declare namespace Radio {
    export function create(options?: {}): {
        values: {
            label: string;
            value: string;
        }[];
    };
    export { type };
    export const label: string;
    export const keyed: boolean;
    export const emptyValue: any;
}
export default Radio;
declare const type: "radio";
