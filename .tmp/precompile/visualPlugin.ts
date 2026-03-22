import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api"
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];

var myWaterfall9DA573385558428B909A81D91F9BB54A: IVisualPlugin = {
    name: 'myWaterfall9DA573385558428B909A81D91F9BB54A',
    displayName: 'easyWaterfall',
    class: 'Visual',
    apiVersion: '5.3.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }

        throw 'Visual instance not found';
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["myWaterfall9DA573385558428B909A81D91F9BB54A"] = myWaterfall9DA573385558428B909A81D91F9BB54A;
}

export default myWaterfall9DA573385558428B909A81D91F9BB54A;