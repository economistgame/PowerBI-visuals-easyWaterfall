"use strict";

import "./../style/visual.less";

import powerbi from "powerbi-visuals-api";
import * as d3 from "d3";
import "./../style/visual.less";

import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

// Importar el modelo de configuración
import { VisualFormattingSettingsModel } from "./settings";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";



//Integracion del Tooltip
import {
    ITooltipServiceWrapper,
    createTooltipServiceWrapper
} from "powerbi-visuals-utils-tooltiputils";

export class Visual implements IVisual {

    private svg: d3.Selection<SVGSVGElement, any, any, any>;
    private container: d3.Selection<SVGGElement, any, any, any>;

    private host: powerbi.extensibility.visual.IVisualHost;

    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private selectionManager: powerbi.extensibility.ISelectionManager;

    //Usos de settings
    
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    //Landing page
    private landingPage: d3.Selection<HTMLDivElement, any, any, any>;

    constructor(options: VisualConstructorOptions) {
        this.host = (options as any).host;

        this.svg = d3
            .select(options.element)
            .append("svg");

        this.container = this.svg.append("g");

        // Tooltip & Selection Manager
        this.tooltipServiceWrapper = createTooltipServiceWrapper(
            options.host.tooltipService,
            options.element
        );

        this.selectionManager = options.host.createSelectionManager();

        this.formattingSettingsService = new FormattingSettingsService();

        this.landingPage = d3.select(options.element)
            .append("div")
            .classed( "landing-page",true)
            .style("display", "none")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("height", "100%")
            .style("font-size", "18px");
        
        this.landingPage.append("h1").text("Bienvenido a mi Waterfall Chart")
                        .append("p").text("Por favor, arrastra los campos a las áreas de 'startValue', 'bridgeMeasure' y 'endValue' para visualizar el gráfico.");
    }

    public update(options: VisualUpdateOptions) {

        const dataView = options.dataViews[0];
        //dataView.categorical.categories.length === 0 
        const showLandingPage = !dataView || !dataView.categorical || dataView.categorical.values.length === 0;
        //if (!dataView || !dataView.categorical) return;
        //if (!dataView) return;
         if (showLandingPage) {
            this.svg.style("display", "none");
            this.landingPage.style("display", "flex");
            return;
        } else {
            this.svg.style("display", "block");
            this.landingPage.style("display", "none");
        }
        
        
        
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel,
            options.dataViews?.[0]
        );


    // Configuraciones extraídas de settings

        const totalColor     = this.formattingSettings.WaterfallCard.totalColor.value.value;
        const increaseColor  = this.formattingSettings.WaterfallCard.increaseColor.value.value;
        const decreaseColor  = this.formattingSettings.WaterfallCard.decreaseColor.value.value;
        const connectorColor = this.formattingSettings.WaterfallCard.connectorColor.value.value;
        const inicioText = this.formattingSettings.TextCard.InicioText.value;
        const finText = this.formattingSettings.TextCard.FinText.value;
        const AxisYColor = this.formattingSettings.AxisCard.AxisYColor.value.value;
        const fontFamily = this.formattingSettings.AxisCard.fontFamily.value;
        const fontSize = this.formattingSettings.AxisCard.fontSize.value;
        const FontYAxisColor = this.formattingSettings.AxisCard.FontYAxisColor.value.value;
        const showYAxis = this.formattingSettings.AxisCard.showYAxis.value;
        const showXAxis = this.formattingSettings.AxisCard.showXAxis.value;
        const rotation = this.formattingSettings.AlignmentCard2.labelRotation.value;
        const dYAdjustment = this.formattingSettings.AlignmentCard2.dYAdjustment.value;

        const categorical = dataView.categorical;
        const { width, height } = options.viewport;

        this.svg.attr("width", width).attr("height", height);
        this.container.selectAll("*").remove();

        // --- EXTRACCIÓN DE VALORES ---
        let categories = categorical.categories[0].values.map(v => v.toString());
        const categoriesField = categorical.categories[0];
       
        const valuesMetadata = categorical.values;
        const startName = valuesMetadata.find(v => v.source.roles['startValue'])?.source.displayName;
        const endName = valuesMetadata.find(v => v.source.roles['endValue'])?.source.displayName;
        const bridgeValuesNames = dataView.categorical.values
                                .filter(v => v.source.roles?.['bridgeMeasure'])
                                .map(v => v.source.displayName ?? "Measure");

        const startVal = <number>valuesMetadata.find(v => v.source.roles['startValue'])?.values[0] || 0;
        const bridgeVals = valuesMetadata.find(v => v.source.roles['bridgeMeasure'])?.values || [];
        const endVal = <number>valuesMetadata.find(v => v.source.roles['endValue'])?.values[0] || 0;


        if (bridgeValuesNames.length > 1){
            categories = bridgeValuesNames;
        } 

        // --- CONSTRUCCIÓN DEL ARRAY DE PUNTOS ---
        let data: any[] = [];
        let runningTotal = startVal;

        // 1. Valor inicial
        data.push({
            label: startName,
            start: 0,
            end: startVal,
            endTooltip: startVal,
            type: "total",
            selectionId: this.host.createSelectionIdBuilder().createSelectionId()
        });

        // 2. Conexiones / Variaciones
        categories.forEach((cat, i) => {

            const val = <number>bridgeVals[i] || 0;

            data.push({
                label: cat.toString(),
                start: runningTotal,
                end: runningTotal + val,
                endTooltip:runningTotal + val,
                type: val >= 0 ? "inc" : "dec",
                selectionId: this.host.createSelectionIdBuilder()
                    .withCategory(categoriesField, i)
                    .createSelectionId()
            });

            runningTotal += val;
        });

        // 3. Valor final endVal
        data.push({
            label: endName,
            start: 0,
            end: runningTotal,
            endTooltip: endVal,
            type: "total",
            selectionId: this.host.createSelectionIdBuilder().createSelectionId()
        });

        // --- RENDERIZADO ---
        const margin = { top: 20, right: 20, bottom: 40, left: 60 };

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const x = d3.scaleBand()
            .domain(data.map(d => d.label))
            .range([0, chartWidth])
            .padding(0.3);
        
        
        const minY = d3.min(data.map(d => Math.min(d.start, d.end)))!;
        const maxY = d3.max(data.map(d => Math.max(d.start, d.end)))!;

        //const y = d3.scaleLinear()
         //   .domain([0, d3.max([startVal, endVal, runningTotal])! * 1.1])
         //   .range([chartHeight, 0]);

         
        const y = d3.scaleLinear()
            .domain([minY * 1.1, maxY * 1.1])
            .range([chartHeight, 0]);

        const chart = this.container
            .attr("transform", `translate(${margin.left},${margin.top})`);
        // --- EJE X ---
        if (showXAxis) {
            const xAxis = d3.axisBottom(x);
        
            const CasosTransformacion = chart.append("g")
                .attr("transform", `translate(0, ${chartHeight})`)
                .call(xAxis)
                .style("color", AxisYColor)
                .style("font-family", fontFamily)
                .style("font-size", fontSize + "px");

            if (rotation !== 0) {
                CasosTransformacion
                    .selectAll("text")              //de aqui es donde se lleva la rotación
                    .style("text-anchor", "end")
                    .attr("dx",  "-0.5em")
                    .attr("dy", dYAdjustment+"em")
                    .attr("transform", "rotate("+rotation+")");
            }

        }
        //--- EJE Y ---
        if (showYAxis) {
        
            const yAxis = d3.axisLeft(y).ticks(5);
            chart.append("g")
                 .call(yAxis)
                 .style("color", AxisYColor)
                 .style("font-family", fontFamily)
                 .style("font-size", fontSize + "px");
        }

        // --- BARRAS ---
        const bars = chart.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.label)!)
            .attr("y", d => y(Math.max(d.start, d.end)))
            .attr("width", x.bandwidth())
            .attr("height", d => Math.abs(y(d.start) - y(d.end)))
            .attr("fill", d =>
                d.type === "total" ? totalColor :
                    (d.type === "inc" ? increaseColor : decreaseColor)
            );

        // --- TOOLTIP ---
        this.tooltipServiceWrapper.addTooltip(
            bars,
            (d: any) => [{
                displayName: d.label,
                value: (d.endTooltip - d.start).toFixed(2),
                color: d.color,
            }],
            (d: any) => d.label
        );

        // --- INTERACTIVIDAD ---
        //Edfecto de selección al hacer click sobre una barra
        bars.on("click", (event, d: any) => {
            if (this.host.hostCapabilities.allowInteractions) {
                const excludedCategories = ["total"];

                if (excludedCategories.includes(d.type)) {
                    this.selectionManager.clear();
                    return;
                }
                
                
                this.selectionManager.select(d.selectionId).then(selection => {

                    bars.attr("opacity", selection.length ? 0.4 : 1);
                    d3.select(event.currentTarget).attr("opacity", 1);

                });
            }
            event.stopPropagation();
        });
        //Menu contextual al hacer click derecho sobre una barra
        bars.on("contextmenu", (event: MouseEvent, d: any) => {
            if (this.host.hostCapabilities.allowInteractions) {
                this.selectionManager.showContextMenu(d.selectionId, {
                    x: event.clientX,
                    y: event.clientY
                });
            }
            event.preventDefault(); 
        });

        // Click vacío → limpiar selección
        this.svg.on("click", () => {
            this.selectionManager.clear();
            bars.attr("opacity", 1);
        });

        // --- LÍNEAS CONECTORAS ---
        const hasConnections = true;

        if(hasConnections){
            data.forEach((d, i) => {
                if (i === data.length - 1) return;

                chart.append("line")
                    .attr("x1", x(d.label)! + x.bandwidth())
                    .attr("y1", y(d.end))
                    .attr("x2", x(data[i + 1].label)!)
                    .attr("y2", y(d.end))
                    .attr("stroke", connectorColor)
                    .attr("stroke-dasharray", "4");
            });
        }
        chart.selectAll(".label")
                .data(data)
                .enter()
                .append("text")
                .attr("class", "label")
                .attr("x", d => x(d.label)! + x.bandwidth() / 2)
                .attr("y", d => y(Math.max(d.start, d.end)) - 5)
                .attr("text-anchor", "middle")
                .style("fill", "#000000")
                .style("font-size", 12 + "px")
                .text(d => (d.endTooltip - d.start).toFixed(1))


    }
    
    
   public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

}