import { createRoot } from 'react-dom/client'

import App from './App'

import './index.css'

createRoot(document.getElementById('root')).render(<App />)

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.ready.then(registration => registration.unregister())
}
