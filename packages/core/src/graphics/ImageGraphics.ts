import { ImageGraphicsCommand } from "../types";

export default class ImageGraphics {
    command?: ImageGraphicsCommand;

    image(constantSize: boolean, x: number, y: number, width: number, height: number, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, imageSource: string) {
        this.command = {
            constantSize,
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
