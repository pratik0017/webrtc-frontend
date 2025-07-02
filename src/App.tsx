// import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sender } from './components/Sender'
import { Receiver } from './components/Receiver'
import { Sender2 } from './components/Sender2'
import { DuplexPeer } from './components/DuplexPeer'
import Peer from './components/Peer'
import WebRTCClient from './components/WebRTCClient'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sender" element={<Sender />} />
        <Route path="/sender2" element={<Sender2 />} />
        <Route path="/receiver" element={<Receiver />} />
        <Route path="/duplex" element={<DuplexPeer />} />
        <Route path="/peer" element={<Peer />} />
        <Route path="/webrtc" element={<WebRTCClient />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
