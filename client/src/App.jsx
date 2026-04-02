import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import Dashboard from './components/Dashboard'

const SERVER_URL = 'http://localhost:5000'

function App() {
  const [simulationState, setSimulationState] = useState(null)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const newSocket = io(SERVER_URL)
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to Simulation Engine')
    })

    newSocket.on('tick', (state) => {
      setSimulationState(state)
    })

    return () => newSocket.close()
  }, [])

  if (!simulationState) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-bg-base text-brand-green">
        <p className="font-mono text-xl animate-pulse">Initializing Comm Link...</p>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-base text-gray-200 font-sans">
      <Dashboard state={simulationState} socket={socket} />
    </div>
  )
}

export default App
