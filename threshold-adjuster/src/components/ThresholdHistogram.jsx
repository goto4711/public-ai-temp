import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ThresholdHistogram = ({ data, threshold, setThreshold }) => {
    const svgRef = useRef();
    const wrapperRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        const width = wrapperRef.current.clientWidth;
        const height = 200;
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };

        // Clear previous SVG
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // X scale (Fixed [0, 1])
        const x = d3.scaleLinear()
            .domain([0, 1])
            .range([0, innerWidth]);

        // Histogram bins
        const histogram = d3.bin()
            .value(d => d.risk_score)
            .domain(x.domain())
            .thresholds(x.ticks(40));

        const bins = histogram(data);

        // Y scale
        const y = d3.scaleLinear()
            .range([innerHeight, 0])
            .domain([0, d3.max(bins, d => d.length)]);

        // Color scale based on threshold
        const colorScale = (d) => {
            const binMid = (d.x0 + d.x1) / 2;
            if (binMid < threshold) return "#832161"; // Deep Purple (Rejected)
            if (binMid >= threshold) return "#ADFC92"; // Neon Green (Accepted)
            return "#ccc";
        };

        // Append bars
        svg.selectAll("rect.bar")
            .data(bins)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 1)
            .attr("transform", d => `translate(${x(d.x0)},${y(d.length)})`)
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr("height", d => innerHeight - y(d.length))
            .style("fill", d => colorScale(d))
            .style("opacity", 0.9);

        // Add X axis
        svg.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(10));

        // Add Y axis
        svg.append("g")
            .call(d3.axisLeft(y).ticks(5));

        // Zone of Doubt Highlight
        const doubtRange = 0.05;
        svg.append("rect")
            .attr("x", x(threshold - doubtRange))
            .attr("y", 0)
            .attr("width", x(threshold + doubtRange) - x(threshold - doubtRange))
            .attr("height", innerHeight)
            .attr("fill", "var(--color-main-secondary)")
            .attr("opacity", 0.3)
            .style("pointer-events", "none");

        // Draggable Threshold Line
        const drag = d3.drag()
            .on("drag", (event) => {
                let newThreshold = x.invert(event.x);
                newThreshold = Math.max(0, Math.min(1, newThreshold));
                setThreshold(newThreshold);
            });

        // Invisible rect for easier dragging area around the line
        const dragAreaWidth = 20;
        const lineGroup = svg.append("g")
            .attr("class", "threshold-group")
            .attr("transform", `translate(${x(threshold)}, 0)`)
            .call(drag)
            .style("cursor", "ew-resize");

        // The visible line
        lineGroup.append("line")
            .attr("y1", -10)
            .attr("y2", innerHeight)
            .attr("stroke", "#000")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

        // The handle circle
        lineGroup.append("circle")
            .attr("cy", -10)
            .attr("r", 6)
            .attr("fill", "#000");

        // Invisible wide rect for hit testing
        lineGroup.append("rect")
            .attr("x", -dragAreaWidth / 2)
            .attr("y", -20)
            .attr("width", dragAreaWidth)
            .attr("height", innerHeight + 20)
            .attr("fill", "transparent");

        // Click to set
        svg.on("click", (event) => {
            const [coords] = d3.pointer(event);
            let newThreshold = x.invert(coords[0]);
            newThreshold = Math.max(0, Math.min(1, newThreshold));
            setThreshold(newThreshold);
        });

    }, [data, threshold, setThreshold]);

    return (
        <div ref={wrapperRef} className="w-full bg-white/50 rounded-none border-2 border-[var(--color-main)] p-4 select-none">
            <h3 className="text-lg font-bold mb-2 uppercase text-[var(--color-main)]">Risk Score Distribution</h3>
            <svg ref={svgRef}></svg>
            <p className="text-xs text-[var(--color-text)] mt-2 text-center opacity-70">
                Drag the dotted line to adjust the acceptance threshold.
            </p>
        </div>
    );
};

export default ThresholdHistogram;
