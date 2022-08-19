import { BooleanOperation, Path, QuadraticBezier } from "@geomtoy/core";
import { Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewElement } from "@geomtoy/view";
import { stroke, strokeFill, lightStroke } from "../assets/common";
import tpl from "../assets/templates/multiple-canvas-renderer";
import { randomPathCommand, strokeFillByIndex } from "./_common";

tpl.title("Path self-union");

const bo = new BooleanOperation();
{
    tpl.addSection("Common case");
    tpl.addParagraph("Refresh to random");

    const path = new Path(
        Utility.range(0, 20).map(_ => randomPathCommand()),
        true
    )!;

    // const path = new Path(
    //
    //     [
    //         { type: "M", x: -99.55319826612725, y: 71.9556114216096, uuid: "a0e9c9f6-07c6-40da-9a46-49e1633fcdbf" },
    //         {
    //             type: "A",
    //             x: -2.8267295066419393,
    //             y: -94.3789235473511,
    //             radiusX: 111.33798769370028,
    //             radiusY: 84.16417109311972,
    //             rotation: 2.8352347370874815,
    //             largeArc: false,
    //             positive: false,
    //             uuid: "ff06e03d-c0c0-4f57-9c49-f56fbf0a1457"
    //         },
    //         { type: "L", x: -62.65097778111377, y: -99.60874393443237, uuid: "d893603e-94de-4bad-b694-f5e59859a5a0" },
    //         {
    //             type: "C",
    //             x: 0.7730391601370457,
    //             y: 80.59068292693814,
    //             controlPoint1X: 2.020301661759177,
    //             controlPoint1Y: 18.833389893196,
    //             controlPoint2X: 64.70207937436965,
    //             controlPoint2Y: 39.61682435246007,
    //             uuid: "0727fd79-9857-49bd-9c8a-1428b4bd4ee6"
    //         },
    //         {
    //             type: "C",
    //             x: 94.10814492044693,
    //             y: -15.572366260174334,
    //             controlPoint1X: 40.272159507725206,
    //             controlPoint1Y: 48.67588791672932,
    //             controlPoint2X: -81.7176741177295,
    //             controlPoint2Y: -91.95765730363247,
    //             uuid: "457e12b3-76a4-4cb9-96ae-5bbe0087fe53"
    //         },
    //         { type: "L", x: -70.64278753649411, y: -18.12151909710593, uuid: "1133a5d7-a7a2-4ab2-9366-9bb45ed1e088" },
    //         {
    //             type: "C",
    //             x: -6.803659139207596,
    //             y: -3.3581166239477653,
    //             controlPoint1X: 33.954640422552416,
    //             controlPoint1Y: 53.95671866090433,
    //             controlPoint2X: 22.094164269405155,
    //             controlPoint2Y: 75.3958579149959,
    //             uuid: "f385a579-f4be-47e9-ac83-329c838b6c39"
    //         },
    //         {
    //             type: "A",
    //             x: -42.21273857947523,
    //             y: 50.51836363739639,
    //             radiusX: 78.00810008543775,
    //             radiusY: 24.480118799774058,
    //             rotation: 1.3363414414923025,
    //             largeArc: false,
    //             positive: true,
    //             uuid: "3ac5eaac-17f4-4053-a6bf-64b7cf819e16"
    //         },
    //         { type: "Q", x: 42.05867425400217, y: -48.117405546509715, controlPointX: -45.938552518834186, controlPointY: 99.90541469998493, uuid: "11b3c421-da56-44f1-98c6-0666159ac5b7" },
    //         {
    //             type: "C",
    //             x: -87.93176880387934,
    //             y: -44.094671931231666,
    //             controlPoint1X: -33.08070206343902,
    //             controlPoint1Y: -37.809669580788665,
    //             controlPoint2X: 31.553712249899235,
    //             controlPoint2Y: -33.396718260608964,
    //             uuid: "e378c2ff-8926-4511-bb62-17cc677f209d"
    //         }
    //     ],
    //     true
    // );

    // invalid path
    //commands: [{"type":"M","x":30.735684676569008,"y":97.17545030066529,"uuid":"b29db318-48d9-47e2-baf5-827ea3c880a9"},{"type":"M","x":-4.517495161902474,"y":-85.14488547978036,"uuid":"f401f74d-6158-47b0-8d86-c925c1ae9cb3"},{"type":"M","x":-4.202437088125819,"y":-96.40990588021423,"uuid":"0026fad0-49d6-4401-842d-d33e3184da8e"},{"type":"M","x":-77.0199990457546,"y":-89.5896702675549,"uuid":"13ae7d4e-9d27-4533-b19f-d2a5123bfb5d"},{"type":"M","x":68.96907545751003,"y":91.0260295505112,"uuid":"d10e773e-2517-41dd-a246-81764952c0be"},{"type":"M","x":7.526096037246347,"y":-55.813375351166485,"uuid":"c6a198f6-d803-4395-99b0-6c1f4c640f54"},{"type":"M","x":1.896198764038985,"y":-4.9213944842029065,"uuid":"de221427-3576-4f03-94fa-9ad24b06b7bd"},{"type":"M","x":-43.05472789189402,"y":96.30034482002117,"uuid":"6b6affd2-a670-4772-9cb2-2268963902f5"},{"type":"M","x":-20.89460016160811,"y":44.71832618611714,"uuid":"48d2f6a0-ceb1-4227-afe9-99c1cdff86c8"},{"type":"M","x":-3.955730445873769,"y":-4.4634877475879335,"uuid":"8e0a39e6-edc0-4c79-ba01-3589a547752d"}]
    //commands: [{"type":"M","x":-76.2741676626911,"y":-78.81373486281137,"uuid":"2f118467-7d6d-4190-8707-89a1c0680c6e"},{"type":"M","x":-76.10096264812923,"y":66.21828648145288,"uuid":"f64d2886-cbbc-4c1c-9b76-86b53b2431b7"},{"type":"M","x":-37.87878690145825,"y":72.6932273506581,"uuid":"e07ab48c-d253-4ad6-9247-f9c101adb758"},{"type":"M","x":37.095333953631865,"y":-77.93678429139557,"uuid":"72f52ea9-af2f-4d8b-be2e-6974c0354db2"},{"type":"M","x":-23.113269728133105,"y":11.133142205708296,"uuid":"7b431c7c-ff41-4053-a63b-6b4a5e21eea1"},{"type":"M","x":40.61647593671046,"y":85.48128637042112,"uuid":"b18cf3ef-f89b-4276-a3c1-6874155f152b"},{"type":"M","x":-21.39452990592349,"y":-67.7759864037009,"uuid":"2d08d414-d39e-438a-bf0f-6f1907e3e141"},{"type":"M","x":-85.19990380891045,"y":-79.34798715742292,"uuid":"c74e0895-d92c-44ee-916f-4c527ff435f2"},{"type":"M","x":-22.190412634542866,"y":-15.54939234559329,"uuid":"1e8152fa-0212-41ad-b2a3-d5732f808072"},{"type":"M","x":97.60718240616782,"y":36.284288241672726,"uuid":"fe377caf-42e5-4fb2-8717-6a86b21387d2"}]
    // console.log(JSON.stringify(path.commands))

    const desc = bo.describe(path);
    const selected = bo.selectSelfUnion(desc);
    console.time();
    const compound = bo.chain(selected);
    console.timeEnd();
    // console.log(compound)

    const card1 = tpl.addCard({ title: "original", canvasId: Utility.uuid(), className: "col-6" });
    const view1 = new View({}, new CanvasRenderer(card1.canvas, {}, { density: 10, zoom: 0.2, yAxisPositiveOnBottom: false }));

    const card2 = tpl.addCard({ title: "self-union", canvasId: Utility.uuid(), className: "col-6" });
    const view2 = new View({}, new CanvasRenderer(card2.canvas, {}, { density: 10, zoom: 0.2, yAxisPositiveOnBottom: false }));

    view1.startResponsive((width, height) => (view1.renderer.display.origin = [width / 2, height / 2]));
    view1.startInteractive();

    view2.startResponsive((width, height) => (view2.renderer.display.origin = [width / 2, height / 2]));
    view2.startInteractive();

    view1.add(new ViewElement(path, { interactable: false, ...strokeFill("red") }));

    // selected.annotators.forEach(item=>{
    //     view2.add(new ViewElement(item.segment, { interactable: false, ...stroke("teal")}));
    //     view2.add(new ViewElement(item.segment.point1, { interactable: false, ...stroke("black")}));
    //     view2.add(new ViewElement(item.segment.point2, { interactable: false, ...stroke("green")}));
    // })

    compound.items.forEach((item, index) => {
        view2.add(new ViewElement(item, { interactable: false, ...strokeFillByIndex(index) }));
    });
}
