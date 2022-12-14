declare function Button(props: any): import("preact").JSX.Element;
declare namespace Button {
    export function create(options?: {}): {
        action: string;
    };
    export { type };
    export const label: string;
    export const keyed: boolean;
}
export default Button;
declare const type: "button";
