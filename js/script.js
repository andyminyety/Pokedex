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
const modalBody = document.getElementById('modalBody');

async function getAllPokemon() {
    const response = await fetch(`${API_BASE_URL}pokemon`);
    const data = await response.json();
    return data.count;
}

async function getPokemonById(pokemonId) {
    const response = await fetch(`${API_BASE_URL}pokemon/${pokemonId}`);
    return response.json();
}

async function getAllPokemonData() {
    const totalPokemonCount = await getAllPokemon();

    for (let i = 1; i <= Math.min(totalPokemonCount, 1010); i++) {
        const pokemonData = await getPokemonById(i);
        ALL_POKEMON_DATA.push(pokemonData);
    }
}

async function getEvolutions(pokemonSpeciesUrl) {
    try {
        const speciesResponse = await fetch(pokemonSpeciesUrl);
        const speciesData = await speciesResponse.json();

        const evolutionChainUrl = speciesData.evolution_chain.url;
        const evolutionChainResponse = await fetch(evolutionChainUrl);
        const evolutionChainData = await evolutionChainResponse.json();

        const evolutions = [];

        const processEvolutions = async (evolutionDetails) => {
            const id = evolutionDetails.species.url.split('/').slice(-2, -1)[0];
            const pokemonResponse = await fetch(`${API_BASE_URL}pokemon/${id}`);
            const pokemonData = await pokemonResponse.json();
            const types = pokemonData.types.map(type => type.type.name);
            evolutions.push({
                id,
                name: evolutionDetails.species.name,
                types,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
            });

            for (const evolution of evolutionDetails.evolves_to) {
                await processEvolutions(evolution);
            }
        };

        await processEvolutions(evolutionChainData.chain);
        return evolutions;
    } catch (error) {
        throw new Error('Error fetching evolutions: ' + error.message);
    }
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
            const pokemonData = await getPokemonById(pokemonId);
            ALL_POKEMON_DATA.push(pokemonData);
            createPokemonCard(pokemonData);
        }
    }

    const previousPageButton = document.getElementById('previousPage');
    const nextPageButton = document.getElementById('nextPage');

    if (currentPage === 1) {
        previousPageButton.classList.add('d-none');
    } else {
        previousPageButton.classList.remove('d-none');
    }

    if (currentPage === totalPages) {
        nextPageButton.classList.add('d-none');
    } else {
        nextPageButton.classList.remove('d-none');
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
        openPokemonDetails(pokemon);
    });

    listPokemon.appendChild(card);
}

async function openPokemonDetails(pokemon) {
    try {
        const types = pokemon.types.map(type => `<span class="badge ${type.type.name}">${type.type.name}</span>`).join('');
        const pokemonId = pokemon.id.toString().padStart(3, '0');
        const totalStats = pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);

        const evolutions = await getEvolutions(pokemon.species.url);

        const evolutionCards = evolutions.map(evolution => {
            const evolutionTypes = evolution.types.map(type => `<span class="badge ${type}">${type}</span>`).join('');
            return `
                <div class="col-md-4 mb-4">
                    <div class="modal-card d-flex flex-column align-items-center" data-bs-toggle="modal" data-bs-target="#pokemonModal" onclick="openEvolutionDetails('${evolution.id}')">
                        <img class="evolutions-image" src="${evolution.image}" alt="${evolution.name}">
                        <div class="card-body">
                            <p class="badge evolutions-id">#${evolution.id.toString().padStart(3, '0')}</p>
                            <h3 class="evolutions-name">${evolution.name}</h3>
                            <p class="evolutions-types">${evolutionTypes}</p>
                        </div>
                    </div>
                </div>
            `;
        });

        const evolutionMessage = evolutions.length <= 1 ? '<p class="no-evolutions">This pokemon does not evolve</p>' : '';

        const evolutionsBody = `
            <div class="container">
                <div class="row justify-content-center">
                    ${evolutionMessage}
                    ${evolutionCards.join('')}
                </div>
            </div>
        `;

        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-5">
                    <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="modal-image">
                    <div class="card-body">
                        <p class="badge pokemon-id">#${pokemonId}</p>
                        <h3 class="pokemon-name">${pokemon.name}</h3>
                        <p class="pokemon-types">${types}</p>
                    </div>
                    <table class="stats-table mt-3">
                        <thead>
                            <tr>
                                <th class="stat-base"><i class="fa-regular fa-life-ring"></i></strong> ${pokemon.weight} Kg</th>
                                <th class="stat-base"><i class="fa-regular fa-chart-bar"></i></strong> ${pokemon.height} M</th>
                                <th class="stat-base"><i class="fas fa-chart-line"></i></strong> ${pokemon.base_experience} Exp</th>
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
                    <h6 class="modal-title mt-3 mb-2">Base Stats</h6>
                    <table class="stats-table">
                        <tbody>
                            <tr>
                                <td class="td-bottom stat-name">HP</td>
                                <td class="td-bottom stat-progress">
                                    <div class="progress" style="height: 20px;">
                                        <div class="progress-bar progress-bar-striped progress-bar-animated grass progress-bar-label" role="progressbar" style="width: ${pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}%;" aria-valuenow="${pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}" aria-valuemin="0" aria-valuemax="100">${pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td class="td-bottom stat-name">Attack</td>
                                <td class="td-bottom stat-progress">
                                    <div class="progress" style="height: 20px;">
                                        <div class="progress-bar progress-bar-striped progress-bar-animated fighting progress-bar-label" role="progressbar" style="width: ${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}%;" aria-valuenow="${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}" aria-valuemin="0" aria-valuemax="100">${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td class="td-bottom stat-name">Defense</td>
                                <td class="td-bottom stat-progress">
                                    <div class="progress" style="height: 20px;">
                                        <div class="progress-bar progress-bar-striped progress-bar-animated electric progress-bar-label" role="progressbar" style="width: ${pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat}%;" aria-valuenow="${pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat}" aria-valuemin="0" aria-valuemax="100">${pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td class="td-bottom stat-name">Sp. Attack</td>
                                <td class="td-bottom stat-progress">
                                    <div class="progress" style="height: 20px;">
                                        <div class="progress-bar progress-bar-striped progress-bar-animated water progress-bar-label" role="progressbar" style="width: ${pokemon.stats.find(stat => stat.stat.name === 'special-attack').base_stat}%;" aria-valuenow="${pokemon.stats.find(stat => stat.stat.name === 'special-attack').base_stat}" aria-valuemin="0" aria-valuemax="100">${pokemon.stats.find(stat => stat.stat.name === 'special-attack').base_stat}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td class="td-bottom stat-name">Sp. Defense</td>
                                <td class="td-bottom stat-progress">
                                    <div class="progress" style="height: 20px;">
                                        <div class="progress-bar progress-bar-striped progress-bar-animated fire progress-bar-label" role="progressbar" style="width: ${pokemon.stats.find(stat => stat.stat.name === 'special-defense').base_stat}%;" aria-valuenow="${pokemon.stats.find(stat => stat.stat.name === 'special-defense').base_stat}" aria-valuemin="0" aria-valuemax="100">${pokemon.stats.find(stat => stat.stat.name === 'special-defense').base_stat}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td class="td-bottom stat-name">Speed</td>
                                <td class="td-bottom stat-progress">
                                    <div class="progress" style="height: 20px;">
                                        <div class="progress-bar progress-bar-striped progress-bar-animated psychic progress-bar-label" role="progressbar" style="width: ${pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}%;" aria-valuenow="${pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}" aria-valuemin="0" aria-valuemax="100">${pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td class="td-bottom stat-name">Total</td>
                                <td class="td-bottom stat-progress">
                                    <div class="progress" style="height: 20px;">
                                        <div class="progress-bar progress-bar-striped progress-bar-animated ghost progress-bar-label" role="progressbar" style="width: ${totalStats}%;" aria-valuenow="${totalStats}" aria-valuemin="0" aria-valuemax="100">${totalStats}</div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-md-12">
                    <h6 class="modal-title mt-3 mb-2">Evolutions</h6>
                        ${evolutionsBody}
                    </div>
                </div>
            </div>
        `;

        const pokemonModal = new bootstrap.Modal(document.getElementById('pokemonModal'));
        pokemonModal.show();
  } catch (error) {
    console.error(error.message);
  }
}

function openEvolutionDetails(evolutionId) {
    const evolution = ALL_POKEMON_DATA.find(pokemon => pokemon.id.toString() === evolutionId);
    if (evolution) {
        openPokemonDetails(evolution);
    }
}

function filterByPokemon() {
    const filterValue = filterInput.value.toLowerCase().trim();

    listPokemon.innerHTML = '';
    let foundPokemon = false;

    for (const pokemon of ALL_POKEMON_DATA) {
        const pokemonName = pokemon.name.toLowerCase();
        const pokemonId = pokemon.id.toString();

        if ((pokemonName.startsWith(filterValue) || pokemonId.startsWith(filterValue)) && 
           (typeFilterActive === 'all' || typeMatch(pokemon, typeFilterActive))) {
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

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        getPokemonForPage(currentPage);
    }
}

function goToPreviousPage() {
    if (currentPage > 1) {
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.classList.remove('d-none');

        currentPage--;
        getPokemonForPage(currentPage);

        loadingSpinner.classList.add('d-none');
    }
}

function goToNextPage() {
    if (currentPage < totalPages) {
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.classList.remove('d-none');

        currentPage++;
        getPokemonForPage(currentPage);

        loadingSpinner.classList.add('d-none');
    }
}

async function initApp() {
    const loadingSpinner = document.getElementById('loadingSpinner');

    loadingSpinner.classList.remove('d-none');

    await getAllPokemonData();
    totalPages = Math.ceil(ALL_POKEMON_DATA.length / POKEMON_PER_PAGE);
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    await getPokemonForPage(currentPage);

    loadingSpinner.classList.add('d-none');

    filterInput.addEventListener('input', filterByPokemon);
    typeFilter.addEventListener('change', filterByPokemon);
}

initApp();