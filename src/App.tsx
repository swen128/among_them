import './style.css'
import Game from './components/Game'
import { OpenAiChat } from './api/language_model'
import { useState } from 'react';

function App() {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || "")
  const llm = new OpenAiChat(apiKey);

  return (
    <>
      <div className="App h-screen flex flex-col items-center gap-4 p-4">
        <div>
          <input
            className="focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block appearance-none leading-normal"
            type="text"
            placeholder="Your OpenAI API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <Game languageModel={llm} />
      </div>
    </>
  )
}

export default App
