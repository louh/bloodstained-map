import React, { useState } from 'react'
import Map from './components/Map'
import SearchBar from './components/SearchBar'
import InfoBox from './components/InfoBox'
import GitHubCorner from './components/GitHubCorner'
import './App.css'

function App () {
  const [ state, setState ] = useState({ type: '', info: {} })

  return (
    <div className="app">
      <div className="left-pane">
        <div className="left-main">
          <img src="/logo_bloodstained_large.png" className="logo-img" alt="Bloodstained: Ritual of the Night" />
          <h3>Interactive map (ALPHA)</h3>
          <hr />
          <SearchBar onSelect={data => setState(data)} />
        </div>
        <div className="left-info">
          <InfoBox type={state.type} info={state.info} />
          <div className="notice">
            <h4>What’s this?</h4>
            <p>
              Search for anything in <strong><em>Bloodstained: Ritual of the Night</em></strong> and we’ll tell you exactly where it’s located (<em>Warning: spoilers!</em>). This is a work in progress. <a href="https://github.com/louh/bloodstained-map/" target="_blank" rel="noopener noreferrer">Help us improve the map!</a>
            </p>
          </div>
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
