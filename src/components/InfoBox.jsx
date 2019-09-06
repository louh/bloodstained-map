import React from 'react'
import { uniq } from 'lodash-es'
import './InfoBox.scss'
import DEMONS from '../data/demons.json'
import AREAS from '../data/areas.json'

const locale = 'en'

function InfoBox (props) {
  const { type, info } = props

  if (!type || !info) return null

  const displayType = getType(type, info)
  const { description, note, quest, demons, areas, chests, shop, alchemy, cook, farm, librarian, rooms, special, prerequisites, dlc } = info

  return (
    <div id="info">
      {/* Show object type, not all entries will have one */}
      {displayType && <h4>{displayType}</h4>}

      {/* Item name; special case for demons, which also have demon number */}
      {(type === 'demon') ? (
        <h3>
          {info.name[locale]}
          <span className="demon-number">{' – #' + info.number.toString().padStart(3, '0')}</span>
        </h3>
      ) : (
        <h3>{info.name[locale]}</h3>
      )}

      {(description && description[locale]) && (
        <p className="info-description">{description[locale]}</p>
      )}

      {(note && note[locale]) && (
        <p>{note[locale]}</p>
      )}

      {/* Shards and items that drop from demons */}
      {demons && (
        <>
          {(type === 'shard') && <strong>Obtain by defeating</strong>}
          {(type === 'item') && <strong>Drops from</strong>}
          {(demons.map(index => (
            <p key={index}>
              {(Array.isArray(index)) ? (
                // Third item in the array is if item drops in multiples.
                DEMONS[index[0] - 1].name[locale] + ' (' + (index[1] * 100) + '%)' + (index[2] ? ' ×' + index[2] : '')
              ) : (
                DEMONS[index - 1].name[locale]
              )}
            </p>
          )))}
        </>
      )}

      {/* Quest items */}
      {quest && (
        <>
          <strong>Quest reward</strong>
          <p>Obtain{(typeof quest.quantity !== 'undefined') && ` ×${quest.quantity}`} from {quest.npc} for completing “{quest.name}”.</p>
        </>
      )}

      {/* Craftable */}
      {(alchemy || cook) ? (
        <>
          <strong>Crafting</strong>
          {alchemy &&
            <p>
              Crafted by Johannes
              {(typeof alchemy.shard !== 'undefined' ? ` after obtaining ${alchemy.shard}` : '')}
              {(typeof alchemy.materials !== 'undefined' ? ` from ${listThings(alchemy.materials.map(([item, quantity]) => `${item} ×${quantity}`))}.` : '.')}
              {(typeof alchemy.recipe !== 'undefined') ? ' Requires ' + alchemy.recipe + ' recipe.' : ''}
              {(typeof alchemy.item !== 'undefined') ? ' Unlocked after acquiring ' + ((typeof alchemy.item === 'string') ? alchemy.item : (Array.isArray(alchemy.item) ? alchemy.item.join(' / ') : '')) + '.' : ''}
            </p>
          }
          {cook &&
            <p>Prepare with Johannes.
              {(typeof cook === 'string') ? ' ' + cook + ' recipe required.' : (
                (typeof cook !== 'undefined') ? ' Unlocked after acquiring ' + cook.item + '.' : ''
              )}
            </p>
          }
        </>
      ) : null}

      {(shop) ? (
        <>
          <strong>Shop</strong>
          <p>
            Purchased from Dominique{shop.price && ' (' + shop.price + 'G)'}.
            {shop.craft && ' In stock after crafting once.'}
            {shop.lategame && ' In stock after a certain amount of game progression.'}
          </p>
        </>
      ) : null}

      {(chests || librarian || farm || special) ? (
        <>
          <strong>Locations</strong>
          {farm && <p>Farmed with Harry.</p>}
          {librarian && <p>Borrow from O.D.</p>}
          {makeChestText(chests)}
          {special && <p>Obtain from {special[locale]}.</p>}
        </>
      ) : null}

      {(type === 'demon') && areas && (
        <>
          <strong>Spawn areas</strong>
          {areas.map(index => <p key={index}>{AREAS[index].name[locale]}</p>)}
        </>
      )}

      {(!chests && !demons && !quest && !shop && !alchemy && !cook && !farm && !rooms && !librarian && !areas && !note && type !== 'area') && (
        <p>Location information will be added soon! Please come back later.</p>
      )}

      {prerequisites && (
        <>
          <strong>Prerequisites</strong>
          {
            (typeof prerequisites[locale] === 'string' ? (
              <p>
                {prerequisites[locale]}
              </p>
            ) : (
              prerequisites[locale].map(p => <p key={p}>{p}</p>)
            ))
          }
        </>
      )}

      {dlc && (
        <>
          <strong>DLC</strong>
          <p>{dlc}</p>
        </>
      )}

    </div>
  )
}

export default InfoBox

function getType (type, info) {
  switch (type) {
    case 'area':
      return ((info.type || '') + ' ' + type).trim()
    case 'demon':
      return (
        (info.dlc ? 'DLC' : '') + ' '
        + (info.type || '') + ' '
        + type
      ).trim()
    case 'shard':
      return info.type + ' ' + type
    case 'misc':
    case 'item':
      // Not all items have types?
      if (info.type) {
        return info.type + (info.subtype ? ' – ' + info.subtype : '')
      }
      return null
    default:
      return null
  }
}

function makeChestText (chests) {
  if (!chests || chests.length === 0) return null

  const pattern = "Found in {chests} in {area}."

  const grouped = {}

  for (let i = 0; i < chests.length; i++) {
    const chest = chests[i]
    grouped[chest.type] = grouped[chest.type] || []
    grouped[chest.type].push(chest.area)
  }

  const text = Object.entries(grouped).map(([ key, value ]) => {
    const areas = uniq(value.sort()).map(areaId => {
      if (locale === 'en') {
        return (AREAS[areaId].article ? AREAS[areaId].article + ' ' : '') + AREAS[areaId].name['en']
      } else {
        return AREAS[areaId].name[locale]
      }
    })

    const areaString = listThings(areas)
    const chestString = getChestType(key, value.length)

    return pattern.replace('{chests}', chestString).replace('{area}', areaString)
  })

  return text.map(t => <p key={t}>{t}</p>)
}

// Non-serialized comma
// e.g. [1, 2, 3] => '1, 2 and 3'
// [1, 2] => '1 and 2'
function listThings (array, set = true) {
  const c = set ? 'and' : 'or'
  return array.reduce(
    (res, v, i) => i === array.length - 2 ? res + v + ' ' + c + ' ' : res + v + ( i === array.length -1? '' : ', ')
    , '')
}

function getChestType (type, length) {
  switch (type) {
    case 'CHEST.WOODEN':
      return (length > 1) ? 'wooden chests' : 'a wooden chest'
    case 'CHEST.GREEN':
      return (length > 1) ? 'green chests' : 'a green chest'
    case 'CHEST.RED':
      return (length > 1) ? 'red chests' : 'a red chest'
    case 'CHEST.BLUE':
      return (length > 1) ? 'blue chests' : 'a blue chest'
    case 'HIDDEN.WALL':
      return (length > 1) ? 'breakable walls' : 'a breakable wall'
    default:
      return (length > 1) ? 'chests' : 'a chest'
  }
}
