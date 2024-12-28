const pokemonContainer = document.getElementById("pokemon-container")
const paginationContainer = document.getElementById("pagination")
const limit = 20 // limite de pokemones por página
let currentPage = 1 // página actual
const totalPage = 50 // el total de páginas que vamos a traer desde la api

// Funcion para obtener los datos de la API
async function fetchPokemon(page) {
    // offset significa que comenzaremos desde el pokemon 0
    const offset = (page - 1) * limit
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    const response = await fetch(url)
    const data = await response.json()
    return data.results
}

async function renderPokemons(page) {
    const pokemonList = await fetchPokemon(page)

    // crear un array de promesas para obtener detalles de cada pokemon
    const pokemonDetailsPromises = pokemonList.map(async (pokemon) => {
        const response = await fetch(pokemon.url)
        return response.json()
    })

    // Ejecutaremos todas las promesas en paralelo y obtendremos los datos
    const pokemonDetails = await Promise.all(pokemonDetailsPromises)

    // Crear los elementos del DOM con los datos obtenidos
    const fragment = document.createDocumentFragment()

    pokemonDetails.forEach(pokemon => {
        const card = document.createElement("div")
        card.classList.add("cardPokemon")
        card.innerHTML = `
        <img src=${pokemon.sprites.front_default} alt=${pokemon.name}>
        <h3>${pokemon.name}</h3>
        `
        fragment.appendChild(card)
    })

    // limpiar el contenedor y agregar las cards
    pokemonContainer.innerHTML = ""
    pokemonContainer.appendChild(fragment)
}

async function renderPagination() {
    paginationContainer.innerHTML = ""

    const maxButtons = 10

    // Me dará la mitad del rango de botones visibles
    const halfRange = Math.floor(maxButtons / 2) // 2

    // startPage se calcula restanto halfRange(la mitada del rango de botones) menos la página actual que es currentPage
    // usamos Math.max() para asegurarnos de que nunca sea menor que 1
    // ya que no hay paginas antes que la pagina 1
    //      1                1       1            2
    let startPage = Math.max(1, currentPage - halfRange)

    // endPage usa Math.min() para asegurarse de que nunca supere el número de páginas total que es 50
    let endPage = Math.min(totalPage, currentPage + halfRange)


    // Ejemplo si currentPage = 2 y halfRange = 2
    // entonces endPage se ajusta mostrando 5 botones
    // 1,2,3,4,5
    if (currentPage <= halfRange) {
        //                    50            5
        endPage = Math.min(totalPage, maxButtons)
    }

    // Si currentPage = 49, totalPage 50
    // 49                 48
    // 46,47,48,49,50
    if (currentPage > totalPage - halfRange) {
        //   46                           46
        startPage = Math.max(1, totalPage - maxButtons + 1)
    }


    // Crear el boton anterior
    const prevButton = document.createElement("button")
    prevButton.textContent = "Anterior"
    prevButton.disabled = currentPage === 1
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--
            update()
        }
    })
    paginationContainer.appendChild(prevButton)

    // BOTONES NUMERADOS
    //              1              5
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement("button")
        pageButton.textContent = i;

        if (i === currentPage) pageButton.classList.add("active")


        pageButton.addEventListener("click", () => {
            currentPage = i
            update()
        })

        paginationContainer.appendChild(pageButton)
    }

    // BOTON SIGUIENTE
    const nextButton = document.createElement("button")
    nextButton.textContent = "Siguiente"
    nextButton.disabled = currentPage === totalPage
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPage) {
            currentPage++
            update()
        }
    })
    paginationContainer.appendChild(nextButton)

}

async function update() {
    await renderPokemons(currentPage)
    renderPagination()
}


document.addEventListener("DOMContentLoaded", () => {
    update()
})