import { TextGraphicsCommand } from "../types";

export default class TextGraphics {
    command?: TextGraphicsCommand;

    text(constantSize: boolean, x: number, y: number, text: string, fontSize: number, fontFamily: string, fontBold: boolean, fontItalic: boolean) {
        this.command = {
            constantSize,
            x,
            y,
            text,
            fontSize,
            fontFamily,
            fontBold,
            fontItalic
        };
    }
}
