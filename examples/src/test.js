const canvas = document.querySelector("#canvas");
canvas.style.touchAction = "none";

canvas.addEventListener("touchstart", e => {
    //  console.log(e)
});
canvas.addEventListener("touchmove", e => {
    console.log("touchmove", e);
});
canvas.addEventListener("pointerdown", e => {
    console.log("pointerdown");
});
canvas.addEventListener("pointermove", e => {
    console.log("pointermove", e);
});

canvas.addEventListener("mousedown", e => {
    console.log("mousedown");
});
