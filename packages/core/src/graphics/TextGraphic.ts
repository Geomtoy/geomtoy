import { TextGraphicCommand } from "../types";

export default class TextGraphic {
    command?: TextGraphicCommand;

    text(x: number, y: number, offsetX: number, offsetY: number, text: string, fontSize: number, fontFamily: string, fontBold: boolean, fontItalic: boolean) {
        this.command = {
            x,
            y,
            offsetX,
            offsetY,
            text,
            fontSize,
            fontFamily,
            fontBold,
            fontItalic
        };
    }
}