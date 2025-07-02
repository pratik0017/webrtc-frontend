// import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sender } from './components/Sender'
import { Receiver } from './components/Receiver'
import { Sender2 } from './components/Sender2'
import { DuplexPeer } from './components/DuplexPeer'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sender" element={<Sender />} />
        <Route path="/sender2" element={<Sender2 />} />
        <Route path="/receiver" element={<Receiver />} />
        <Route path="/duplex" element={<DuplexPeer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
