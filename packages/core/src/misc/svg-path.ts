import { Vector2 } from "@geomtoy/util";
import Path from "../geometries/general/Path";
import { PathCommand } from "../types";

export function parseSVGPath(d: string) {
    const paths: {
        commands: PathCommand[];
        closed: boolean;
    }[] = [];

    if (d === "") return paths;
    const parts = d.match(/[mlhvcsqtaz][^mlhvcsqtaz]*/gi);
    if (parts === null) return paths;

    let params: RegExpMatchArray | null;
    let relative = false;
    let previousCommand: string = "";
    let currentCoordinates: [number, number] = [0, 0];
    let startCoordinates: [number, number] = [0, 0];
    let controlCoordinates: [number, number] = [0, 0];
    let pathIndex = NaN;

    function getParam(index: number) {
        return Number(params![index]);
    }
    function getCoordinate(index: number, coord: 0 | 1) {
        let val = getParam(index);
        if (relative) {
            if (coord === 0) val += currentCoordinates[0];
            if (coord === 1) val += currentCoordinates[1];
        }
        return val;
    }
    function getCoordinates(index: number) {
        let x = getParam(index);
        let y = getParam(index + 1);
        if (relative) {
            x += currentCoordinates[0];
            y += currentCoordinates[1];
        }
        return [x, y] as [number, number];
    }

    for (let i = 0, l = parts.length; i < l; i++) {
        let part = parts[i];
        const command = part[0];
        const lowerCommand = command.toLowerCase();
        params = part.match(/[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g);
        const length = params?.length ?? 0;
        relative = command === lowerCommand;

        // Fix issues with z in the middle of SVG path data, not followed by a m command
        if (previousCommand === "z" && !/[mz]/.test(lowerCommand)) {
            pathIndex = paths.push({ commands: [], closed: false }) - 1;
            paths[pathIndex].commands.push(Path.moveTo(currentCoordinates));
        }
        switch (lowerCommand) {
            case "m": {
                pathIndex = paths.push({ commands: [], closed: false }) - 1;
                for (let j = 0; j < length; j += 2) {
                    if (j === 0) {
                        paths[pathIndex].commands.push(Path.moveTo((currentCoordinates = getCoordinates(j))));
                        startCoordinates = currentCoordinates;
                    } else {
                        paths[pathIndex].commands.push(Path.lineTo((currentCoordinates = getCoordinates(j))));
                    }
                }
                controlCoordinates = currentCoordinates;
                break;
            }

            case "l": {
                for (let j = 0; j < length; j += 2) {
                    paths[pathIndex].commands.push(Path.lineTo((currentCoordinates = getCoordinates(j))));
                }
                controlCoordinates = currentCoordinates;
                break;
            }
            case "h":
            case "v": {
                const coord: 0 | 1 = lowerCommand === "h" ? 0 : 1;
                for (let j = 0; j < length; j++) {
                    currentCoordinates[coord] = getCoordinate(j, coord);
                    paths[pathIndex].commands.push(Path.lineTo(currentCoordinates));
                }
                controlCoordinates = currentCoordinates;
                break;
            }
            case "c": {
                for (let j = 0; j < length; j += 6) {
                    paths[pathIndex].commands.push(Path.bezierTo(getCoordinates(j), (controlCoordinates = getCoordinates(j + 2)), (currentCoordinates = getCoordinates(j + 4))));
                }
                break;
            }
            case "s": {
                for (let j = 0; j < length; j += 4) {
                    paths[pathIndex].commands.push(
                        Path.bezierTo(
                            /[cs]/.test(previousCommand) ? Vector2.subtract(Vector2.scalarMultiply(currentCoordinates, 2), controlCoordinates) : currentCoordinates,
                            (controlCoordinates = getCoordinates(j)),
                            (currentCoordinates = getCoordinates(j + 2))
                        )
                    );
                    previousCommand = lowerCommand;
                }
                break;
            }
            case "q": {
                for (let j = 0; j < length; j += 4) {
                    paths[pathIndex].commands.push(Path.quadraticBezierTo((controlCoordinates = getCoordinates(j)), (currentCoordinates = getCoordinates(j + 2))));
                }
                break;
            }
            case "t": {
                for (let j = 0; j < length; j += 2) {
                    paths[pathIndex].commands.push(
                        Path.quadraticBezierTo(
                            (controlCoordinates = /[qt]/.test(previousCommand) ? Vector2.subtract(Vector2.scalarMultiply(currentCoordinates, 2), controlCoordinates) : currentCoordinates),
                            (currentCoordinates = getCoordinates(j))
                        )
                    );
                    previousCommand = lowerCommand;
                }
                break;
            }
            case "a": {
                for (let j = 0; j < length; j += 7) {
                    paths[pathIndex].commands.push(
                        Path.arcTo(getParam(j), getParam(j + 1), getParam(j + 2), getParam(j + 3) === 1, getParam(j + 4) === 1, (currentCoordinates = getCoordinates(j + 5)))
                    );
                }
                break;
            }
            case "z": {
                paths[pathIndex].closed = true;
                currentCoordinates = startCoordinates;
                break;
            }
        }
        previousCommand = lowerCommand;
    }

    return paths;
}
