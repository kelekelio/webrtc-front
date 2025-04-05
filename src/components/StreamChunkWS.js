import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
    withCredentials: true,
    transports: ['websocket'], // Helps avoid fallback polling issues
});

export default function StreamPage() {
    const [isStreaming, setIsStreaming] = useState(false);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);

    const startCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });

            streamRef.current = stream;

            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm; codecs=vp8,opus',
            });

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    e.data.arrayBuffer().then((buffer) => {
                        socket.emit('webm-chunk', buffer);
                    });
                }
            };

            recorder.onstop = () => {
                socket.emit('stop-stream');
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current = recorder;
            socket.emit('start-stream');
            recorder.start(1000); // 1s chunks

            setIsStreaming(true);
        } catch (err) {
            console.error('Error capturing screen:', err);
        }
    };

    const stopStreaming = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsStreaming(false);
        }
    };

    useEffect(() => {
        return () => {
            stopStreaming();
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold mb-6">Desktop Streaming</h1>
            {!isStreaming ? (
                <button
                    onClick={startCapture}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    Start Streaming
                </button>
            ) : (
                <button
                    onClick={stopStreaming}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                >
                    Stop Streaming
                </button>
            )}
        </div>
    );
}