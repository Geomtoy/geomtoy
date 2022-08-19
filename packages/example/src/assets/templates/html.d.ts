/*
Declare a fake third-party html module to make typescript to know any html file imported will return a template render function.
 */
declare module "*.html" {
    var html: string;
    export default html;
}
