import "https://cdn.jsdelivr.net/npm/tweakpane@3.0.8/dist/tweakpane.min.js";
import "https://cdn.jsdelivr.net/npm/prismjs@1.28.0/prism.min.js";
import "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js";
import { buildTree } from "./shared/sidebar";

import html from "./multiple-canvas-renderer.html";
import { codeHtml } from "../common";
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
    addNote(text: string) {
        tplMainDiv.insertAdjacentHTML("beforeend", `<p class="bg-primary  bg-opacity-25 p-3 rounded" ><strong>Note:</strong>${text}</p>`);
    },
    addCard({ title = "", description = "", canvasId = "", withIntroduction = false, withPane = false, aspectRatio = "4:3", className = "col-12 col-md-6" } = {}) {
        const [w, h] = aspectRatio.split(":");
        const percentage = (Number(h) / Number(w)) * 100;

        const cardHtml = `<div class="${className}">
            <div class="card">
                ${withPane ? `<div class="card-pane" style="position:absolute; top:8px; right:8px; width:250px; z-index:1"></div>` : ""} 
                ${withIntroduction ? `<div class="card-introduction" style="position:absolute; top:8px; left:8px; width:150px; z-index:1; font-size:12px;"></div>` : ""}
                <div class="card-img-top position-relative">
                    <div style="padding-bottom:${percentage}%; height:0"></div>
                    <div class="overflow-hidden" style="position:absolute; left:0; top:0; right:0; bottom:0;">
                        <canvas id="canvas-${canvasId}" ></canvas>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <div class="card-text">${description}</div>
                </div>
            </div>
        </div>`;
        tplMainDiv.insertAdjacentHTML("beforeend", cardHtml);
        const canvas = document.querySelector<HTMLCanvasElement>(`#canvas-${canvasId}`)!;
        const card = canvas.closest<HTMLDivElement>("div.card")!;
        return {
            canvasId: canvasId,
            canvas: canvas,
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
