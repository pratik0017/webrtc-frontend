import { useState, useEffect } from "react"

export function Sender() {

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://13.233.173.144:8080");
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: "sender"
            }))
        }

        
    },[]);

    async function startSendingVideo() {
        if(!socket) return;
        const pc = new RTCPeerConnection();
        pc.onnegotiationneeded = async () => {
            console.log('onnegotiationneeded');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({type: 'createOffer', sdp: pc.localDescription}));
        }

        pc.onicecandidate = (event) => {
            console.log(event);
            if(event.candidate) {
                socket?.send(JSON.stringify({type: 'iceCandidate', candidate: event.candidate }))
            }
        }


        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if(data.type === 'createAnswer') {
                pc.setRemoteDescription(data.sdp);
            } else if(data.type === 'iceCandidate'){
                pc.addIceCandidate(data.iceCandidate);
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false});
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    return (
        <div>
            <button onClick={startSendingVideo}>Send Video</button>
        </div>
    )
}