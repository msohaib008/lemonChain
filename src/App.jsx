import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ThreeScene from './ThreeScene'
import { Center } from '@react-three/drei'
function App() {

  return (
    <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
      <ThreeScene/>
    </div>
  )
}

export default App
