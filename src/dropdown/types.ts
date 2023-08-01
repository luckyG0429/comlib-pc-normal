export interface Data {
    options: { label: string, value: any, disabled?: boolean }[],
    placement: "bottomLeft" | "bottomCenter" | "bottomRight" | "topLeft" | "topCenter" | "topCenter",
    width: number | string,
    isCustom: boolean,
    content: string,
    trigger: "hover" | "click"
}