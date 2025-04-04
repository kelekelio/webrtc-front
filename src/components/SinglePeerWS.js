import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';

const WebRTCStream = () => {
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const wsRef = useRef(null);

    useEffect(() => {
        // Get user media (webcam or screen share)
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((mediaStream) => {
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            })
            .catch((err) => {
                console.error("Error accessing media devices.", err);
            });

        // Set up WebSocket connection to the backend server
        wsRef.current = new WebSocket('ws://localhost:8080');

        wsRef.current.onopen = () => {
            console.log('WebSocket connection established');
        };

        wsRef.current.onmessage = (message) => {
            console.log('Message from server:', message.data);
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (stream && wsRef.current) {
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: stream,
            });

            peer.on('signal', (data) => {
                // Send the signaling data to the backend server over WebSocket
                wsRef.current.send(JSON.stringify({ type: 'offer', data }));
            });

            peer.on('stream', (stream) => {
                // Handle the incoming stream (not used in this case, but can be used to show video)
                console.log('Received stream:', stream);
            });
        }
    }, [stream]);

    return (
        <div>
            <h1>WebRTC Stream to Server</h1>
            <video ref={videoRef} autoPlay muted></video>
        </div>
    );
};

export default WebRTCStream;