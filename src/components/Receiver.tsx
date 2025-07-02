import { useEffect, useRef } from "react";

export function Receiver() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://13.233.173.144:8080");

        socket.onopen = () => {
            console.log("[Receiver] WebSocket connected");
            socket.send(JSON.stringify({ type: "receiver" }));
        };

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "createOffer") {
                console.log("[Receiver] Offer received");
                const pc = new RTCPeerConnection();
                pcRef.current = pc;

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.send(JSON.stringify({
                            type: "iceCandidate",
                            candidate: event.candidate.toJSON()
                        }));
                    }
                };

                pc.ontrack = (event) => {
                    console.log("[Receiver] ontrack fired with track:", event.track.kind);

                    if (videoRef.current) {
                        if (!videoRef.current.srcObject) {
                            videoRef.current.srcObject = new MediaStream();
                        }
                        (videoRef.current.srcObject as MediaStream).addTrack(event.track);

                        console.log("[Receiver] Track added to video element");
                    } else {
                        console.warn("[Receiver] videoRef is null when track arrives");
                    }
                };

                await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
                console.log("[Receiver] Remote description set");

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                pc.onicegatheringstatechange = () => {
                    if (pc.iceGatheringState === "complete") {
                        console.log("[Receiver] Sending answer to sender");
                        socket.send(JSON.stringify({
                            type: "createAnswer",
                            sdp: pc.localDescription?.toJSON()
                        }));
                    }
                };
            }

            else if (message.type === "iceCandidate") {
                const pc = pcRef.current;
                if (!pc) return;
                await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
                console.log("[Receiver] ICE candidate added");
            }
        };
    }, []);

    // Periodic check for video readiness
    useEffect(() => {
        const interval = setInterval(() => {
            const video = videoRef.current;
            if (video) {
                console.log(
                    `[Receiver] Video readyState: ${video.readyState}, Dimensions: ${video.videoWidth}x${video.videoHeight}`
                );
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h2>Receiver</h2>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                controls
                style={{ width: "100%", maxWidth: "600px", background: "#000" }}
            />
        </div>
    );
}
