import React from 'react'
import Map from './components/Map'
import SearchBar from './components/SearchBar'
import InfoBox from './components/InfoBox'
import GitHubCorner from './components/GitHubCorner'
import './App.css'

function App() {
  return (
    <div className="app">
      <div className="left-pane">
        <div className="left-main">
          <img src="/logo_bloodstained_large.png" className="logo-img" alt="Bloodstained: Ritual of the Night" />
          <h3>Interactive map (Unofficial/Alpha)</h3>
          <SearchBar />
          <InfoBox />
        </div>
        <div className="notice">
          <h4>What’s this?</h4>
          <p>
            Ssearch this map for demons, items, shards, etc in <strong><em>Bloodstained: Ritual of the Night</em></strong> and it will tell you exactly where they're located. Still a work in progress. <a href="https://github.com/louh/bloodstained-map/" target="_blank" rel="noopener noreferrer">Help us improve the map!</a>
          </p>
          <p>
            <strong>Warning!</strong> Using this tool will reveal spoilers!
          </p>
        </div>
      </div>
      <div className="right-pane">
        <Map />
      </div>
      <GitHubCorner />
    </div>
  )
}

export default App
