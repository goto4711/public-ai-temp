import React, { useRef, useEffect } from 'react';

const WebcamInput = ({ onVideoReady }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const startWebcam = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { width: 224, height: 224 }
                    });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current.play();
                            onVideoReady(videoRef.current);
                        };
                    }
                } catch (err) {
                    console.error("Error accessing webcam:", err);
                }
            };
            startWebcam();
        }
    }, [onVideoReady]);

    return (
        <div className="webcam-container">
            <video
                ref={videoRef}
                width="224"
                height="224"
                style={{ transform: 'scaleX(-1)', width: '100%', height: '100%', objectFit: 'cover' }}
                playsInline
                muted
            />
        </div>
    );
};

export default WebcamInput;
