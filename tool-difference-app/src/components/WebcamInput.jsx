import React, { useRef, useEffect } from 'react';

const WebcamInput = ({ onVideoReady }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const webCamPromise = navigator.mediaDevices
                .getUserMedia({
                    audio: false,
                    video: {
                        facingMode: 'user',
                    },
                })
                .then((stream) => {
                    window.stream = stream;
                    videoRef.current.srcObject = stream;
                    return new Promise((resolve) => {
                        videoRef.current.onloadedmetadata = () => {
                            resolve();
                        };
                    });
                });

            webCamPromise.then(() => {
                if (onVideoReady) onVideoReady(videoRef.current);
            });
        }
    }, [onVideoReady]);

    return (
        <div className="webcam-container">
            <video
                autoPlay
                playsInline
                muted
                ref={videoRef}
                width="224"
                height="224"
                style={{ transform: 'scaleX(-1)' }} // Mirror effect
            />
        </div>
    );
};

export default WebcamInput;
