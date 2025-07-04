// import React, { useEffect, useRef, useState, useCallback } from "react";

// // --- SVG Icons for UI Controls ---
// const MicOnIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
//         <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
//         <line x1="12" x2="12" y1="19" y2="22"></line>
//     </svg>
// );

// const MicOffIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <line x1="12" y1="1" x2="12" y2="5"></line>
//         <path d="M17 8A5 5 0 0 0 7 8"></path>
//         <path d="M12 18v4"></path>
//         <path d="M21 12h-2"></path>
//         <path d="M7 12H5"></path>
//         <path d="m4.2 4.2 1.4 1.4"></path>
//         <path d="M18.4 18.4 17 17"></path>
//         <path d="m4.2 19.8 1.4-1.4"></path>
//         <path d="M18.4 5.6 17 7"></path>
//         <line x1="1" y1="1" x2="23" y2="23"></line>
//     </svg>
// );

// const VideoOnIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="m22 8-6 4 6 4V8Z"></path>
//         <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
//     </svg>
// );

// const VideoOffIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M14.5 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V12"></path>
//         <path d="m22 8-6 4 6 4V8Z"></path>
//         <line x1="1" y1="1" x2="23" y2="23"></line>
//     </svg>
// );

// const PhoneOffIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 4.1 1.11 2 2 0 0 1 1.44 2.16l-2.13 6.39a2 2 0 0 1-2.16 1.44 16 16 0 0 1-16-16 2 2 0 0 1 1.44-2.16l6.39-2.13a2 2 0 0 1 2.16 1.44 12.84 12.84 0 0 0 1.11 4.1 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
//         <line x1="22" y1="2" x2="2" y2="22"></line>
//     </svg>
// );

// // --- Main App Component ---
// export default function WebRTCClient() {
//     // State variables
//     const [roomId, setRoomId] = useState("");
//     const [isInRoom, setIsInRoom] = useState(false);
//     const [audioEnabled, setAudioEnabled] = useState(true);
//     const [videoEnabled, setVideoEnabled] = useState(true);
//     const [isConnecting, setIsConnecting] = useState(false);
//     const [peerConnected, setPeerConnected] = useState(false);

//     // Refs for DOM elements and WebRTC objects
//     const localVideoRef = useRef<HTMLVideoElement>(null);
//     const remoteVideoRef = useRef<HTMLVideoElement>(null);
//     const pcRef = useRef<RTCPeerConnection | null>(null);
//     const socketRef = useRef<WebSocket | null>(null);
//     const localStreamRef = useRef<MediaStream | null>(null);

//     const SIGNAL_SERVER_URL = "ws://65.0.17.158:8080";
//     const STUN_SERVER_URL = "stun:stun.l.google.com:19302";

//     // --- Signaling Logic ---
//     const sendMessage = (message: object) => {
//         if (socketRef.current?.readyState === WebSocket.OPEN) {
//             socketRef.current.send(JSON.stringify(message));
//         }
//     };

//     // --- WebRTC Setup ---
//     const setupPeerConnection = useCallback(() => {
//         if (pcRef.current) return;

//         pcRef.current = new RTCPeerConnection({
//             iceServers: [{ urls: STUN_SERVER_URL }]
//         });

//         pcRef.current.onicecandidate = (event) => {
//             if (event.candidate) {
//                 sendMessage({ type: "iceCandidate", candidate: event.candidate });
//             }
//         };

//         pcRef.current.ontrack = (event) => {
//             if (remoteVideoRef.current && event.streams && event.streams[0]) {
//                 remoteVideoRef.current.srcObject = event.streams[0];
//                 setPeerConnected(true);
//             }
//         };
        
//         pcRef.current.onconnectionstatechange = () => {
//             if (pcRef.current?.connectionState === 'disconnected' || pcRef.current?.connectionState === 'failed') {
//                 setPeerConnected(false);
//                 console.log("Peer disconnected.");
//                 // Optionally, try to restart ICE
//                 // pcRef.current.restartIce();
//             }
//         };

//         if (localStreamRef.current) {
//             localStreamRef.current.getTracks().forEach((track) => {
//                 pcRef.current?.addTrack(track, localStreamRef.current!);
//             });
//         }
//     }, []);

//     // --- Media Handling ---
//     const startLocalMedia = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//             localStreamRef.current = stream;
//             if (localVideoRef.current) {
//                 localVideoRef.current.srcObject = stream;
//             }
//             return stream;
//         } catch (error) {
//             console.error("Error accessing media devices:", error);
//             alert("Could not access camera and microphone. Please check permissions.");
//             return null;
//         }
//     };

//     // --- Call Lifecycle Handlers ---
//     const handleOffer = async (sdp: string) => {
//         if (!localStreamRef.current) {
//             await startLocalMedia();
//         }
//         setupPeerConnection();
//         await pcRef.current?.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
//         const answer = await pcRef.current?.createAnswer();
//         await pcRef.current?.setLocalDescription(answer);
//         sendMessage({ type: "createAnswer", sdp: answer?.sdp });
//     };

//     const handleAnswer = async (sdp: string) => {
//         await pcRef.current?.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
//     };

//     const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
//         if (pcRef.current) {
//             await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//     };

//     // --- Main Actions ---
//     const handleJoinRoom = async () => {
//         if (!roomId.trim()) {
//             alert("Please enter a Room ID.");
//             return;
//         }
//         setIsConnecting(true);

//         const stream = await startLocalMedia();
//         if (!stream) {
//             setIsConnecting(false);
//             return;
//         }

//         socketRef.current = new WebSocket(SIGNAL_SERVER_URL);

//         socketRef.current.onopen = () => {
//             console.log("[WebSocket] Connected to signaling server");
//             sendMessage({ type: "joinRoom", roomId });
//             setIsInRoom(true);
//             setIsConnecting(false);
//         };

//         socketRef.current.onmessage = async (event) => {
//             const msg = JSON.parse(event.data);
//             console.log("[WebSocket] Message received:", msg);

//             switch (msg.type) {
//                 case "createOffer":
//                     // This is received by the second peer who joins
//                     await handleOffer(msg.sdp);
//                     break;
//                 case "createAnswer":
//                     // This is received by the original initiator
//                     await handleAnswer(msg.sdp);
//                     break;
//                 case "iceCandidate":
//                     await handleIceCandidate(msg.candidate);
//                     break;
//                 case "error":
//                     console.error("Signaling error:", msg.message);
//                     alert(`Error from server: ${msg.message}`);
//                     break;
//             }
//         };

//         socketRef.current.onclose = () => {
//             console.log("[WebSocket] Disconnected from signaling server");
//             handleLeaveRoom();
//         };
        
//         socketRef.current.onerror = (error) => {
//             console.error("[WebSocket] Error:", error);
//             alert("Failed to connect to the signaling server.");
//             setIsConnecting(false);
//             setIsInRoom(false);
//         };
//     };
    
//     // This is called by the first person in the room to initiate the call
//     const createOffer = async () => {
//         setupPeerConnection();
//         const offer = await pcRef.current?.createOffer();
//         await pcRef.current?.setLocalDescription(offer);
//         sendMessage({ type: "createOffer", sdp: offer?.sdp });
//     };

//     const handleLeaveRoom = () => {
//         // Stop media tracks
//         localStreamRef.current?.getTracks().forEach(track => track.stop());
//         localStreamRef.current = null;
//         if (localVideoRef.current) localVideoRef.current.srcObject = null;
//         if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//         // Close peer connection
//         pcRef.current?.close();
//         pcRef.current = null;
        
//         // Close WebSocket
//         socketRef.current?.close();
//         socketRef.current = null;

//         // Reset state
//         setIsInRoom(false);
//         setPeerConnected(false);
//         setRoomId("");
//     };

//     // --- UI Controls ---
//     const toggleAudio = () => {
//         const enabled = !audioEnabled;
//         setAudioEnabled(enabled);
//         localStreamRef.current?.getAudioTracks().forEach(track => track.enabled = enabled);
//     };

//     const toggleVideo = () => {
//         const enabled = !videoEnabled;
//         setVideoEnabled(enabled);
//         localStreamRef.current?.getVideoTracks().forEach(track => track.enabled = enabled);
//     };
    
//     useEffect(() => {
//         // Cleanup on component unmount
//         return () => {
//             if (isInRoom) {
//                 handleLeaveRoom();
//             }
//         };
//     }, [isInRoom]);

//     // --- Render Logic ---
//     if (!isInRoom) {
//         return (
//             <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center font-sans">
//                 <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
//                     <h1 className="text-3xl font-bold mb-2">WebRTC Video Chat</h1>
//                     <p className="text-gray-400 mb-6">Enter a room ID to join or create a call.</p>
//                     <div className="space-y-4">
//                         <input
//                             type="text"
//                             value={roomId}
//                             onChange={(e) => setRoomId(e.target.value)}
//                             placeholder="Enter Room ID"
//                             className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                         />
//                         <button
//                             onClick={handleJoinRoom}
//                             disabled={isConnecting || !roomId}
//                             className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
//                         >
//                             {isConnecting ? (
//                                 <>
//                                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                     Connecting...
//                                 </>
//                             ) : "Join Room"}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
//              <div className="absolute top-4 left-4 bg-gray-800 px-4 py-2 rounded-lg text-sm">
//                 Room ID: <span className="font-bold text-blue-400">{roomId}</span>
//             </div>
//             <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
//                 <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
//                 <video ref={localVideoRef} autoPlay playsInline muted className="absolute w-1/4 max-w-[250px] bottom-4 right-4 rounded-xl border-2 border-gray-700 shadow-lg" />
//                  {!peerConnected && (
//                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
//                         <p className="text-2xl mb-4">Waiting for another person to join...</p>
//                         <button onClick={createOffer} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition">
//                             Call Peer
//                         </button>
//                         <p className="text-sm mt-2 text-gray-400">(Click this if you are the first person in the room)</p>
//                     </div>
//                 )}
//             </div>
//             <div className="mt-6 flex items-center space-x-4">
//                 <button onClick={toggleAudio} className={`p-3 rounded-full transition ${audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}>
//                     {audioEnabled ? <MicOnIcon /> : <MicOffIcon />}
//                 </button>
//                 <button onClick={toggleVideo} className={`p-3 rounded-full transition ${videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}>
//                     {videoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
//                 </button>
//                 <button onClick={handleLeaveRoom} className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition">
//                     <PhoneOffIcon />
//                 </button>
//             </div>
//         </div>
//     );
// }

















// import React, { useEffect, useRef, useState, useCallback } from "react";

// // --- SVG Icons for UI Controls ---
// const MicOnIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
//         <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
//         <line x1="12" x2="12" y1="19" y2="22"></line>
//     </svg>
// );

// const MicOffIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <line x1="12" y1="1" x2="12" y2="5"></line>
//         <path d="M17 8A5 5 0 0 0 7 8"></path>
//         <path d="M12 18v4"></path>
//         <path d="M21 12h-2"></path>
//         <path d="M7 12H5"></path>
//         <path d="m4.2 4.2 1.4 1.4"></path>
//         <path d="M18.4 18.4 17 17"></path>
//         <path d="m4.2 19.8 1.4-1.4"></path>
//         <path d="M18.4 5.6 17 7"></path>
//         <line x1="1" y1="1" x2="23" y2="23"></line>
//     </svg>
// );

// const VideoOnIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="m22 8-6 4 6 4V8Z"></path>
//         <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
//     </svg>
// );

// const VideoOffIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M14.5 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V12"></path>
//         <path d="m22 8-6 4 6 4V8Z"></path>
//         <line x1="1" y1="1" x2="23" y2="23"></line>
//     </svg>
// );

// const PhoneOffIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 4.1 1.11 2 2 0 0 1 1.44 2.16l-2.13 6.39a2 2 0 0 1-2.16 1.44 16 16 0 0 1-16-16 2 2 0 0 1 1.44-2.16l6.39-2.13a2 2 0 0 1 2.16 1.44 12.84 12.84 0 0 0 1.11 4.1 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
//         <line x1="22" y1="2" x2="2" y2="22"></line>
//     </svg>
// );

// // --- Main App Component ---
// export default function WebRTCClient() {
//     // State variables
//     const [roomId, setRoomId] = useState("");
//     const [isInRoom, setIsInRoom] = useState(false);
//     const [audioEnabled, setAudioEnabled] = useState(true);
//     const [videoEnabled, setVideoEnabled] = useState(true);
//     const [isConnecting, setIsConnecting] = useState(false);
//     const [peerConnected, setPeerConnected] = useState(false);

//     // Refs for DOM elements and WebRTC objects
//     const localVideoRef = useRef<HTMLVideoElement>(null);
//     const remoteVideoRef = useRef<HTMLVideoElement>(null);
//     const pcRef = useRef<RTCPeerConnection | null>(null);
//     const socketRef = useRef<WebSocket | null>(null);
//     const localStreamRef = useRef<MediaStream | null>(null);

//     const SIGNAL_SERVER_URL = "ws://13.235.132.45:8080";
//     const STUN_SERVER_URL = "stun:stun.l.google.com:19302";

//     // --- Signaling Logic ---
//     const sendMessage = (message: object) => {
//         if (socketRef.current?.readyState === WebSocket.OPEN) {
//             socketRef.current.send(JSON.stringify(message));
//         }
//     };

//     // --- WebRTC Setup ---
//     const setupPeerConnection = useCallback(() => {
//         if (pcRef.current) return;

//         pcRef.current = new RTCPeerConnection({
//             iceServers: [{ urls: STUN_SERVER_URL }]
//         });

//         pcRef.current.onicecandidate = (event) => {
//             if (event.candidate) {
//                 sendMessage({ type: "iceCandidate", candidate: event.candidate });
//             }
//         };

//         pcRef.current.ontrack = (event) => {
//             if (remoteVideoRef.current && event.streams && event.streams[0]) {
//                 remoteVideoRef.current.srcObject = event.streams[0];
//                 setPeerConnected(true);
//             }
//         };
        
//         pcRef.current.onconnectionstatechange = () => {
//             if (pcRef.current?.connectionState === 'disconnected' || pcRef.current?.connectionState === 'failed') {
//                 setPeerConnected(false);
//                 console.log("Peer disconnected.");
//                 // Optionally, try to restart ICE
//                 // pcRef.current.restartIce();
//             }
//         };

//         if (localStreamRef.current) {
//             localStreamRef.current.getTracks().forEach((track) => {
//                 pcRef.current?.addTrack(track, localStreamRef.current!);
//             });
//         }
//     }, []);

//     // --- Media Handling ---
//     const startLocalMedia = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//             localStreamRef.current = stream;
//             if (localVideoRef.current) {
//                 localVideoRef.current.srcObject = stream;
//             }
//             return stream;
//         } catch (error) {
//             console.error("Error accessing media devices:", error);
//             alert("Could not access camera and microphone. Please check permissions.");
//             return null;
//         }
//     };

//     // --- Call Lifecycle Handlers ---
//     const handleOffer = async (sdp: string) => {
//         if (!localStreamRef.current) {
//             await startLocalMedia();
//         }
//         setupPeerConnection();
//         await pcRef.current?.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
//         const answer = await pcRef.current?.createAnswer();
//         await pcRef.current?.setLocalDescription(answer);
//         sendMessage({ type: "createAnswer", sdp: answer?.sdp });
//     };

//     const handleAnswer = async (sdp: string) => {
//         await pcRef.current?.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
//     };

//     const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
//         if (pcRef.current) {
//             await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//     };

//     // --- Main Actions ---
//     const handleJoinRoom = async () => {
//         if (!roomId.trim()) {
//             alert("Please enter a Room ID.");
//             return;
//         }
//         setIsConnecting(true);

//         const stream = await startLocalMedia();
//         if (!stream) {
//             setIsConnecting(false);
//             return;
//         }

//         socketRef.current = new WebSocket(SIGNAL_SERVER_URL);

//         socketRef.current.onopen = () => {
//             console.log("[WebSocket] Connected to signaling server");
//             sendMessage({ type: "joinRoom", roomId });
//             setIsInRoom(true);
//             setIsConnecting(false);
//         };

//         socketRef.current.onmessage = async (event) => {
//             const msg = JSON.parse(event.data);
//             console.log("[WebSocket] Message received:", msg);

//             switch (msg.type) {
//                 case "createOffer":
//                     // This is received by the second peer who joins
//                     await handleOffer(msg.sdp);
//                     break;
//                 case "createAnswer":
//                     // This is received by the original initiator
//                     await handleAnswer(msg.sdp);
//                     break;
//                 case "iceCandidate":
//                     await handleIceCandidate(msg.candidate);
//                     break;
//                 case "error":
//                     console.error("Signaling error:", msg.message);
//                     alert(`Error from server: ${msg.message}`);
//                     break;
//             }
//         };

//         socketRef.current.onclose = () => {
//             console.log("[WebSocket] Disconnected from signaling server");
//             handleLeaveRoom();
//         };
        
//         socketRef.current.onerror = (error) => {
//             console.error("[WebSocket] Error:", error);
//             alert("Failed to connect to the signaling server.");
//             setIsConnecting(false);
//             setIsInRoom(false);
//         };
//     };
    
//     // This is called by the first person in the room to initiate the call
//     const createOffer = async () => {
//         setupPeerConnection();
//         const offer = await pcRef.current?.createOffer();
//         await pcRef.current?.setLocalDescription(offer);
//         sendMessage({ type: "createOffer", sdp: offer?.sdp });
//     };

//     const handleLeaveRoom = () => {
//         // Stop media tracks
//         localStreamRef.current?.getTracks().forEach(track => track.stop());
//         localStreamRef.current = null;
//         if (localVideoRef.current) localVideoRef.current.srcObject = null;
//         if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//         // Close peer connection
//         pcRef.current?.close();
//         pcRef.current = null;
        
//         // Close WebSocket
//         socketRef.current?.close();
//         socketRef.current = null;

//         // Reset state
//         setIsInRoom(false);
//         setPeerConnected(false);
//         setRoomId("");
//     };

//     // --- UI Controls ---
//     const toggleAudio = () => {
//         const enabled = !audioEnabled;
//         setAudioEnabled(enabled);
//         localStreamRef.current?.getAudioTracks().forEach(track => track.enabled = enabled);
//     };

//     const toggleVideo = () => {
//         const enabled = !videoEnabled;
//         setVideoEnabled(enabled);
//         localStreamRef.current?.getVideoTracks().forEach(track => track.enabled = enabled);
//     };
    
//     useEffect(() => {
//         // Cleanup on component unmount
//         return () => {
//             if (isInRoom) {
//                 handleLeaveRoom();
//             }
//         };
//     }, [isInRoom]);

//     // --- Render Logic ---
//     if (!isInRoom) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
//                 {/* Background Elements */}
//                 <div className="absolute inset-0 overflow-hidden">
//                     <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
//                     <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
//                     <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
//                 </div>
                
//                 {/* Main Content */}
//                 <div className="relative z-10 w-full max-w-lg">
//                     <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
//                         {/* Header */}
//                         <div className="text-center mb-8">
//                             <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
//                                 <VideoOnIcon />
//                             </div>
//                             <h1 className="text-3xl font-bold text-white mb-2">WebRTC Video Chat</h1>
//                             <p className="text-slate-300">Connect with others through secure video calls</p>
//                         </div>

//                         {/* Form */}
//                         <div className="space-y-6">
//                             <div className="relative">
//                                 <input
//                                     type="text"
//                                     value={roomId}
//                                     onChange={(e) => setRoomId(e.target.value)}
//                                     placeholder="Enter Room ID"
//                                     className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
//                                 />
//                                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none"></div>
//                             </div>
                            
//                             <button
//                                 onClick={handleJoinRoom}
//                                 disabled={isConnecting || !roomId}
//                                 className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
//                             >
//                                 {isConnecting ? (
//                                     <>
//                                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                                         <span>Connecting...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <VideoOnIcon />
//                                         <span>Join Room</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>

//                         {/* Footer */}
//                         <div className="mt-8 text-center">
//                             <p className="text-slate-400 text-sm">
//                                 Enter a room ID to join or create a new video call
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
//             {/* Header */}
//             <header className="relative z-20 flex items-center justify-between p-6">
//                 <div className="flex items-center space-x-4">
//                     <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
//                         <VideoOnIcon />
//                     </div>
//                     <div>
//                         <h1 className="text-xl font-bold text-white">Video Call</h1>
//                         <p className="text-slate-400 text-sm">Room: <span className="text-blue-400 font-medium">{roomId}</span></p>
//                     </div>
//                 </div>
                
//                 <div className="flex items-center space-x-2">
//                     <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
//                         peerConnected 
//                             ? 'bg-green-500/20 text-green-400' 
//                             : 'bg-yellow-500/20 text-yellow-400'
//                     }`}>
//                         <div className={`w-2 h-2 rounded-full ${
//                             peerConnected ? 'bg-green-400' : 'bg-yellow-400'
//                         } animate-pulse`}></div>
//                         <span>{peerConnected ? 'Connected' : 'Waiting'}</span>
//                     </div>
//                 </div>
//             </header>

//             {/* Main Video Area */}
//             <div className="flex-1 flex items-center justify-center p-6">
//                 <div className="relative w-full max-w-6xl aspect-video">
//                     <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
//                         <video 
//                             ref={remoteVideoRef} 
//                             autoPlay 
//                             playsInline 
//                             className="w-full h-full object-cover" 
//                         />
                        
//                         {/* Local Video */}
//                         <div className="absolute bottom-6 right-6 w-64 h-48 bg-black/50 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden shadow-lg">
//                             <video 
//                                 ref={localVideoRef} 
//                                 autoPlay 
//                                 playsInline 
//                                 muted 
//                                 className="w-full h-full object-cover" 
//                             />
//                             <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
//                                 You
//                             </div>
//                         </div>
                        
//                         {/* Waiting State */}
//                         {!peerConnected && (
//                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
//                                 <div className="text-center space-y-6">
//                                     <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
//                                         <VideoOnIcon />
//                                     </div>
//                                     <div>
//                                         <h2 className="text-2xl font-bold text-white mb-2">Waiting for participant</h2>
//                                         <p className="text-slate-300 mb-6">Share your room ID with others to start the call</p>
//                                         <button 
//                                             onClick={createOffer} 
//                                             className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
//                                         >
//                                             Start Call
//                                         </button>
//                                         <p className="text-slate-400 text-sm mt-3">
//                                             Click this if you are the first person in the room
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Controls */}
//             <div className="relative z-20 flex items-center justify-center pb-8">
//                 <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
//                     <button 
//                         onClick={toggleAudio} 
//                         className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
//                             audioEnabled 
//                                 ? 'bg-slate-700/50 hover:bg-slate-600/50 text-white' 
//                                 : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
//                         }`}
//                         title={audioEnabled ? "Mute Audio" : "Unmute Audio"}
//                     >
//                         {audioEnabled ? <MicOnIcon /> : <MicOffIcon />}
//                     </button>
                    
//                     <button 
//                         onClick={toggleVideo} 
//                         className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
//                             videoEnabled 
//                                 ? 'bg-slate-700/50 hover:bg-slate-600/50 text-white' 
//                                 : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
//                         }`}
//                         title={videoEnabled ? "Turn Off Video" : "Turn On Video"}
//                     >
//                         {videoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
//                     </button>
                    
//                     <div className="w-px h-8 bg-white/20"></div>
                    
//                     <button 
//                         onClick={handleLeaveRoom} 
//                         className="p-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-300 transform hover:scale-105 active:scale-95"
//                         title="Leave Call"
//                     >
//                         <PhoneOffIcon />
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }



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

    const SIGNAL_SERVER_URL = "ws://13.235.132.45:8080";
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
                    await handleOffer(msg.sdp);
                    break;
                case "createAnswer":
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
    
    const createOffer = async () => {
        setupPeerConnection();
        const offer = await pcRef.current?.createOffer();
        await pcRef.current?.setLocalDescription(offer);
        sendMessage({ type: "createOffer", sdp: offer?.sdp });
    };

    const handleLeaveRoom = () => {
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

        pcRef.current?.close();
        pcRef.current = null;
        
        socketRef.current?.close();
        socketRef.current = null;

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
        return () => {
            if (isInRoom) {
                handleLeaveRoom();
            }
        };
    }, [isInRoom]);

    const styles = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            overflow: hidden;
        }

        .app-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .login-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 400px;
            width: 90%;
            animation: slideIn 0.6s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .login-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #ffffff, #a8edea);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .login-subtitle {
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 30px;
            font-size: 1.1rem;
        }

        .input-group {
            margin-bottom: 20px;
        }

        .room-input {
            width: 100%;
            padding: 15px 20px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .room-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }

        .room-input:focus {
            outline: none;
            border-color: #4facfe;
            box-shadow: 0 0 20px rgba(79, 172, 254, 0.3);
            transform: translateY(-2px);
        }

        .join-button {
            width: 100%;
            padding: 15px 20px;
            background: linear-gradient(45deg, #4facfe, #00f2fe);
            border: none;
            border-radius: 15px;
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            box-shadow: 0 10px 25px rgba(79, 172, 254, 0.3);
        }

        .join-button:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(79, 172, 254, 0.4);
        }

        .join-button:disabled {
            background: rgba(255, 255, 255, 0.2);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .video-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .remote-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            background: #1a1a1a;
        }

        .local-video {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 300px;
            height: 225px;
            border-radius: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            object-fit: cover;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
            transition: all 0.3s ease;
            z-index: 10;
        }

        .local-video:hover {
            transform: scale(1.05);
            border-color: #4facfe;
        }

        .room-info {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(15px);
            padding: 15px 25px;
            border-radius: 15px;
            color: white;
            font-size: 1rem;
            z-index: 10;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .room-id {
            color: #4facfe;
            font-weight: 700;
            margin-left: 8px;
        }

        .waiting-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 5;
        }

        .waiting-text {
            font-size: 2rem;
            margin-bottom: 30px;
            text-align: center;
            color: white;
        }

        .call-button {
            background: linear-gradient(45deg, #11998e, #38ef7d);
            border: none;
            padding: 15px 30px;
            border-radius: 50px;
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 10px 25px rgba(17, 153, 142, 0.3);
            margin-bottom: 15px;
        }

        .call-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(17, 153, 142, 0.4);
        }

        .call-hint {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
            text-align: center;
        }

        .controls {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 20px;
            z-index: 10;
        }

        .control-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }

        .control-button.active {
            background: rgba(255, 255, 255, 0.2);
        }

        .control-button.inactive {
            background: rgba(220, 38, 38, 0.9);
        }

        .control-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
        }

        .control-button.end-call {
            background: linear-gradient(45deg, #ff416c, #ff4757);
        }

        .control-button.end-call:hover {
            background: linear-gradient(45deg, #ff3838, #ff2f2f);
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .camera-placeholder {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: rgba(255, 255, 255, 0.3);
            font-size: 4rem;
            z-index: 1;
        }

        .local-camera-placeholder {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: rgba(255, 255, 255, 0.5);
            font-size: 2rem;
        }

        @media (max-width: 768px) {
            .local-video {
                width: 150px;
                height: 112px;
                top: 15px;
                right: 15px;
            }
            
            .room-info {
                top: 15px;
                left: 15px;
                padding: 10px 15px;
                font-size: 0.9rem;
            }
            
            .controls {
                bottom: 30px;
                gap: 15px;
            }
            
            .control-button {
                width: 50px;
                height: 50px;
            }
            
            .waiting-text {
                font-size: 1.5rem;
                padding: 0 20px;
            }
        }
    `;

    // --- Render Logic ---
    if (!isInRoom) {
        return (
            <div className="app-container">
                <style>{styles}</style>
                <div className="login-container">
                    <h1 className="login-title">VideoChat Pro</h1>
                    <p className="login-subtitle">Connect instantly with crystal-clear video calls</p>
                    <div className="input-group">
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="Enter Room ID"
                            className="room-input"
                        />
                    </div>
                    <button
                        onClick={handleJoinRoom}
                        disabled={isConnecting || !roomId}
                        className="join-button"
                    >
                        {isConnecting ? (
                            <>
                                <div className="spinner"></div>
                                Connecting...
                            </>
                        ) : "Join Room"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <style>{styles}</style>
            <div className="room-info">
                Room ID: <span className="room-id">{roomId}</span>
            </div>
            <div className="video-container">
                <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className="remote-video"
                />
                {!peerConnected && (
                    <div className="camera-placeholder">
                        📹
                    </div>
                )}
                <div style={{ position: 'relative' }}>
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="local-video"
                    />
                    {!videoEnabled && (
                        <div className="local-camera-placeholder">
                            📹
                        </div>
                    )}
                </div>
                {!peerConnected && (
                    <div className="waiting-overlay">
                        <p className="waiting-text">Waiting for another person to join...</p>
                        <button onClick={createOffer} className="call-button">
                            Start Call
                        </button>
                        <p className="call-hint">Click this if you are the first person in the room</p>
                    </div>
                )}
            </div>
            <div className="controls">
                <button 
                    onClick={toggleAudio} 
                    className={`control-button ${audioEnabled ? 'active' : 'inactive'}`}
                >
                    {audioEnabled ? <MicOnIcon /> : <MicOffIcon />}
                </button>
                <button 
                    onClick={toggleVideo} 
                    className={`control-button ${videoEnabled ? 'active' : 'inactive'}`}
                >
                    {videoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
                </button>
                <button 
                    onClick={handleLeaveRoom} 
                    className="control-button end-call"
                >
                    <PhoneOffIcon />
                </button>
            </div>
        </div>
    );
}