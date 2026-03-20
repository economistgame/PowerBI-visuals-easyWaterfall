// src/settings.ts
import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import Card = formattingSettings.SimpleCard;
import CompoCard = formattingSettings.CompositeCard;
import Slice = formattingSettings.Slice;
import Model = formattingSettings.Model;
import ToggleSwitch = formattingSettings.ToggleSwitch;
import NumUpDown = formattingSettings.NumUpDown;
import TextInput = formattingSettings.TextInput;
//import AutoDropdown = formattingSettings.AutoDropdown;
//import FontControl = formattingSettings.FontControl;
import FontPicker = formattingSettings.FontPicker;

// Alias de tipos solo para conveniencia
type DataView = powerbi.DataView;

class AxisSetting extends Card {

    //Font-Family, Font-Size, Font-Color
    showYAxis = new ToggleSwitch({
        name: "showYAxis",
        displayName: "Show Y Axis",
        value: false
    });
    showXAxis = new ToggleSwitch({
        name: "showXAxis",
        displayName: "Show X Axis",
        value: true
    });
    AxisYColor = new formattingSettings.ColorPicker({
        name: "AxisYColor",
        displayName: "Color",
        value: { value: "#000000"
         }
    });
    FontYAxisColor = new formattingSettings.ColorPicker({
        name: "FontYAxisColor",
        displayName: "Font Color",
        value: { value: "#000000"
         }
    });
    fontFamily = new FontPicker({
        name: "fontFamily",
        displayName: "Font Family",
        value: "Arial"
    });
    fontSize = new NumUpDown({
        name: "fontSize (in px)",
        displayName: "Font Size",
        value: 12
    });

    name: string = "axis";
    displayName: string = "Axis";
    slices: Slice[] = [this.showXAxis,this.showYAxis,this.fontFamily,this.fontSize,this.AxisYColor,this.FontYAxisColor];

    }

class AlignmentSettingsVisual extends Card {
    alignFinal = new ToggleSwitch({
            name: "alignFinal",
            displayName: "Align Final Value",
            value: false
        });
    name: string = "AlignmentSettings1";
    displayName: string = "Alignment group1";
    collapsible: boolean = false;
    slices: formattingSettings.Slice[] = [this.alignFinal];
}
class AlignmentAxisCategories extends Card {
   
    labelRotation = new NumUpDown({
        name: "labelRotation",
        displayName: "Rotación etiquetas",
        value: 0,        // default 0 grados
        options: {
            minValue: { 
                type: powerbi.visuals.ValidatorType.Min,
                value: -90
            } ,
            maxValue: { 
                type: powerbi.visuals.ValidatorType.Max,
                value: 90
            } 
        }
    });
        dYAdjustment = new NumUpDown({
        name: "dYAdjustment",
        displayName: "Ajuste fino de Y",
        value: 0.25
    });

    name: string = "AlignmentSettings2";
    displayName: string = "Alignment group2";
    collapsible: boolean = false;
    slices: formattingSettings.Slice[] = [this.labelRotation, this.dYAdjustment];
}


class WaterfallColorCardSettings extends Card {

    totalColor = new formattingSettings.ColorPicker({
        name: "totalColor",
        displayName: "Default color",
        value: { value: "#2c3e50"
         }
    });
     increaseColor = new formattingSettings.ColorPicker({
        name: "increaseColor",
        displayName: "increaseColor",
        value: { value: "#27ae60"}
    });
     decreaseColor = new formattingSettings.ColorPicker({
        name: "decreaseColor",
        displayName: "decreaseColor",
        value: { value: "#e74c3c" }
    });
     connectorColor = new formattingSettings.ColorPicker({
        name: "connectorColor",
        displayName: "connectorColor",
        value: { value:  "#bdc3c7" }
    });

    name: string = "colors";
    displayName: string = "Waterfall Colors";
    slices: Slice[] = [this.totalColor, this.increaseColor, this.decreaseColor, this.connectorColor];

}
class TextSettings extends Card {

    InicioText = new TextInput({
        name: "inicioText",
        displayName: "Texto de inicio",
        value:  "Inicio",
        placeholder: "Texto por defecto"
    });
        FinText = new TextInput({
        name: "finText",
        displayName: "Texto de fin",
        value:  "Fin",
        placeholder: "Texto por defecto"
    });

    name: string = "labels";
    displayName: string = "Texts";
    slices: Slice[] = [this.InicioText, this.FinText];

}
export class VisualFormattingSettingsModel extends Model {
    // Create formatting settings model formatting cards
    WaterfallCard = new WaterfallColorCardSettings();
    TextCard = new TextSettings();
    AxisCard = new AxisSetting();
    AlignmentCard2 = new AlignmentAxisCategories();


    cards = [this.WaterfallCard, this.TextCard, this.AxisCard,this.AlignmentCard2];
}
