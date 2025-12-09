import React, { useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

export const ResidualCanvas = ({ tensor, width, height, label = "Residual" }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (tensor && canvasRef.current) {
            tf.browser.toPixels(tensor, canvasRef.current);
        }
    }, [tensor, width, height]);

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-deep-muted text-sm mb-2 uppercase tracking-wider">{label}</h3>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="border border-deep-surface shadow-lg"
            />
        </div>
    );
};
