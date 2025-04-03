import { useEffect, useRef } from "react";

const LiveStream = () => {
    const videoRef = useRef(null);
    let ws;

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                startStreaming(stream);
            })
            .catch((err) => console.error("Error accessing media:", err));
    }, []);

    const startStreaming = (stream) => {
        ws = new WebSocket("ws://localhost:8080/ws");

        const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                ws.send(event.data);
            }
        };

        mediaRecorder.start(1000);
    };

    return <video ref={videoRef} autoPlay playsInline />;
};

export default LiveStream;