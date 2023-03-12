# @geomtoy/view

## Known Issues:
- Rendering issue. Neither `SvgRenderer` nor `CanvasRenderer` works properly Safari<=15. We basically couldn't find a suitable way to handle pattern and other interface images in the microtask queue. Contributions of codes compatible with these versions are welcome. This issue is does not exist in Safari>=16.1.

- `ResizeObserver` is not implemented Safari<13.1 [see on Can I use](https://caniuse.com/?search=ResizeObserver), so `StartResponsive` of `View`' does not work.

    