import React, { useEffect, useRef, useState } from 'react';

const WebRTCStream = () => {
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);

    useEffect(() => {
        // Capture desktop using getDisplayMedia for screen sharing
        navigator.mediaDevices.getDisplayMedia({ video: true })
            .then((mediaStream) => {
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            })
            .catch((err) => {
                console.error("Error accessing screen:", err);
            });
    }, []);

    const startRecording = () => {
        if (stream) {
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            mediaRecorderRef.current = mediaRecorder;

            const chunks = [];
            mediaRecorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                sendVideoToServer(blob);
            };

            mediaRecorder.start();
            setRecording(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const sendVideoToServer = (blob) => {
        const formData = new FormData();
        formData.append('video', blob, 'desktop-stream.webm');

        fetch('http://localhost:8080/stream', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Server response:', data);
            })
            .catch((error) => {
                console.error('Error sending video data:', error);
            });
    };

    return (
        <div>
            <h1>Desktop Stream to Server (via REST POST)</h1>
            <video ref={videoRef} autoPlay muted></video>
            <div>
                <button onClick={startRecording} disabled={recording}>Start Recording</button>
                <button onClick={stopRecording} disabled={!recording}>Stop Recording</button>
            </div>
        </div>
    );
};

export default WebRTCStream;