import { useEffect, useRef, useState } from "react";

export function DuplexPeer() {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    const [role, setRole] = useState<"sender" | "receiver" | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        socketRef.current = socket;

        const chosenRole = window.confirm("Are you the sender? (OK = Sender, Cancel = Receiver)") ? "sender" : "receiver";
        setRole(chosenRole);

        socket.onopen = () => {
            console.log(`[${chosenRole}] WebSocket connected`);
            socket.send(JSON.stringify({ type: chosenRole }));
        };

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "createOffer" && chosenRole === "receiver") {
                console.log("[Receiver] Offer received");
                const pc = new RTCPeerConnection();
                pcRef.current = pc;

                setupCommonPCEvents(pc, socket);

                pc.ontrack = handleRemoteTrack;

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

                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            }

            if (message.type === "createAnswer" && chosenRole === "sender") {
                console.log("[Sender] Answer received");
                await pcRef.current?.setRemoteDescription(new RTCSessionDescription(message.sdp));
            }

            if (message.type === "iceCandidate") {
                console.log("[Peer] ICE candidate received");
                await pcRef.current?.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
        };
    }, []);

    async function startSendingVideo() {
        if (role !== "sender" || !socketRef.current) return;

        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        setupCommonPCEvents(pc, socketRef.current);
        pc.ontrack = handleRemoteTrack;

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        pc.onnegotiationneeded = async () => {
            console.log("[Sender] Creating offer");
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketRef.current?.send(JSON.stringify({ type: "createOffer", sdp: pc.localDescription }));
        };
    }

    function setupCommonPCEvents(pc: RTCPeerConnection, socket: WebSocket) {
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: event.candidate.toJSON()
                }));
            }
        };
    }

    function handleRemoteTrack(event: RTCTrackEvent) {
        console.log("[Peer] Remote track received:", event.track.kind);
        if (remoteVideoRef.current) {
            if (!remoteVideoRef.current.srcObject) {
                remoteVideoRef.current.srcObject = new MediaStream();
            }
            (remoteVideoRef.current.srcObject as MediaStream).addTrack(event.track);
        }
    }

    return (
        <div>
            <h2>WebRTC Duplex Peer ({role})</h2>
            {role === "sender" && (
                <button onClick={startSendingVideo}>Start Sending Video</button>
            )}
            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                <div>
                    <h4>Local Video</h4>
                    <video ref={localVideoRef} autoPlay muted playsInline controls style={{ width: "300px", background: "#000" }} />
                </div>
                <div>
                    <h4>Remote Video</h4>
                    <video ref={remoteVideoRef} autoPlay playsInline controls style={{ width: "300px", background: "#000" }} />
                </div>
            </div>
        </div>
    );
}
