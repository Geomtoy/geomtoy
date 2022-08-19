import treeJson from "../../../tree.json";

function treeRecursion(data: any, dirPath: string, parentElement: HTMLUListElement) {
    data.children.forEach((item: any, index: number) => {
        const li = document.createElement("li");
        if (item.type === "file") {
            li.innerHTML = `<a class="file text-secondary text-decoration-none" href="${item.url}">${item.name}</a>`;
            parentElement.append(li);
        }
        if (item.type === "dir") {
            dirPath = dirPath + "-" + index.toString();
            const active = sessionStorage.getItem(dirPath) || "1";
            li.innerHTML = `<span class="dir dir-open text-dark">${item.name}</span><ul data-path="${dirPath}" class="nested ${active === "1" ? "active" : ""}"></ul>`;
            parentElement.append(li);
            sessionStorage.setItem(dirPath, active);
            treeRecursion(item, dirPath, li.querySelector("ul.nested")!);
        }
    });
}

export function buildTree() {
    treeRecursion(treeJson, "r", document.querySelector("#treeRoot") as HTMLUListElement);

    const togglers = document.getElementsByClassName("dir") as HTMLCollectionOf<HTMLLIElement>;
    for (const t of togglers) {
        t.addEventListener("click", function () {
            const ul = this.parentElement!.querySelector(".nested")!;
            ul.classList.toggle("active");
            const dirPath = ul.getAttribute("data-path")!;
            sessionStorage.setItem(dirPath, ul.classList.contains("active") ? "1" : "0");
            this.classList.toggle("dir-open");
        });
    }
}
