import React, { useState, useRef } from "react";

const ScreenStreamer = () => {
    const [streaming, setStreaming] = useState(false);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    const startStreaming = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            videoRef.current.srcObject = stream;

            const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0) {
                    const blob = new Blob([event.data], { type: "video/webm" });

                    const formData = new FormData();
                    formData.append("videoChunk", blob, "chunk.webm");

                    await fetch("http://localhost:8080/stream", { // Endpoint for streaming
                        method: "POST",
                        body: formData
                    });
                }
            };

            mediaRecorder.start(1000); // Sends data in 1-second chunks
            setStreaming(true);
        } catch (error) {
            console.error("Error starting screen share:", error);
        }
    };

    const stopStreaming = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setStreaming(false);

        if (videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    return (
        <div className="p-4 text-center">
            <h1 className="text-2xl font-bold">Live Screen Streamer</h1>
            <video ref={videoRef} autoPlay playsInline className="border w-full max-w-xl mx-auto mt-4" />
            <div className="mt-4">
                {streaming ? (
                    <button onClick={stopStreaming} className="bg-red-500 text-white px-4 py-2 rounded">
                        Stop Streaming
                    </button>
                ) : (
                    <button onClick={startStreaming} className="bg-green-500 text-white px-4 py-2 rounded">
                        Start Streaming
                    </button>
                )}
            </div>
        </div>
    );
};

export default ScreenStreamer;