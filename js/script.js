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
const modalBody = document.querySelector('#pokemonModal .modal-body');

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

    card.addEventListener('click', () => {
        openPokemonModal(pokemon);
    });

    listPokemon.appendChild(card);
}

function openPokemonModal(pokemon) {
    const types = pokemon.types.map(type => `<span class="badge ${type.type.name}">${type.type.name}</span>`).join('');

    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-5">
                <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="pokemon-image">
                <p class="badge pokemon-id">#${pokemon.id}</p>
                <h3 class="pokemon-name">${pokemon.name}</h3>
                <p class="pokemon-types space-bottom">${types}</p>
                <table class="stats-table mt-3">
                    <thead>
                        <tr>
                            <th class="stat-name"><i class="fa-regular fa-life-ring"></i></strong> ${pokemon.weight} Kg</th>
                            <th class="stat-progress"><i class="fa-regular fa-chart-bar"></i></strong> ${pokemon.height} M</th>
                            <th class="stat-evolution"><i class="fas fa-chart-line"></i></strong> ${pokemon.base_experience} Exp</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Weight</td>
                            <td>Height</td>
                            <td>Experience</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="col-md-7">
                <table class="stats-table mt-4">
                    <thead>
                        <tr>
                            <th class="td-bottom stat-name">Stats</th>
                            <th class="td-bottom stat-progress">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="td-bottom">HP</td>
                            <td class="td-bottom">
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated grass progress-bar-label" role="progressbar" style="width: ${pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}%;" aria-valuenow="${pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}" aria-valuemin="0" aria-valuemax="100">${pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}</div>
                                </div>
                            </td>
                            <td><i class="fa-regular fa-heart fa-xl"></i></td>
                        </tr>
                        <tr>
                            <td class="td-bottom ">Attack</td>
                            <td class="td-bottom">
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated fighting progress-bar-label" role="progressbar" style="width: ${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}%;" aria-valuenow="${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}" aria-valuemin="0" aria-valuemax="100">${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}</div>
                                </div>
                            </td>
                            <td><i class="fa-regular fa-sun fa-xl"></i></i></td>
                        </tr>
                        <tr>
                            <td class="td-bottom ">Defense</td>
                            <td class="td-bottom">
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated electric progress-bar-label" role="progressbar" style="width: ${pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat}%;" aria-valuenow="${pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat}" aria-valuemin="0" aria-valuemax="100">${pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat}</div>
                                </div>
                            </td>
                            <td><i class="fa-regular fa-chess-pawn fa-xl"></i></i></td>
                        </tr>
                        <tr>
                            <td class="td-bottom ">Sp. Attack</td>
                            <td class="td-bottom">
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated fire progress-bar-label" role="progressbar" style="width: ${pokemon.stats.find(stat => stat.stat.name === 'special-attack').base_stat}%;" aria-valuenow="${pokemon.stats.find(stat => stat.stat.name === 'special-attack').base_stat}" aria-valuemin="0" aria-valuemax="100">${pokemon.stats.find(stat => stat.stat.name === 'special-attack').base_stat}</div>
                                </div>
                            </td>
                            <td><i class="fa-regular fa-star fa-xl"></i></i></td>
                        </tr>
                        <tr>
                            <td class="td-bottom ">Sp. Defense</td>
                            <td class="td-bottom">
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated ghost progress-bar-label" role="progressbar" style="width: ${pokemon.stats.find(stat => stat.stat.name === 'special-defense').base_stat}%;" aria-valuenow="${pokemon.stats.find(stat => stat.stat.name === 'special-defense').base_stat}" aria-valuemin="0" aria-valuemax="100">${pokemon.stats.find(stat => stat.stat.name === 'special-defense').base_stat}</div>
                                </div>
                            </td>
                            <td><i class="fa-regular fa-gem fa-xl"></i></td>
                        </tr>
                        <tr>
                            <td class="td-bottom ">Speed</td>
                            <td class="td-bottom">
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated dark progress-bar-label" role="progressbar" style="width: ${pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}%;" aria-valuenow="${pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}" aria-valuemin="0" aria-valuemax="100">${pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}</div>
                                </div>
                            </td>
                            <td><i cl<i class="fa-regular fa-hourglass fa-xl"></i></i></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const pokemonModal = new bootstrap.Modal(document.getElementById('pokemonModal'));
    pokemonModal.show();
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