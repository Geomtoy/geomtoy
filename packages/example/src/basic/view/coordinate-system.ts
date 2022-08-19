import { Rectangle } from "@geomtoy/core";
import { Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewElement } from "@geomtoy/view";
import { codeHtml, strokeFill } from "../../assets/common";
import tpl from "../../assets/templates/multiple-canvas-renderer";

tpl.title("Coordinate system");

const rectangle = new Rectangle([10, 10], [20, 20]);

tpl.addCode(`
    // Here is a rectangle:
    const rectangle = new Rectangle([10, 10], [20, 20]);
    `);

{
    const card = tpl.addCard({ title: "x-axis positive on right, y-axis positive on top, origin initially at center", canvasId: Utility.uuid(), className: "col-12", aspectRatio: "3:1" });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { xAxisPositiveOnRight: true, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    view.add(new ViewElement(rectangle, { interactable: false, ...strokeFill("blue") }));
    card.setDescription("Commonly used in mathematic, a right-handed coordinate system");
    card.appendDescription(
        codeHtml(`
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { xAxisPositiveOnRight: true, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    view.add(new ViewElement(rectangle, { interactable: false, ...strokeFill("blue") }));
    `)
    );
}
{
    const card = tpl.addCard({ title: "x-axis positive on right, y-axis positive on bottom, origin initially at top-left", canvasId: Utility.uuid(), className: "col-12", aspectRatio: "3:1" });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { xAxisPositiveOnRight: true, yAxisPositiveOnBottom: true }));
    view.startResponsive(() => {});
    view.startInteractive();
    view.add(new ViewElement(rectangle, { interactable: false, ...strokeFill("blue") }));
    card.setDescription("Commonly used in computer graphics, a left-handed coordinate system");
    card.appendDescription(
        codeHtml(`
        const view = new View({}, new CanvasRenderer(card.canvas, {}, { xAxisPositiveOnRight: true, yAxisPositiveOnBottom: true }));
        view.startResponsive(() => {});
        view.startInteractive();
        view.add(new ViewElement(rectangle, { interactable: false, ...strokeFill("blue") }));
        `)
    );
}
{
    const card = tpl.addCard({ title: "x-axis positive on left, y-axis positive on top, origin initially at [50, 50]", canvasId: Utility.uuid(), className: "col-12", aspectRatio: "3:1" });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { xAxisPositiveOnRight: false, yAxisPositiveOnBottom: false, origin: [50, 50] }));
    view.startResponsive(() => {});
    view.startInteractive();
    view.add(new ViewElement(rectangle, { interactable: false, ...strokeFill("blue") }));
    card.setDescription("Not commonly used, a left-handed coordinate system");
    card.appendDescription(
        codeHtml(`
        const view = new View({}, new CanvasRenderer(card.canvas, {}, { xAxisPositiveOnRight: false, yAxisPositiveOnBottom: false, origin: [50, 50] }));
        view.startResponsive(() => {});
        view.startInteractive();
        view.add(new ViewElement(rectangle, { interactable: false, ...strokeFill("blue") }));
        `)
    );
}
{
    const card = tpl.addCard({ title: "x-axis positive on left, y-axis positive on bottom, origin initially at [100, 0]", canvasId: Utility.uuid(), className: "col-12", aspectRatio: "3:1" });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { xAxisPositiveOnRight: false, yAxisPositiveOnBottom: true, origin: [100, 0] }));
    view.startResponsive(() => {});
    view.startInteractive();
    view.add(new ViewElement(rectangle, { interactable: false, ...strokeFill("blue") }));
    card.setDescription("Not commonly used, a right-handed coordinate system");
    card.appendDescription(
        codeHtml(`
        const view = new View({}, new CanvasRenderer(card.canvas, {}, { xAxisPositiveOnRight: false, yAxisPositiveOnBottom: false, origin: [50, 50] }));
        view.startResponsive(() => {});
        view.startInteractive();
        view.add(new ViewElement(rectangle, { interactable: false, ...strokeFill("blue") }));
        `)
    );
}

tpl.addNote(`
    Since we can set the axes like this, obviously "clockwise" and "counterclockwise" don't make any sense any more.
    Geomtoy does not care about the coordinate system when do geometric computing.
    So there will be NO clockwise and counterclockwise properties anywhere, instead "positive" and "negative".
    Positive is the direction of rotation from the positive direction of the x-axis to the positive direction of the y-axis.
    Of course you can also remember this: Positive is counterclockwise in the right-handed coordinate system; positive is clockwise in the left-handed coordinate system.
`);
