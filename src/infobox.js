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
          pEl.textContent =  DEMONS[index - 1].name[locale]
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

      break
    }
    default:
      break
  }
}
