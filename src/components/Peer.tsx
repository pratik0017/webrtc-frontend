import { useEffect, useRef, useState } from "react";

export default function Peer() {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [connected, setConnected] = useState(false);

    const SIGNAL_SERVER = "ws://localhost:8080";

    useEffect(() => {
        socketRef.current = new WebSocket(SIGNAL_SERVER);

        socketRef.current.onopen = () => {
            console.log("[WebSocket] Connected to signaling server");
        };

        socketRef.current.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            console.log("[WebSocket] Message received:", msg);

            switch (msg.type) {
                case "createOffer":
                    await handleOffer(msg.sdp);
                    break;
                case "createAnswer":
                    await handleAnswer(msg.sdp);
                    break;
                case "iceCandidate":
                    if (pcRef.current && msg.candidate) {
                        try {
                            await pcRef.current.addIceCandidate(msg.candidate);
                        } catch (err) {
                            console.error("Error adding ICE candidate:", err);
                        }
                    }
                    break;
            }
        };

        return () => {
            socketRef.current?.close();
        };
    }, []);

    const startMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            setupPeerConnection();
            stream.getTracks().forEach((track) => {
                pcRef.current?.addTrack(track, stream);
            });

            const offer = await pcRef.current?.createOffer();
            await pcRef.current?.setLocalDescription(offer!);

            socketRef.current?.send(JSON.stringify({ type: "createOffer", sdp: offer }));
            setConnected(true);
        } catch (err) {
            console.error("Error accessing media devices:", err);
        }
    };

    const setupPeerConnection = () => {
        pcRef.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        pcRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
            }
        };

        pcRef.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
    };

    const handleOffer = async (sdp: string) => {
        if (!pcRef.current) setupPeerConnection();

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        stream.getTracks().forEach((track) => {
            pcRef.current?.addTrack(track, stream);
        });

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        await pcRef.current?.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
        const answer = await pcRef.current?.createAnswer();
        await pcRef.current?.setLocalDescription(answer!);

        socketRef.current?.send(JSON.stringify({ type: "createAnswer", sdp: answer }));
        setConnected(true);
    };

    const handleAnswer = async (sdp: string) => {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
    };

    const toggleAudio = () => {
        const enabled = !audioEnabled;
        setAudioEnabled(enabled);
        localStreamRef.current?.getAudioTracks().forEach(track => (track.enabled = enabled));
    };

    const toggleVideo = () => {
        const enabled = !videoEnabled;
        setVideoEnabled(enabled);
        localStreamRef.current?.getVideoTracks().forEach(track => (track.enabled = enabled));
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">WebRTC Duplex Peer</h2>

            <div className="flex space-x-4">
                <div>
                    <h3 className="font-semibold">Local Stream</h3>
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-64 h-48 bg-black" />
                </div>

                <div>
                    <h3 className="font-semibold">Remote Stream</h3>
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-64 h-48 bg-black" />
                </div>
            </div>

            <div className="space-x-2">
                <button
                    onClick={startMedia}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    disabled={connected}
                >
                    Start Media
                </button>

                <button
                    onClick={toggleAudio}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                    disabled={!connected}
                >
                    {audioEnabled ? "Mute Audio" : "Unmute Audio"}
                </button>

                <button
                    onClick={toggleVideo}
                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                    disabled={!connected}
                >
                    {videoEnabled ? "Stop Video" : "Start Video"}
                </button>
            </div>
        </div>
    );
}
