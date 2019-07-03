import React, { useEffect } from 'react'
import Downshift from 'downshift'
import DEMONS from '../data/demons.json'
import AREAS from '../data/areas.json'
import SHARDS from '../data/shards.json'
import ITEMS from '../data/items.json'
import ROOMS from '../data/rooms.json'
import { drawGeo, clearGeoJsons, zoomToGeoBounds } from '../map'
import './SearchBar.scss'
import { showInfoBox, hideInfoBox } from '../infobox.js';

const locale = 'en'

const items = assembleSearchTerms()

function makeSearchTerm (item, index, type) {
  return {
    name: item.name[locale],
    type: type,
    index: index,
    disambiguate: item.disambiguate || false
  }
}

function assembleSearchTerms () {
  const items = []

  DEMONS.forEach((item, index) => {
    items.push(makeSearchTerm(item, index, 'demon'))
  })

  AREAS.forEach((item, index) => {
    items.push(makeSearchTerm(item, index, 'area'))
  })

  SHARDS.forEach((item, index) => {
    items.push(makeSearchTerm(item, index, 'shard'))
  })
  
  ITEMS.forEach((item, index) => {
    items.push(makeSearchTerm(item, index, 'item'))
  })

  return items
}

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
        clearGeoJsons()
        hideInfoBox()

        // handle lack of selection
        if (!selection) return

        switch (selection.type) {
          case 'demon':
            DEMONS[selection.index].areas.forEach((area) => {
              const geo = AREAS[area].geo
              if (geo) {
                drawGeo(geo, AREAS[area].name[locale])
              }
            })
            showInfoBox(selection.type, DEMONS[selection.index])
            zoomToGeoBounds()
            break
          case 'area':
            drawGeo(AREAS[selection.index].geo, AREAS[selection.index].name[locale])
            showInfoBox(selection.type, AREAS[selection.index])
            zoomToGeoBounds()
            break
          case 'shard': {
            const shard = SHARDS[selection.index]
            if (shard.demons) {
              const demons = shard.demons
              demons.forEach((number) => {
                // Demons are indexed at 1, so we need to subtract 1 to look up by array index
                // Same as drawing selected demon
                DEMONS[number - 1].areas.forEach((area) => {
                  const geo = AREAS[area].geo
                  if (geo) {
                    drawGeo(geo, AREAS[area].name[locale])
                  }
                })
              })
            } else if (shard.alchemy) {
              // Arvantville (Johannes)
              drawGeo(AREAS[1].geo, AREAS[1].name[locale])
            }
            showInfoBox(selection.type, SHARDS[selection.index])
            zoomToGeoBounds()
            break
          }
          case 'item': {
            const item = ITEMS[selection.index]
            if (item.chests) {
              item.chests.forEach((chest) => {
                const geo = AREAS[chest.area].geo
                if (geo) {
                  drawGeo(geo, AREAS[chest.area].name[locale])
                }
              })
            }
            if (item.quest || item.shop) {
              // Quests are in Arvantville
              const geo = AREAS[1].geo
              if (geo) {
                drawGeo(geo, AREAS[1].name[locale])
              }
            }
            if (item.demons) {
              const demons = item.demons
              demons.forEach((demon) => {
                // demons can have a 2nd number for drop rate, we need to do this for all of them eventually
                let number
                if (Array.isArray(demon)) {
                  number = demon[0]
                } else {
                  number = demon
                }

                // Demons are indexed at 1, so we need to subtract 1 to look up by array index
                // Same as drawing selected demon
                DEMONS[number - 1].areas.forEach((area) => {
                  const geo = AREAS[area].geo
                  if (geo) {
                    drawGeo(geo, AREAS[area].name[locale])
                  }
                })
              })
            }

            // test roooms
            if (item.rooms) {
              item.rooms.forEach((room) => {
                const geo = ROOMS[room].geo
                if (geo) {
                  drawGeo(geo, '')
                }
              })
            }

            showInfoBox(selection.type, item)
            zoomToGeoBounds()
            break
          }
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
          <label {...getLabelProps()}>What are you looking for?</label>
          <input {...getInputProps({ spellCheck: 'false', placeholder: 'Enter search term' })} ref={textInput} />
          <ul {...getMenuProps()}>
            {isOpen
              ? items
                  .filter(item => !inputValue || item.name.toLowerCase().includes(inputValue.toLowerCase()))
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
