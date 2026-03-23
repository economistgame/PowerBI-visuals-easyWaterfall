import * as d3 from 'd3';

/**
 * Aplica transformaciones de rotación y alineación a elementos de texto en D3.
 * * @param selection - La selección de D3 (generalmente un grupo 'g' o el SVG).
 * @param rotation - Grados de rotación (ej. -15, -45, 90).
 * @param dyAdjustment - Ajuste vertical en unidades 'em'.
 */
function aplicarTransformacionTexto(
    selection: d3.Selection<SVGGElement | SVGSVGElement, any, any, any>,
    rotation: number,
    dyAdjustment: number
): void {
    selection
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.5em")
        .attr("dy", `${dyAdjustment}em`)
        .attr("transform", `rotate(${rotation})`);
}