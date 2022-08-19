import { Circle } from "@geomtoy/core";
import { Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewElement } from "@geomtoy/view";
import { codeHtml, strokeFill } from "../../assets/common";
import tpl from "../../assets/templates/multiple-canvas-renderer";

tpl.title("Density and zoom");

const circle = new Circle([0, 0], 10);

tpl.addParagraph(`
    "Density" is like a value that corrects the initial zoom. You can also comprehend it as we have increased or decreased the pixel density of the canvas in advance, note that this is not "Window.devicePixelRatio", but the pre-scale processing.
    It can make very small shape display normally when zoom is 1, and can also make very large shape see all of them when zoom is 1.
    But unfortunately, for better display, density can only be set to the power of 10.
    `);

tpl.addCode(`
    // Here is a circle:
    const circle = new Circle([0, 0], 10);
    `);

{
    const card = tpl.addCard({ title: "density 10 and zoom 1", canvasId: Utility.uuid(), className: "col-12", aspectRatio: "3:1" });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 1.6 }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    view.add(new ViewElement(circle, { interactable: false, ...strokeFill("blue") }));
    card.setDescription("It actually has a radius of 160(px) on you screen.");
    card.appendDescription(
        codeHtml(`
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 1.6 }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    view.add(new ViewElement(circle, { interactable: false, ...strokeFill("blue") }));
    `)
    );
}
{
    const card = tpl.addCard({ title: "density 1 and zoom 1", canvasId: Utility.uuid(), className: "col-12", aspectRatio: "3:1" });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 1, zoom: 1 }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    view.add(new ViewElement(circle, { interactable: false, ...strokeFill("blue") }));
    card.setDescription("It looks like what it should be.");
    card.appendDescription(
        codeHtml(`
        const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 1, zoom: 1  }));
        view.startResponsive(() => {});
        view.startInteractive();
        view.add(new ViewElement(circle, { interactable: false, ...strokeFill("blue") }));
        `)
    );
}
{
    const card = tpl.addCard({ title: "density 10 and zoom 0.1", canvasId: Utility.uuid(), className: "col-12", aspectRatio: "3:1" });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 0.1 }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    view.add(new ViewElement(circle, { interactable: false, ...strokeFill("blue") }));
    card.setDescription("The density and zoom cancel each other out. It still looks like what it should be.");
    card.appendDescription(
        codeHtml(`
        const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 0.1 }));
        view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
        view.startInteractive();
        view.add(new ViewElement(circle, { interactable: false, ...strokeFill("blue") }));
        `)
    );
}
{
    const card = tpl.addCard({ title: "density 1 and zoom 0.1", canvasId: Utility.uuid(), className: "col-12", aspectRatio: "3:1" });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 1, zoom: 0.1 }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    view.add(new ViewElement(circle, { interactable: false, ...strokeFill("blue") }));
    card.setDescription("Oops!");
    card.appendDescription(
        codeHtml(`
        const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 1, zoom: 0.1 }));
        view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
        view.startInteractive();
        view.add(new ViewElement(circle, { interactable: false, ...strokeFill("blue") }));
        `)
    );
}
