import { ImageGraphicCommand } from "../types";

export default class ImageGraphic {
    command?: ImageGraphicCommand;

    image(x: number, y: number, width: number, height: number, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, imageSource: string) {
        this.command = {
            x,
            y,
            width,
            height,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            imageSource
        };
    }
}
