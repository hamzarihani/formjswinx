declare function Text(props: any): import("preact").JSX.Element;
declare namespace Text {
    export function create(options?: {}): {
        text: string;
    };
    export { type };
    export const keyed: boolean;
}
export default Text;
declare const type: "text";
