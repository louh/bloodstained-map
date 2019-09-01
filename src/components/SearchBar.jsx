import React, { useEffect } from 'react'
import Downshift from 'downshift'
import { Howl } from 'howler'
import { deburr } from 'lodash-es'
import DEMONS from '../data/demons.json'
import AREAS from '../data/areas.json'
import SHARDS from '../data/shards.json'
import ITEMS from '../data/items.json'
import MISC from '../data/misc.json'
import { drawGeo, drawRoomGeo, drawMarker, clearGeoJsons, zoomToGeoBounds } from '../map'
import './SearchBar.scss'

const locale = 'en'

const items = assembleSearchTerms()

function makeSearchTerm (item, index, type, keywords = []) {
  return {
    name: item.name[locale],
    type: type,
    index: index,
    disambiguate: item.disambiguate || false,
    // Additional keywords that will match
    keywords: keywords
  }
}

function assembleSearchTerms () {
  const items = []

  DEMONS.forEach((item, index) => {
    // Allow match on demon number (you can search by unknown demon when all you have is its number)
    const keywords = [
      item.number.toString()
    ]
    items.push(makeSearchTerm(item, index, 'demon', keywords))
  })

  AREAS.forEach((item, index) => {
    items.push(makeSearchTerm(item, index, 'area', []))
  })

  SHARDS.forEach((item, index) => {
    items.push(makeSearchTerm(item, index, 'shard', [ item.type ]))
  })
  
  ITEMS.forEach((item, index) => {
    const keywords = (item.keywords && item.keywords[locale]) ? [ ...item.keywords[locale] ] : []
    items.push(makeSearchTerm(item, index, 'item', [ item.type, item.subtype, ...keywords ]))
  })

  // TODO: re-categorize type
  MISC.forEach((item, index) => {
    items.push(makeSearchTerm(item, index, 'misc'))
  })

  items.push({
    name: 'Za Warudo',
    type: 'easteregg',
    hasActivated: false,
    keywords: []
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

/**
 * Search filtering function. The first parameter is the item normally passed
 * to an Array.prototype.filter function, the second parameter is the input
 * value provided by Downshift. Compares input value with item and returns
 * true if it matches, false otherwise.
 *
 * @param {Object} item
 * @param {string} inputValue
 * @returns {Boolean}
 */
function searchFilter (item, inputValue = '') {
  // False if input value isn't provided
  if (!inputValue.trim()) return false

  // Handle easter egg separately
  // Force secret search terms to match exactly after a certain length
  // (do not match on partial)
  if (item.type === 'easteregg') {
    if (item.hasActivated) return false
    if ((inputValue.length >= 4) && (inputValue.toLowerCase() === item.name.toLowerCase().substring(0, inputValue.length))) {
      return true
    } else {
      return false
    }
  }

  // When comparing strings, both the compare name and input value are modified
  // to make easier comparisons. For instance:
  //  - Deburred (remove accent marks, etc) - matches "Rhava Bural", "Dian Cecht"
  //  - Whitespaces removed - matches "fireball" to "Fire Ball", "snake bite" to "Snakebite"
  //  - Dashes removed - matches "32 bit" to "32-bit Coin", "tamako death" to "Tamako-Death"
  //  - Periods removed - matches "OD" to "O.D."
  //  - Apostrophes removed - matches "dragons wrath", or "aries horns" to "Aries' Horns", "vulsha" to "Vul'Sha"
  //  - Lowercase - makes search case insensitive
  let compareName = deburr(item.name).replace(/\s|-|\.|'/g, '').toLowerCase()
  let compareInput = deburr(inputValue).replace(/\s|-|\.|'/g, '').toLowerCase()

  // Special cases: certain symbols are replaced with full words to be allowed
  // them to be spelled out.
  // --------------------------------------------------------------------------

  // Special case: replace the number 8 with the word 'eight'
  // Matches inconsistent use of "8" or "eight" in "8-bit" or "Eight Bit"
  // TODO: locale?
  compareName = compareName.replace('8', 'eight')
  compareInput = compareInput.replace('8', 'eight')

  // Ampersands are "and"
  // Matches "fish and chips" to "Fish & Chips"
  // or "macaroni and cheese" to "Macaroni & Cheese"
  compareName = compareName.replace('&', 'and')
  compareInput = compareInput.replace('&', 'and')

  // '/R' is "recipe"
  // the lowercase is because it's already been converted to lowercase
  // compare name uses the plural to allow plural form to be searched
  compareName = compareName.replace(/\/r$/, 'recipes')
  compareInput = compareInput.replace(/\/r$/, 'recipe')

  // Also allow matching to alternate keywords
  let matchKeywords = item.keywords
    .map(keyword => keyword.trim().replace(/\s/g, '').toLowerCase())
    .some(keyword => keyword.includes(compareInput))

  return compareName.includes(compareInput) || matchKeywords
}

function activateEasterEgg () {
  // Plays audio
  const sound = new Howl({
    src: ['/timestop.mp3']
  })
  sound.play()

  // Activate developer / debug mode
  // (global)
  window.debug()
}

function getChestType (type) {
  switch (type) {
    case 'CHEST.WOODEN':
      return 'Wooden chest'
    case 'CHEST.GREEN':
      return 'Green chest'
    case 'CHEST.RED':
      return 'Red chest'
    case 'CHEST.BLUE':
      return 'Blue chest'
    default:
      return 'Chest'
  }
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

        // handle lack of selection
        if (!selection) return

        switch (selection.type) {
          case 'easteregg':
            activateEasterEgg()
            // Side effect disables this after activating once
            selection.hasActivated = true
            break
          case 'demon':
            // ROOMS override AREAS
            // test roooms
            if (DEMONS[selection.index].rooms && DEMONS[selection.index].rooms.length > 0) {
              DEMONS[selection.index].rooms.forEach((room) => {
                // TODO: mark room with area name
                // re: drawing markers, should do this for any mob that has a specific location
                // don't do it for bosses or for recurring mobs like medusa heads
                // override for kunekune (temp)
                if ((selection.index === 43) || (DEMONS[selection.index].type !== 'boss' && (typeof room[2] !== 'undefined' && room[2] > 0))) {
                  drawMarker(room, DEMONS[selection.index].name[locale])
                } else {
                  drawRoomGeo(room, DEMONS[selection.index].name[locale])
                }
              })
            } else {
              DEMONS[selection.index].areas.forEach((area) => {
                const geo = AREAS[area].geo
                if (geo) {
                  drawGeo(geo, AREAS[area].name[locale])
                }
              })
            }
            props.onSelect({
              type: selection.type,
              info: DEMONS[selection.index]
            })
            zoomToGeoBounds()
            break
          case 'area':
            drawGeo(AREAS[selection.index].geo, AREAS[selection.index].name[locale])
            props.onSelect({
              type: selection.type,
              info: AREAS[selection.index]
            })
            zoomToGeoBounds()
            break
          case 'shard': {
            const shard = SHARDS[selection.index]
            if (shard.demons) {
              const demons = shard.demons
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
                if (DEMONS[number - 1].rooms && DEMONS[number - 1].rooms.length > 0) {
                  DEMONS[number - 1].rooms.forEach((room) => {
                    // TODO: mark room with area name
                    if (DEMONS[number - 1].type !== 'boss' && (typeof room[2] !== 'undefined' && room[2] > 0)) {
                      drawMarker(room, DEMONS[number - 1].name[locale])
                    } else {
                      drawRoomGeo(room, DEMONS[number - 1].name[locale])
                    }
                    // drawRoomGeo(room, DEMONS[number - 1].name[locale])
                  })
                } else {
                  DEMONS[number - 1].areas.forEach((area) => {
                    const geo = AREAS[area].geo
                    if (geo) {
                      drawGeo(geo, AREAS[area].name[locale])
                    }
                  })
                }
              })
            } else if (shard.alchemy) {
              // Arvantville (Johannes)
              drawGeo(AREAS[1].geo, AREAS[1].name[locale])
            }

            // test roooms
            if (shard.rooms) {
              shard.rooms.forEach((room) => {
                drawMarker(room, shard.name[locale])
                // drawRoomGeo(room, shard.name[locale])
              })
            }

            props.onSelect({
              type: selection.type,
              info: SHARDS[selection.index]
            })
            zoomToGeoBounds()
            break
          }
          case 'misc':
          case 'item': {
            const item = (selection.type === 'item') ? ITEMS[selection.index] : MISC[selection.index]
            if (item.chests) {
              item.chests.forEach((chest) => {
                if (typeof chest.area === 'undefined' || typeof chest.room === 'undefined') return
                if (chest.room) {
                  drawMarker(chest.room, getChestType(chest.type))
                  // drawRoomGeo(chest.room, getChestType(chest.type))
                } else if (chest.area) {
                  const geo = AREAS[chest.area].geo
                  if (geo) {
                    drawGeo(geo, AREAS[chest.area].name[locale])
                  }
                }
              })
            }
            if (item.quest) {
              switch (item.quest.npc) {
                case 'Lindsay':
                  drawMarker([ 20, 27 ], 'Lindsay')
                  break
                case 'Susie':
                  drawMarker([ 18, 27 ], 'Susie')
                  break
                case 'Abigail':
                  drawMarker([ 18, 26 ], 'Abigail')
                  break
                // Quests are in Arvantville
                default:
                  const geo = AREAS[1].geo
                  if (geo) {
                    drawGeo(geo, AREAS[1].name[locale])
                  }
              }
            }
            if (item.shop) {
              drawMarker([ 19, 27 ], 'Dominique')
              // drawRoomGeo([ 19, 27 ], 'Dominique')
            }
            if (item.alchemy) {
              drawMarker([ 21, 27 ], 'Dominique')
              // drawRoomGeo([ 21, 27 ], 'Johannes')
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
                drawMarker(room, item.name[locale])
                // drawRoomGeo(room, item.name[locale])
              })
            }

            props.onSelect({
              type: selection.type,
              info: item
            })
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
