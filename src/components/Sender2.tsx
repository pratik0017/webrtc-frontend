import { useState, useEffect, useRef } from "react";

export function Sender2() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const ws = new WebSocket("ws://13.233.173.144:8080");
        setSocket(ws);

        ws.onopen = () => {
            console.log("[Sender] WebSocket connected");
            ws.send(JSON.stringify({ type: "sender" }));
        };

        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            const pc = pcRef.current;
            if (!pc) return;

            if (data.type === "createAnswer") {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                console.log("[Sender] Remote description set");
            } else if (data.type === "iceCandidate") {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                console.log("[Sender] ICE candidate added");
            }
        };
    }, []);

    async function startConnection(stream: MediaStream) {
        if (!socket) return;

        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: event.candidate.toJSON()
                }));
            }
        };

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            pc.onicegatheringstatechange = () => {
                if (pc.iceGatheringState === "complete") {
                    socket?.send(JSON.stringify({
                        type: "createOffer",
                        sdp: pc.localDescription?.toJSON()
                    }));
                    console.log("[Sender] Offer sent");
                }
            };
        };

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }

    async function startWebcam() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        startConnection(stream);
    }

    async function startScreenShare() {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        startConnection(stream);
    }

    return (
        <div>
            <h2>Sender</h2>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                controls
                style={{ width: "300px", background: "#000" }}
            />
            <br />
            <button onClick={startWebcam}>Start Webcam</button>
            <button onClick={startScreenShare} style={{ marginLeft: "10px" }}>
                Start Screen Share
            </button>
        </div>
    );
}
