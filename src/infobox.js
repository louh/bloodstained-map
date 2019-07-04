import DEMONS from './data/demons.json'
import AREAS from './data/areas.json'
import SHARDS from './data/shards.json'

const locale = 'en'

export function hideInfoBox () {
  document.getElementById('info').style.display = 'none'
}

export function showInfoBox (type, object) {
  const el = document.getElementById('info')
  el.style.display = 'block'

  el.innerHTML = ''

  switch (type) {
    case 'area': {
      const typeEl = document.createElement('h4')
      typeEl.textContent = ((object.type || '') + ' ' + type.toUpperCase()).trim()
      el.appendChild(typeEl)

      const nameEl = document.createElement('h3')
      nameEl.textContent = object.name[locale]
      el.appendChild(nameEl)

      break
    }
    case 'demon': {
      const typeEl = document.createElement('h4')
      typeEl.textContent = (
        (object.dlc ? 'DLC' : '') + ' '
        + (object.type || '') + ' '
        + type.toUpperCase()
      ).trim()
      el.appendChild(typeEl)

      const nameEl = document.createElement('h3')
      nameEl.textContent = object.name[locale]
      const numEl = document.createElement('span')
      numEl.className = 'demon-number'
      numEl.textContent = ' – #' + object.number.toString().padStart(3, '0')
      nameEl.appendChild(numEl)
      el.appendChild(nameEl)

      const titleEl = document.createElement('strong')
      titleEl.textContent = 'Spawn locations'
      el.appendChild(titleEl)

      object.areas.forEach((index) => {
        const pEl = document.createElement('p')
        pEl.textContent =  AREAS[index].name[locale]
        el.appendChild(pEl)
      })

      if (object.dlc) {
        const titleEl2 = document.createElement('strong')
        titleEl2.textContent = 'DLC'
        el.appendChild(titleEl2)
  
        const pEl2 = document.createElement('p')
        pEl2.textContent = object.dlc
        el.appendChild(pEl2)
      }

      break
    }
    case 'shard':{
      const typeEl = document.createElement('h4')
      typeEl.textContent = object.type + ' ' + type.toUpperCase()
      el.appendChild(typeEl)

      const nameEl = document.createElement('h3')
      nameEl.textContent = object.name[locale]
      el.appendChild(nameEl)

      if (object.demons) {
        const titleEl = document.createElement('strong')
        titleEl.textContent = 'Obtained by defeating'
        el.appendChild(titleEl)

        object.demons.forEach((index) => {
          const pEl = document.createElement('p')
          if (Array.isArray(index)) {
            pEl.textContent = DEMONS[index[0] - 1].name[locale] + ' (' + (index[1] * 100) + '%)'
          } else {
            pEl.textContent = DEMONS[index - 1].name[locale]
          }
          el.appendChild(pEl)
        })
      }

      if (object.alchemy) {
        const titleEl = document.createElement('strong')
        titleEl.textContent = 'Alchemy'
        el.appendChild(titleEl)

        const pEl = document.createElement('p')
        pEl.innerHTML = `Crafted from <strong>${object.alchemy}</strong>. See Johannes in Arvantville.`
        el.appendChild(pEl)
      }

      if (object.special) {
        const titleEl = document.createElement('strong')
        titleEl.textContent = 'Special'
        el.appendChild(titleEl)

        const pEl = document.createElement('p')
        pEl.innerHTML = `Obtained from <strong>${object.special}</strong>.`
        el.appendChild(pEl)
      }

      if (object.prerequisites) {
        const titleEl = document.createElement('strong')
        titleEl.textContent = 'Prerequisites'
        el.appendChild(titleEl)

        const pEl = document.createElement('p')
        pEl.textContent = object.prerequisites[locale]
        el.appendChild(pEl)
      }

      break
    }
    case 'item': {
      if (object.type) {
        const typeEl = document.createElement('h4')
        typeEl.textContent = object.type + (object.subtype ? ' – ' + object.subtype : '')
        el.appendChild(typeEl)
      }

      const nameEl = document.createElement('h3')
      nameEl.textContent = object.name[locale]
      el.appendChild(nameEl)

      if (object.note) {
        const pEl = document.createElement('p')
        pEl.textContent = object.note
        el.appendChild(pEl)
      }

      if (object.chests || object.shop || object.alchemy || object.librarian) {
        const titleEl = document.createElement('strong')
        if (((object.chests && object.chests.length) || 0) + (object.shop && 1) + (object.librarian && 1) === 1) {
          titleEl.textContent = 'Location'
        } else {
          titleEl.textContent = 'Locations'
        }
        el.appendChild(titleEl)

        if (object.chests) {
          object.chests.forEach((chest) => {
            const pEl = document.createElement('p')
            pEl.textContent = `Obtained from a chest in ${AREAS[chest.area].name[locale]}.`
            el.appendChild(pEl)
          })
        }

        if (object.alchemy) {
          const pEl = document.createElement('p')
          pEl.innerHTML = `Crafted by Johannes.`
          el.appendChild(pEl)
        }

        if (object.shop) {
          const pEl = document.createElement('p')
          pEl.textContent = `Purchased from Dominique.`
          el.appendChild(pEl)
        }

        if (object.librarian) {
          const pEl = document.createElement('p')
          pEl.textContent = `Borrow from O.D.`
          el.appendChild(pEl)
        }
      } else {
        // if (object.rooms) {
        //   const pEl = document.createElement('p')
        //   pEl.textContent = 'See map for locations.'
        //   el.appendChild(pEl)
        // }
      }

      if (object.quest) {
        const titleEl = document.createElement('strong')
        titleEl.textContent = 'Quest reward item'
        el.appendChild(titleEl)

        const pEl = document.createElement('p')
        pEl.textContent = `Obtained from ${object.quest.npc} for completing ${object.quest.name}.`
        el.appendChild(pEl)
      }

      if (object.demons) {
        const titleEl = document.createElement('strong')
        titleEl.textContent = 'Drops from'
        el.appendChild(titleEl)

        object.demons.forEach((index) => {
          const pEl = document.createElement('p')
          if (Array.isArray(index)) {
            // Third item in the array is if item drops in multiples.
            const multiples = index[2] ? ' ×' + index[2] : ''
            pEl.textContent = DEMONS[index[0] - 1].name[locale] + ' (' + (index[1] * 100) + '%)' + multiples
          } else {
            pEl.textContent = DEMONS[index - 1].name[locale]
          }
          el.appendChild(pEl)
        })
      }

      if (!object.chests && !object.demons && !object.quest && !object.shop && !object.alchemy && !object.rooms && !object.note) {
        const pEl = document.createElement('p')
        pEl.textContent = `Location information will be added soon! Please come back later.`
        el.appendChild(pEl)
      }

      if (object.prerequisites) {
        const titleEl = document.createElement('strong')
        titleEl.textContent = 'Prerequisites'
        el.appendChild(titleEl)

        const pEl = document.createElement('p')
        pEl.textContent = object.prerequisites[locale]
        el.appendChild(pEl)
      }

      break
    }
    default: {
      break
    }
  }
}
