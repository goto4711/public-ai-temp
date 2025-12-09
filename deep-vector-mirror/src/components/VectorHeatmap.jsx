import React, { useEffect, useRef } from 'react';

const VectorHeatmap = ({ vector, width = 300, height = 300 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !vector || vector.length === 0) return;

        const ctx = canvas.getContext('2d');
        const numValues = vector.length;

        // We'll visualize it as a square grid if possible, or just lines
        const side = Math.ceil(Math.sqrt(numValues));
        const cellWidth = width / side;
        const cellHeight = height / side;

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < numValues; i++) {
            const val = vector[i];
            // Normalize roughly -1 to 1 or 0 to 1 depending on model
            // MobileNet/USE usually output values roughly in -1 to 1 range or similar distribution
            // We'll map them to colors. 
            // Negative = Blue, Positive = Red, Near Zero = Black/White

            // Simple normalization for visualization
            const normalized = Math.max(-1, Math.min(1, val));

            let r = 0, g = 0, b = 0;
            if (normalized > 0) {
                r = Math.floor(normalized * 255);
            } else {
                b = Math.floor(Math.abs(normalized) * 255);
            }
            // Add some green for "activity"
            g = Math.floor(Math.abs(normalized) * 50);

            ctx.fillStyle = `rgb(${r},${g},${b})`;

            const x = (i % side) * cellWidth;
            const y = Math.floor(i / side) * cellHeight;

            ctx.fillRect(x, y, cellWidth, cellHeight);
        }

    }, [vector, width, height]);

    return (
        <div className="vector-heatmap" style={{ border: '4px solid var(--color-main)', padding: '4px', display: 'inline-block' }}>
            <canvas ref={canvasRef} width={width} height={height} />
        </div>
    );
};

export default VectorHeatmap;
