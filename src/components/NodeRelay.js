// src/MediaCapture.js
import React, { useState, useRef } from "react";
import axios from "axios";

const MediaCapture = () => {
    const [stream, setStream] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const videoRef = useRef();

    // Function to start capturing the webcam and desktop screen
    const startCapture = async () => {
        try {
            // Capture the webcam
            const webcamStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            // Capture the desktop screen
            const desktopStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
            });

            // Combine the webcam stream and desktop screen stream
            const combinedStream = new MediaStream();
            webcamStream.getTracks().forEach((track) => combinedStream.addTrack(track));
            desktopStream.getTracks().forEach((track) => combinedStream.addTrack(track));

            // Set the combined stream to the video element
            setStream(combinedStream);
            videoRef.current.srcObject = combinedStream;

            setIsRecording(true);
        } catch (err) {
            console.error("Error capturing media:", err);
        }
    };

    const stopCapture = async () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
            setIsRecording(false);

            // Convert the MediaStream to a Blob (MP4 or WebM format)
            const videoBlob = await new Promise((resolve) => {
                const recorder = new MediaRecorder(stream);
                const chunks = [];
                recorder.ondataavailable = (event) => chunks.push(event.data);
                recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
                recorder.start();
                setTimeout(() => recorder.stop(), 50000); // Stop after 50 seconds (for testing)
            });

            // Upload the Blob to the server
            const formData = new FormData();
            formData.append("file", videoBlob, "video.webm");

            try {
                const response = await axios.post("http://localhost:5000/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                console.log("Upload successful:", response.data);
            } catch (error) {
                console.error("Upload failed:", error);
            }
        }
    };

    return (
        <div>
            <h1>Video Capture</h1>
            <video ref={videoRef} autoPlay playsInline />
            <div>
                {isRecording ? (
                    <button onClick={stopCapture}>Stop Recording</button>
                ) : (
                    <button onClick={startCapture}>Start Recording</button>
                )}
            </div>
        </div>
    );
};

export default MediaCapture;
