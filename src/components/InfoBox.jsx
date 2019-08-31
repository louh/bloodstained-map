import React from 'react'
import './InfoBox.scss'
import DEMONS from '../data/demons.json'
import AREAS from '../data/areas.json'

const locale = 'en'

function InfoBox (props) {
  const { type, info } = props

  if (!type || !info) return null

  const displayType = getType(type, info)
  const { note, quest, demons, areas, chests, shop, alchemy, librarian, rooms, special, prerequisites, dlc } = info

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

      {(note && note[locale]) && (
        <p>{note[locale]}</p>
      )}

      {/* Quest items */}
      {quest && (
        <>
          <strong>Quest reward</strong>
          <p>Obtained from {quest.npc} for completing {quest.name}.</p>
        </>
      )}

      {/* Shards and items that drop from demons */}
      {demons && (
        <>
          {(type === 'shard') && <strong>Obtained by defeating</strong>}
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

      {(chests || shop || alchemy || librarian || special) ? (
        <>
          <strong>Locations</strong>
          {chests && chests.map(chest => (chest.area ? <p key={chest.area}>Obtained from a chest in {AREAS[chest.area].name[locale]}.</p> : <p key={chest}>Obtained from a {chest.type} chest.</p>))}
          {alchemy && ((typeof alchemy === 'string') ? <p>Crafted from {info.alchemy} by Johannes.</p> : <p>Crafted by Johannes.</p>)}
          {shop && <p>Purchased from Dominique.</p>}
          {librarian && <p>Borrow from O.D.</p>}
          {special && <p>Obtained from {special}.</p>}
        </>
      ) : null}

      {areas && (
        <>
          <strong>Spawn areas</strong>
          {areas.map(index => <p key={index}>{AREAS[index].name[locale]}</p>)}
        </>
      )}

      {(!chests && !demons && !quest && !shop && !alchemy && !rooms && !librarian && !areas && !note && type !== 'area') && (
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
