const listPokemon = document.querySelector("#listPokemon");

async function fetchPokemon() {
    for (let i = 1; i <= 999; i++) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
        const data = await response.json();
        createPokemon(data);
    }
}

function createPokemon(pokemon) {
    let types = pokemon.types.map((type) => `<span class="badge ${type.type.name}">${type.type.name}</span>`);
    types = types.join('');

    let pokemonId = pokemon.id.toString().padStart(3, "0");

    const div = document.createElement("div");
    div.classList.add("col-md-4", "mb-4");
    div.innerHTML = `
        <div class="card pokemon-card">
            <img src="${pokemon.sprites.other["official-artwork"].front_default}" class="pokemon-image" alt="${pokemon.name}">
            <div class="card-body">
                <p class="badge pokemon-id">#${pokemonId}</p>
                <h3 class="pokemon-name">${pokemon.name}</h3>
                <p class="pokemon-types">${types}</p>
            </div>
        </div>
    `;
    listPokemon.append(div);
}

fetchPokemon();