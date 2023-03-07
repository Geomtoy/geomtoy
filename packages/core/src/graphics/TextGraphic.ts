import { Anchor, type TextGraphicCommand } from "../types";

export default class TextGraphic {
    command?: TextGraphicCommand;

    text(x: number, y: number, offsetX: number, offsetY: number, content: string, fontSize: number, fontFamily: string, fontBold: boolean, fontItalic: boolean, anchor: Anchor) {
        this.command = {
            x,
            y,
            offsetX,
            offsetY,
            content,
            fontSize,
            fontFamily,
            fontBold,
            fontItalic,
            anchor
        };
    }
}
