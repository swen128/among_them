import './style.css'
import Chat from './components/Chat'

function App() {

  return (
    <>
      <div className="App h-screen flex items-center justify-center">
        <div className="w-full max-w-md h-96 border p-4 bg-white shadow-lg rounded">
          <Chat />
        </div>
      </div>
    </>
  )
}

export default App
