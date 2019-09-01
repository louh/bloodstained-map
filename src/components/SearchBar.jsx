import React, { useEffect } from 'react'
import Downshift from 'downshift'
import './SearchBar.scss'
import { getSearchTerms, searchFilter, showResult } from '../result.js'

const items = getSearchTerms()

function alphabetize (a, b) {
  const a1 = a.name
  const b1 = b.name
  const nameA = a1.toLowerCase()
  const nameB = b1.toLowerCase()
  if (nameA < nameB) {
    return -1
  }
  if (nameA > nameB) {
    return 1
  }
  return 0
}

function SearchBar (props) {
  const textInput = React.createRef()

  useEffect(() => {
    textInput.current.focus()
  }, [ textInput ])

  return (
    <Downshift
      onChange={selection => {
        // handle lack of selection
        if (!selection) return

        showResult(selection, props.onSelect)

        // set URL param for deep linking
        const params = new URLSearchParams()
        params.append('q', selection.name)
        window.history.pushState(selection, null, '?' + params.toString())
      }}
      itemToString={item => (item ? item.name : '')}
    >
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        inputValue,
        highlightedIndex,
        selectedItem,
      }) => (
        <div className="search">
          <label {...getLabelProps()}>What are you looking for?</label>
          <input {...getInputProps({ spellCheck: 'false', placeholder: 'Enter search term' })} ref={textInput} />
          <ul {...getMenuProps()}>
            {isOpen
              ? items
                  .filter((item) => searchFilter(item, inputValue))
                  .sort(alphabetize)
                  .map((item, index) => (
                    <li
                      {...getItemProps({
                        key: `${item.type}-${item.index}`,
                        index,
                        item,
                        className: [
                          highlightedIndex === index ? 'highlighted' : '',
                          selectedItem === item ? 'selected' : ''
                        ].join(' ')
                      })}
                    >
                      {(item.disambiguate) ? `${item.name} (${item.type.toLowerCase()})` : item.name}
                    </li>
                  ))
              : null}
          </ul>
        </div>
      )}
    </Downshift>
  )
}

export default SearchBar
