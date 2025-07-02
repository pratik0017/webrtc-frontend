import React, { useEffect, useRef, useState, useCallback } from "react";

// --- SVG Icons for UI Controls ---
const MicOnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" x2="12" y1="19" y2="22"></line>
    </svg>
);

const MicOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="5"></line>
        <path d="M17 8A5 5 0 0 0 7 8"></path>
        <path d="M12 18v4"></path>
        <path d="M21 12h-2"></path>
        <path d="M7 12H5"></path>
        <path d="m4.2 4.2 1.4 1.4"></path>
        <path d="M18.4 18.4 17 17"></path>
        <path d="m4.2 19.8 1.4-1.4"></path>
        <path d="M18.4 5.6 17 7"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
);

const VideoOnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 8-6 4 6 4V8Z"></path>
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
    </svg>
);

const VideoOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V12"></path>
        <path d="m22 8-6 4 6 4V8Z"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
);

const PhoneOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 4.1 1.11 2 2 0 0 1 1.44 2.16l-2.13 6.39a2 2 0 0 1-2.16 1.44 16 16 0 0 1-16-16 2 2 0 0 1 1.44-2.16l6.39-2.13a2 2 0 0 1 2.16 1.44 12.84 12.84 0 0 0 1.11 4.1 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
        <line x1="22" y1="2" x2="2" y2="22"></line>
    </svg>
);

// --- Main App Component ---
export default function WebRTCClient() {
    // State variables
    const [roomId, setRoomId] = useState("");
    const [isInRoom, setIsInRoom] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [peerConnected, setPeerConnected] = useState(false);

    // Refs for DOM elements and WebRTC objects
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    const SIGNAL_SERVER_URL = "ws://localhost:8080";
    const STUN_SERVER_URL = "stun:stun.l.google.com:19302";

    // --- Signaling Logic ---
    const sendMessage = (message: object) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message));
        }
    };

    // --- WebRTC Setup ---
    const setupPeerConnection = useCallback(() => {
        if (pcRef.current) return;

        pcRef.current = new RTCPeerConnection({
            iceServers: [{ urls: STUN_SERVER_URL }]
        });

        pcRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                sendMessage({ type: "iceCandidate", candidate: event.candidate });
            }
        };

        pcRef.current.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setPeerConnected(true);
            }
        };
        
        pcRef.current.onconnectionstatechange = () => {
            if (pcRef.current?.connectionState === 'disconnected' || pcRef.current?.connectionState === 'failed') {
                setPeerConnected(false);
                console.log("Peer disconnected.");
                // Optionally, try to restart ICE
                // pcRef.current.restartIce();
            }
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pcRef.current?.addTrack(track, localStreamRef.current!);
            });
        }
    }, []);

    // --- Media Handling ---
    const startLocalMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (error) {
            console.error("Error accessing media devices:", error);
            alert("Could not access camera and microphone. Please check permissions.");
            return null;
        }
    };

    // --- Call Lifecycle Handlers ---
    const handleOffer = async (sdp: string) => {
        if (!localStreamRef.current) {
            await startLocalMedia();
        }
        setupPeerConnection();
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
        const answer = await pcRef.current?.createAnswer();
        await pcRef.current?.setLocalDescription(answer);
        sendMessage({ type: "createAnswer", sdp: answer?.sdp });
    };

    const handleAnswer = async (sdp: string) => {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
    };

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
        if (pcRef.current) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    // --- Main Actions ---
    const handleJoinRoom = async () => {
        if (!roomId.trim()) {
            alert("Please enter a Room ID.");
            return;
        }
        setIsConnecting(true);

        const stream = await startLocalMedia();
        if (!stream) {
            setIsConnecting(false);
            return;
        }

        socketRef.current = new WebSocket(SIGNAL_SERVER_URL);

        socketRef.current.onopen = () => {
            console.log("[WebSocket] Connected to signaling server");
            sendMessage({ type: "joinRoom", roomId });
            setIsInRoom(true);
            setIsConnecting(false);
        };

        socketRef.current.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            console.log("[WebSocket] Message received:", msg);

            switch (msg.type) {
                case "createOffer":
                    // This is received by the second peer who joins
                    await handleOffer(msg.sdp);
                    break;
                case "createAnswer":
                    // This is received by the original initiator
                    await handleAnswer(msg.sdp);
                    break;
                case "iceCandidate":
                    await handleIceCandidate(msg.candidate);
                    break;
                case "error":
                    console.error("Signaling error:", msg.message);
                    alert(`Error from server: ${msg.message}`);
                    break;
            }
        };

        socketRef.current.onclose = () => {
            console.log("[WebSocket] Disconnected from signaling server");
            handleLeaveRoom();
        };
        
        socketRef.current.onerror = (error) => {
            console.error("[WebSocket] Error:", error);
            alert("Failed to connect to the signaling server.");
            setIsConnecting(false);
            setIsInRoom(false);
        };
    };
    
    // This is called by the first person in the room to initiate the call
    const createOffer = async () => {
        setupPeerConnection();
        const offer = await pcRef.current?.createOffer();
        await pcRef.current?.setLocalDescription(offer);
        sendMessage({ type: "createOffer", sdp: offer?.sdp });
    };

    const handleLeaveRoom = () => {
        // Stop media tracks
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

        // Close peer connection
        pcRef.current?.close();
        pcRef.current = null;
        
        // Close WebSocket
        socketRef.current?.close();
        socketRef.current = null;

        // Reset state
        setIsInRoom(false);
        setPeerConnected(false);
        setRoomId("");
    };

    // --- UI Controls ---
    const toggleAudio = () => {
        const enabled = !audioEnabled;
        setAudioEnabled(enabled);
        localStreamRef.current?.getAudioTracks().forEach(track => track.enabled = enabled);
    };

    const toggleVideo = () => {
        const enabled = !videoEnabled;
        setVideoEnabled(enabled);
        localStreamRef.current?.getVideoTracks().forEach(track => track.enabled = enabled);
    };
    
    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            if (isInRoom) {
                handleLeaveRoom();
            }
        };
    }, [isInRoom]);

    // --- Render Logic ---
    if (!isInRoom) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center font-sans">
                <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                    <h1 className="text-3xl font-bold mb-2">WebRTC Video Chat</h1>
                    <p className="text-gray-400 mb-6">Enter a room ID to join or create a call.</p>
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="Enter Room ID"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        <button
                            onClick={handleJoinRoom}
                            disabled={isConnecting || !roomId}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isConnecting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Connecting...
                                </>
                            ) : "Join Room"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
             <div className="absolute top-4 left-4 bg-gray-800 px-4 py-2 rounded-lg text-sm">
                Room ID: <span className="font-bold text-blue-400">{roomId}</span>
            </div>
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <video ref={localVideoRef} autoPlay playsInline muted className="absolute w-1/4 max-w-[250px] bottom-4 right-4 rounded-xl border-2 border-gray-700 shadow-lg" />
                 {!peerConnected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
                        <p className="text-2xl mb-4">Waiting for another person to join...</p>
                        <button onClick={createOffer} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition">
                            Call Peer
                        </button>
                        <p className="text-sm mt-2 text-gray-400">(Click this if you are the first person in the room)</p>
                    </div>
                )}
            </div>
            <div className="mt-6 flex items-center space-x-4">
                <button onClick={toggleAudio} className={`p-3 rounded-full transition ${audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}>
                    {audioEnabled ? <MicOnIcon /> : <MicOffIcon />}
                </button>
                <button onClick={toggleVideo} className={`p-3 rounded-full transition ${videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}>
                    {videoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
                </button>
                <button onClick={handleLeaveRoom} className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition">
                    <PhoneOffIcon />
                </button>
            </div>
        </div>
    );
}
