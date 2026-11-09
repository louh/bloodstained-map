import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(<App />)

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.ready.then(registration => registration.unregister())
}
