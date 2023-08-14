const API_BASE_URL = 'https://pokeapi.co/api/v2/';
const POKEMON_PER_PAGE = 21;
const ALL_POKEMON_DATA = [];

let currentPage = 1;
let totalPages = 0;
let typeFilterActive = 'all';

const listPokemon = document.getElementById('listPokemon');
const filterInput = document.getElementById('filterInput');
const typeFilter = document.getElementById('typeFilter');
const messageResult = document.getElementById('messageId');
const previousPageButton = document.getElementById('previousPage');
const nextPageButton = document.getElementById('nextPage');

async function getAllPokemon() {
    const response = await fetch(`${API_BASE_URL}pokemon`);
    const data = await response.json();
    return data.count;
}

async function getPokemon(pokemonId) {
    const response = await fetch(`${API_BASE_URL}pokemon/${pokemonId}`);
    return response.json();
}

async function getPokemonForPage(page) {
    listPokemon.innerHTML = '';

    const startIndex = (page - 1) * POKEMON_PER_PAGE;
    const endIndex = startIndex + POKEMON_PER_PAGE;

    for (let i = startIndex; i < endIndex; i++) {
        if (i < ALL_POKEMON_DATA.length) {
            const pokemonData = ALL_POKEMON_DATA[i];
            createPokemonCard(pokemonData);
        } else {
            const pokemonId = i + 1;
            const pokemonData = await getPokemon(pokemonId);
            ALL_POKEMON_DATA.push(pokemonData);
            createPokemonCard(pokemonData);
        }
    }
}

function createPokemonCard(pokemon) {
  const types = pokemon.types.map(type => `<span class="badge ${type.type.name}">${type.type.name}</span>`).join('');
  const pokemonId = pokemon.id.toString().padStart(3, '0');

  const card = document.createElement('div');
  card.classList.add('col-md-4', 'mb-4');
  card.innerHTML = `
    <div class="card pokemon-card">
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" class="pokemon-image" alt="${pokemon.name}">
        <div class="card-body">
            <p class="badge pokemon-id">#${pokemonId}</p>
            <h3 class="pokemon-name">${pokemon.name}</h3>
            <p class="pokemon-types">${types}</p>
        </div>
    </div>
  `;
  listPokemon.appendChild(card);
}

function filterByPokemon() {
    const filterValue = filterInput.value.toLowerCase().trim();

    listPokemon.innerHTML = '';
    let foundPokemon = false;

    for (const pokemon of ALL_POKEMON_DATA) {
        const pokemonName = pokemon.name.toLowerCase();
        const pokemonId = pokemon.id.toString();
        
        if ((pokemonName.startsWith(filterValue) || pokemonId.startsWith(filterValue)) && (typeFilterActive === 'all' || typeMatch(pokemon, typeFilterActive))) {
            createPokemonCard(pokemon);
            foundPokemon = true;
        }
    }
    if (!foundPokemon) {
        messageResult.innerHTML = '<img class="pokedex-image text-uppercase" src="img/pokemon-not-found.png" alt="Pokemon not found">';
        messageResult.style.display = 'block';
        previousPageButton.style.display = 'none';
        nextPageButton.style.display = 'none';
    } else {
        messageResult.style.display = 'none';
        previousPageButton.style.display = 'block';
        nextPageButton.style.display = 'block';
        previousPageButton.style.display = 'inline-block';
        nextPageButton.style.display = 'inline-block';
    }
}

function filterByType(type) {
    typeFilterActive = type;
    filterByPokemon();
}

function typeMatch(pokemon, typeFilter) {
    return pokemon.types.some(type => type.type.name === typeFilter);
}

async function initApp() {
    const totalPokemonCount = await getAllPokemon();
    totalPages = Math.ceil(totalPokemonCount / POKEMON_PER_PAGE);
    
    await getPokemonForPage(currentPage);
    filterInput.addEventListener('input', filterByPokemon);
    typeFilter.addEventListener('change', filterByPokemon);
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        getPokemonForPage(currentPage);
    }
}

function goToPreviousPage() {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

function goToNextPage() {
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
}

initApp();