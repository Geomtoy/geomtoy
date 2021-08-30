const styleMod = `
.dg.main.a {
    background-color: #000000 !important;
    margin-right: 0 !important;
}
.dg .cr.function:hover, .dg .cr.boolean:hover {
    background: #1a1a1a;
}
.dg .property-name {
    width: 50%;
}
.dg .c {
    width: 50%;
}
.dg .c input[type='checkbox'] {
    -webkit-appearance: none;
    -moz-appearance: none;
    -o-appearance: none;
    appearance:none;
    box-shadow: none;
}
.dg .c input[type='checkbox']::before {
    border: 4px solid;
    border-radius: 0;
    background-color: #303030;
    border-color: transparent;
    box-sizing: border-box;
    color: #2FA1D6;
    content: close-quote;
    display: inline-block;
    height: 14px;
    width: 14px;
}  
.dg .c input[type='checkbox']:checked::before {
    background-color: #2FA1D6;
    border-color: #303030;
}
`
let style = document.createElement("style")
style.innerHTML = styleMod
document.head.appendChild(style)
document.head.removeChild(document.querySelector("style[type='text/css']~style[type='text/css']"))
