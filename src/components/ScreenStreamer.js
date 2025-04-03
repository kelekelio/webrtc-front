import React, { useEffect, useRef } from 'react';
import { View, Text, Button } from 'react-native';
import { Whep } from 'react-native-whip-whep';

const WebRTCStreamer = () => {
    const streamRef = useRef(null); // To reference the WeRTC publisher instance
    const [streaming, setStreaming] = React.useState(false);

    useEffect(() => {
        // Setup WebRTC publisher instance
        streamRef.current = new Whep();

        return () => {
            // Cleanup on unmount
            if (streamRef.current) {
                streamRef.current.stop();
            }
        };
    }, []);

    const startStreaming = async () => {
        try {
            // Capture video and audio from the user's device
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            // Define the WHIP URL to Cloudflare Stream
            const whipUrl = 'https://live.cloudflare.com/whip/{STREAM_KEY}'; // Replace {STREAM_KEY} with your actual stream key

            // Start the WebRTC stream to Cloudflare
            await streamRef.current.publish(whipUrl, mediaStream);

            setStreaming(true);
            console.log('Streaming started');
        } catch (error) {
            console.error('Error starting stream:', error);
        }
    };

    const stopStreaming = () => {
        if (streamRef.current) {
            streamRef.current.stop();
            setStreaming(false);
            console.log('Streaming stopped');
        }
    };

    return (
        <View>
            <Text>WebRTC Stream to Cloudflare</Text>
            <Button
                title={streaming ? 'Stop Streaming' : 'Start Streaming'}
                onPress={streaming ? stopStreaming : startStreaming}
            />
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