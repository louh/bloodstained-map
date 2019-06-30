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
      const nameEl = document.createElement('h3')
      nameEl.textContent = object.name[locale]
      el.appendChild(nameEl)

      const typeEl = document.createElement('h4')
      typeEl.textContent = type.toUpperCase()
      el.appendChild(typeEl)

      break
    }
    case 'demon': {
      const nameEl = document.createElement('h3')
      nameEl.textContent = object.name[locale]
      el.appendChild(nameEl)

      const typeEl = document.createElement('h4')
      typeEl.textContent = type.toUpperCase()
      el.appendChild(typeEl)

      const titleEl = document.createElement('strong')
      titleEl.textContent = 'Spawn locations'
      el.appendChild(titleEl)

      object.areas.forEach((index) => {
        const pEl = document.createElement('p')
        pEl.textContent =  AREAS[index].name[locale]
        el.appendChild(pEl)
      })

      break
    }
    case 'shard':{
      const nameEl = document.createElement('h3')
      nameEl.textContent = object.name[locale]
      el.appendChild(nameEl)

      const typeEl = document.createElement('h4')
      typeEl.textContent = object.type + ' ' + type.toUpperCase()
      el.appendChild(typeEl)

      if (object.demons) {
        const titleEl = document.createElement('strong')
        titleEl.textContent = 'Drops from'
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
