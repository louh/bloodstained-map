import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

it('renders without crashing', () => {
  const div = document.createElement('div')
  document.body.appendChild(div)
  ReactDOM.render(<App />, div)
  expect(div.querySelector('#map')).not.toBeNull()
  expect(window.map).toBeDefined()
  ReactDOM.unmountComponentAtNode(div)
  div.remove()
})
