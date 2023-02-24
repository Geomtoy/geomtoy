import "https://cdn.jsdelivr.net/npm/tweakpane@3.0.8/dist/tweakpane.min.js";
import "https://cdn.jsdelivr.net/npm/prismjs@1.28.0/prism.min.js";
import "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js";
import "https://cdn.jsdelivr.net/npm/marked@4.1.0/marked.min.js";
import { buildTree } from "./shared/sidebar";

import html from "./tpl-renderer.html";
import { codeHtml, elementFromString } from "../common";
import { Utility } from "@geomtoy/util";
document.body.insertAdjacentHTML("afterbegin", html);
buildTree();

const tplMainDiv = document.querySelector("#main")!;

export default {
    title(title: string) {
        document.querySelector<HTMLHeadingElement>("h1")!.innerHTML = title;
    },
    addSection(sectionTitle: string, className = "") {
        tplMainDiv.insertAdjacentHTML("beforeend", `<h2 class="${className}">${sectionTitle}</h2>`);
    },
    addSubSection(sectionTitle: string, className = "") {
        tplMainDiv.insertAdjacentHTML("beforeend", `<h3 class="${className}">${sectionTitle}</h3>`);
    },
    addCode(code: string) {
        tplMainDiv.insertAdjacentHTML("beforeend", codeHtml(code));
    },
    addParagraph(text: string, className = "") {
        tplMainDiv.insertAdjacentHTML("beforeend", `<p class="${className}">${text}</p>`);
    },
    addMarkdown(md: string) {
        const div = elementFromString("<div></div>");
        tplMainDiv.appendChild(div);
        // @ts-expect-error
        div.innerHTML = marked.parse(md);
    },
    addNote(text: string) {
        tplMainDiv.insertAdjacentHTML("beforeend", `<p class="bg-primary  bg-opacity-25 p-3 rounded" ><strong>Note: </strong>${text}</p>`);
    },
    addHTMLElement(element: HTMLElement) {
        tplMainDiv.appendChild(element);
    },
    addCard({
        title = "",
        description = "",
        rendererType = "canvas" as "canvas" | "svg" | false,
        withIntroduction = false,
        withPane = false,
        paneWidth = 250 as number | "auto",
        aspectRatio = "4:3",
        className = "col-12 col-md-6"
    } = {}) {
        const [w, h] = aspectRatio.split(":");
        const percentage = (Number(h) / Number(w)) * 100;
        const uuid = Utility.uuid();
        const cardHtml = `<div class="${className}">
            <div class="card" id="card-${uuid}">
                ${withPane ? `<div class="card-pane" style="position:absolute; top:8px; right:8px; width:${paneWidth === "auto" ? "auto" : paneWidth + "px"}; z-index:1"></div>` : ""} 
                ${withIntroduction ? `<div class="card-introduction" style="position:absolute; top:8px; left:8px; width:150px; z-index:1; font-size:12px;"></div>` : ""}
                ${
                    rendererType
                        ? `
                        <div class="card-img-top position-relative">
                            <div style="padding-bottom:${percentage}%; height:0"></div>
                            <div class="overflow-hidden" style="position:absolute; left:0; top:0; right:0; bottom:0;">
                                ${rendererType === "canvas" ? `<canvas id="canvas-${uuid}" ></canvas>` : ""}
                                ${rendererType === "svg" ? `<svg id="svg-${uuid}" xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>` : ""}
                            </div>
                        </div>`
                        : ""
                }
                <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <div class="card-text">${description}</div>
                </div>
            </div>
        </div>`;
        tplMainDiv.insertAdjacentHTML("beforeend", cardHtml);
        const card = document.querySelector<HTMLDivElement>(`#card-${uuid}`)!;
        const canvas = document.querySelector<HTMLCanvasElement>(`#canvas-${uuid}`);
        const svg = document.querySelector<SVGSVGElement>(`#svg-${uuid}`);
        return {
            uuid,
            canvas: canvas,
            svg: svg,
            pane: card.querySelector("div.card-pane"),
            setTitle: function (title: string) {
                const cardTitle = card.querySelector(".card-title")!;
                cardTitle.innerHTML = title;
            },
            setDescription: function (description: string) {
                const cardText = card.querySelector(".card-text")!;
                cardText.innerHTML = description;
            },
            setIntroduction: function (introduction: string) {
                const cardIntroduction = card.querySelector(".card-introduction")!;
                cardIntroduction.innerHTML = introduction;
            },
            appendDescription: function (description: string) {
                const cardText = card.querySelector(".card-text")!;
                cardText.innerHTML = cardText.innerHTML + description;
            }
        };
    }
};
