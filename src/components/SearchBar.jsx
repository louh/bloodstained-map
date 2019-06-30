import React, { useEffect } from 'react'
import Downshift from 'downshift'
import DEMONS from '../data/demons.json'
import AREAS from '../data/areas.json'
import { drawGeo, clearGeoJsons } from '../map'
import './SearchBar.scss'

const locale = 'en'

const items = assembleSearchTerms()

function assembleSearchTerms () {
  const items = []

  DEMONS.forEach((demon, index) => {
    items.push({
      name: demon.name[locale],
      type: 'demon',
      index: index
    })
  })

  AREAS.forEach((area, index) => {
    items.push({
      name: area.name[locale],
      type: 'area',
      index: index
    })
  })

  return items
}

function SearchBar (props) {
  const textInput = React.createRef()

  useEffect(() => {
    textInput.current.focus()
  }, [ textInput ])

  return (
    <Downshift
      onChange={selection => {
        clearGeoJsons()

        switch (selection.type) {
          case 'demon':
            DEMONS[selection.index].areas.forEach((area) => {
              const geo = AREAS[area].geo
              if (geo) {
                drawGeo(geo, AREAS[area].name[locale])
              }
            })
            break
          case 'area':
            drawGeo(AREAS[selection.index].geo, AREAS[selection.index].name[locale])
            break
          // do nothing
          default:
            break
        }
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
          <label {...getLabelProps()}>Search</label>
          <input {...getInputProps()} ref={textInput} />
          <ul {...getMenuProps()}>
            {isOpen
              ? items
                  .filter(item => !inputValue || item.name.toLowerCase().includes(inputValue.toLowerCase()))
                  .sort(function (a, b) {
                    const a1 = a.name
                    const b1 = b.name
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
                        key: `${item.type}-${item.index}`,
                        index,
                        item,
                        className: [
                          highlightedIndex === index ? 'highlighted' : '',
                          selectedItem === item ? 'selected' : ''
                        ].join(' ')
                      })}
                    >
                      {item.name}
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
