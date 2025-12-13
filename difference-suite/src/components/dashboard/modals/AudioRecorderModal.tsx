import React, { useRef, useState, useEffect } from 'react';
import { Mic, Square, X, Save } from 'lucide-react';

interface AudioRecorderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File) => void;
}

export const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({ isOpen, onClose, onCapture }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setAudioBlob(null);
            setDuration(0);
            setIsRecording(false);
            setError(null);
        } else {
            stopRecording();
        }
    }, [isOpen]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop()); // Stop mic
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Mic error:', err);
            setError('Could not access microphone.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const handleSave = () => {
        if (audioBlob) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            // Suggesting .webm, though modern browsers capture in webm/ogg commonly.
            const file = new File([audioBlob], `recording-${timestamp}.webm`, { type: 'audio/webm' });
            onCapture(file);
            onClose();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white max-w-md w-full rounded-lg shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-2 border-main bg-main/5">
                    <h2 className="text-lg font-bold text-main uppercase flex items-center gap-2">
                        <Mic className="w-5 h-5" />
                        Record Audio
                    </h2>
                    <button onClick={onClose} className="text-main/60 hover:text-main">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center justify-center gap-6 bg-gray-50">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isRecording ? 'border-red-500 bg-red-50 animate-pulse' : 'border-main/20 bg-white'}`}>
                        <Mic className={`w-10 h-10 ${isRecording ? 'text-red-500' : 'text-main/40'}`} />
                    </div>

                    <div className="text-3xl font-mono font-bold text-main">
                        {formatTime(duration)}
                    </div>

                    {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

                    {audioBlob && !isRecording && (
                        <div className="w-full bg-white p-3 rounded border border-main/20 text-center">
                            <p className="text-xs font-bold text-main/60 uppercase mb-2">Review</p>
                            <audio controls src={URL.createObjectURL(audioBlob)} className="w-full h-8" />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t-2 border-main flex justify-center gap-4">
                    {!isRecording && !audioBlob && (
                        <button
                            onClick={startRecording}
                            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-bold uppercase tracking-wider hover:bg-red-600 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,0.2)] transition-all"
                        >
                            <Mic className="w-5 h-5" />
                            Record
                        </button>
                    )}

                    {isRecording && (
                        <button
                            onClick={stopRecording}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-main border-2 border-main font-bold uppercase tracking-wider hover:bg-gray-50 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,0.2)] transition-all"
                        >
                            <Square className="w-5 h-5 fill-current" />
                            Stop
                        </button>
                    )}

                    {audioBlob && !isRecording && (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-3 bg-main text-white font-bold uppercase tracking-wider hover:bg-main/90 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,0.2)] transition-all"
                        >
                            <Save className="w-5 h-5" />
                            Save Recording
                        </button>
                    )}
                    {audioBlob && !isRecording && (
                        <button
                            onClick={() => { setAudioBlob(null); setDuration(0); }}
                            className="px-4 py-3 text-main/60 font-bold uppercase hover:text-main text-sm"
                        >
                            Discard
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
