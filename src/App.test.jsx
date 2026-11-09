import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'

import App from './App'
import InfoBox from './components/InfoBox'
import { searchFilter } from './result'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

it('matches search terms without accents or ligatures', () => {
  const item = { name: '\u00c6ther Cr\u00e8me', type: 'item', keywords: [] }
  expect(searchFilter(item, 'aether creme')).toBe(true)
  expect(searchFilter({ ...item, name: 'Aether Creme' }, '\u00e6ther cr\u00e8me')).toBe(true)
})

it('lists each chest area only once', () => {
  const info = {
    name: { en: 'Test item' },
    chests: [
      { type: 'CHEST.BLUE', area: 0 },
      { type: 'CHEST.BLUE', area: 0 },
      { type: 'CHEST.BLUE', area: 1 }
    ]
  }
  const html = renderToStaticMarkup(<InfoBox type="item" info={info} />)
  expect(html).toContain('Found in blue chests in Galleon Minerva and Arvantville.')
})

it('renders the map and selects a search result', async () => {
  const consoleError = vi.spyOn(console, 'error')
  const div = document.createElement('div')
  document.body.appendChild(div)
  const root = createRoot(div)
  await act(() => root.render(<App />))
  expect(div.querySelector('#map')).not.toBeNull()
  expect(window.map).toBeDefined()
  const fitBounds = vi.spyOn(window.map, 'fitBounds')

  const input = div.querySelector('input')
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Morte')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  const menu = div.querySelector('[role="listbox"]')
  expect(input.getAttribute('aria-controls')).toBe(menu.id)
  expect(div.querySelector('[role="combobox"]').getAttribute('aria-expanded')).toBe('true')
  await act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })))
  expect(document.getElementById(input.getAttribute('aria-activedescendant')).textContent).toBe('Bomber Morte')
  await act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
  expect(div.querySelector('[role="combobox"]').getAttribute('aria-expanded')).toBe('false')
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Morte')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  const result = Array.from(div.querySelectorAll('li')).find(item => item.textContent === 'Morte')
  expect(result).toBeDefined()
  await act(() => result.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(div.querySelector('#info h3').textContent).toContain('Morte')
  expect(new URLSearchParams(window.location.search).get('q')).toBe('Morte')
  const locations = []
  window.map.eachLayer(layer => {
    if (typeof layer.getLatLng === 'function') locations.push(layer.getLatLng())
    if (typeof layer.getBounds === 'function') {
      const bounds = layer.getBounds()
      if (bounds.isValid()) locations.push(bounds.getSouthWest(), bounds.getNorthEast())
    }
  })
  expect(locations.length).toBeGreaterThan(1)
  expect(fitBounds).toHaveBeenLastCalledWith([
    [Math.min(...locations.map(location => location.lat)), Math.min(...locations.map(location => location.lng))],
    [Math.max(...locations.map(location => location.lat)), Math.max(...locations.map(location => location.lng))]
  ], { padding: [20, 20] })
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Adrasteia')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })))
  await act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })))
  expect(div.querySelector('#info h3').textContent).toContain('Adrasteia')
  expect(new URLSearchParams(window.location.search).get('q')).toBe('Adrasteia')
  await act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
  expect(input.value).toBe('')
  expect(div.querySelector('#info h3').textContent).toContain('Adrasteia')
  expect(new URLSearchParams(window.location.search).get('q')).toBe('Adrasteia')
  expect(consoleError).not.toHaveBeenCalled()
  await act(() => root.unmount())
  fitBounds.mockRestore()
  consoleError.mockRestore()
  div.remove()
})
