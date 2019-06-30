import React, { useEffect } from 'react'
import Downshift from 'downshift'
import DEMONS from '../data/demons.json'
import AREAS from '../data/areas.json'
import { drawGeo, clearGeoJsons } from '../map'
import './SearchBar.scss'

const items = DEMONS
const locale = 'en'

function SearchBar (props) {
  const textInput = React.createRef()

  useEffect(() => {
    textInput.current.focus()
  }, [ textInput ])

  return (
    <Downshift
      onChange={selection => {
        clearGeoJsons()
        selection.areas.forEach((area) => {
          const geo = AREAS[area].geo
          if (geo) {
            drawGeo(geo, AREAS[area].name[locale])
          }
        })
      }}
      itemToString={item => (item ? item.name[locale] : '')}
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
          <label {...getLabelProps()}>Search</label>
          <input {...getInputProps()} ref={textInput} />
          <ul {...getMenuProps()}>
            {isOpen
              ? items
                  .filter(item => !inputValue || item.name[locale].toLowerCase().includes(inputValue.toLowerCase()))
                  .sort(function (a, b) {
                    const a1 = a.name[locale]
                    const b1 = b.name[locale]
                    const nameA = a1.toLowerCase()
                    const nameB = b1.toLowerCase()
                    if (nameA < nameB) {
                      return -1
                    } else {
                      return 1
                    }
                  })
                  .map((item, index) => (
                    <li
                      {...getItemProps({
                        key: item.number,
                        index,
                        item,
                        className: [
                          highlightedIndex === index ? 'highlighted' : '',
                          selectedItem === item ? 'selected' : ''
                        ].join(' ')
                      })}
                    >
                      {item.name[locale]}
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
