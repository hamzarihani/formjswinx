declare function Select(props: any): import("preact").JSX.Element;
declare namespace Select {
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
export default Select;
declare const type: "select";
