import { Anchor, type ImageGraphicCommand } from "../types";

export default class ImageGraphic {
    command?: ImageGraphicCommand;

    image(x: number, y: number, width: number, height: number, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, source: string, consistent: boolean, anchor: Anchor) {
        this.command = {
            x,
            y,
            width,
            height,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            source,
            consistent,
            anchor
        };
    }
}
