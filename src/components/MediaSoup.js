import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';

const WebRTCClient = () => {
    const [socket, setSocket] = useState(null);
    const videoRef = useRef(null);
    const [peerConnection, setPeerConnection] = useState(null);

    useEffect(() => {
        // Initialize Socket.IO to communicate with the backend
        const socketIo = io('http://localhost:5000');
        setSocket(socketIo);

        socketIo.on('roomJoined', (data) => {
            console.log('Room joined: ', data);
        });

        return () => socketIo.disconnect();
    }, []);

    const startStreaming = async () => {
        // Capture the user's media
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoRef.current.srcObject = stream;

        // Create the RTCPeerConnection to establish a connection to the MediaSoup server
        const pc = new RTCPeerConnection();

        // Add the tracks from the media stream to the peer connection
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // Send the local media offer to the server
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', offer);

        // Store the peer connection state
        setPeerConnection(pc);

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('candidate', event.candidate);
            }
        };

        // Display remote video (if necessary)
        pc.ontrack = (event) => {
            const remoteStream = event.streams[0];
            const remoteVideo = document.createElement('video');
            remoteVideo.srcObject = remoteStream;
            remoteVideo.autoplay = true;
            document.body.appendChild(remoteVideo);
        };
    };

    return (
        <div>
            <button onClick={startStreaming}>Start Streaming</button>
            <video ref={videoRef} autoPlay playsInline />
        </div>
    );
};

export default WebRTCClient;