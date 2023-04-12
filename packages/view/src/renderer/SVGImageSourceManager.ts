import { Maths } from "@geomtoy/util";
import ImageSourceManager from "./ImageSourceManager";

export default class SVGImageSourceManager extends ImageSourceManager {
    private _placeholderContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    placeholder(width: number, height: number, backgroundColor: string = "rgba(0, 0, 0, 0.3)", color: string = "rgba(0, 0, 0, 0.5)") {
        const svg = this._placeholderContainer.cloneNode() as SVGSVGElement;
        svg.setAttribute("width", `${width}`);
        svg.setAttribute("height", `${height}`);

        const size = (width < height ? width : height) / 3;
        const boxSize = size / 5;

        svg.innerHTML = `
            <rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}"/>
            <path transform="matrix(${Maths.SQRT1_2}, ${Maths.SQRT1_2}, ${-Maths.SQRT1_2}, ${Maths.SQRT1_2}, ${width / 2}, ${(height - size * Maths.SQRT2) / 2})"
                d="M0,0V${boxSize * 5}H${boxSize * 5}V${boxSize * 2}H${boxSize * 4}V${boxSize * 4}H${boxSize}V${boxSize}H${boxSize * 5}V0Z
                M${boxSize * 2},${boxSize * 2}V${boxSize * 3}H${boxSize * 3}V${boxSize * 2}Z" fill="${color}"/>  
        `;
        return svg;
    }
}
