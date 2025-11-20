export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export interface User {
    id: UUID;
    email: string;
    displayName: string;
}
export type JsonValue = string | number | boolean | null | JsonValue[] | {
    [key: string]: JsonValue;
};
//# sourceMappingURL=index.d.ts.map