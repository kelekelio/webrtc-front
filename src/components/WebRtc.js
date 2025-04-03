import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';

const WebRTCStreamer = () => {
    const streamRef = useRef(null);

    useEffect(() => {
        const startStreaming = async () => {
            try {
                // Capture video and audio from the device's camera and microphone
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                // Set up the WebRTC stream with Cloudflare's WHIP URL
                const whipUrl = 'https://';

                // Start streaming to Cloudflare
                streamRef.current.publish(whipUrl, mediaStream);

                // Display the local stream (optional)
                const videoElement = document.getElementById('local-video');
                videoElement.srcObject = mediaStream;

            } catch (error) {
                console.error('Error setting up WebRTC stream:', error);
            }
        };

        startStreaming();

        // Clean up on unmount
        return () => {
            if (streamRef.current) {
                streamRef.current.stop();
            }
        };
    }, []);

    return (
        <View>
            <Text>WebRTC Stream to Cloudflare</Text>
            <video
                id="local-video"
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: 200 }}
            />
        </View>
    );
};

export default WebRTCStreamer;