import { act } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

it('renders the map and selects a search result', async () => {
  const consoleError = vi.spyOn(console, 'error')
  const div = document.createElement('div')
  document.body.appendChild(div)
  const root = createRoot(div)
  await act(() => root.render(<App />))
  expect(div.querySelector('#map')).not.toBeNull()
  expect(window.map).toBeDefined()

  const input = div.querySelector('input')
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Morte')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  const result = Array.from(div.querySelectorAll('li')).find(item => item.textContent === 'Morte')
  expect(result).toBeDefined()
  await act(() => result.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(div.querySelector('#info h3').textContent).toContain('Morte')
  expect(new URLSearchParams(window.location.search).get('q')).toBe('Morte')
  expect(consoleError).not.toHaveBeenCalled()
  await act(() => root.unmount())
  consoleError.mockRestore()
  div.remove()
})
