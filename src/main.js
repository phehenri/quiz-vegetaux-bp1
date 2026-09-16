import './style.css'

// ==================================================
// VARIABLES
// ==================================================

let plants = []
let quizPlants = []
let currentIndex = 0
let selectedCategory = 'all'

// ==================================================
// INTERFACE
// ==================================================

document.querySelector('#app').innerHTML = `
  <main class="container">

    <!-- ACCUEIL -->

    <section id="home">

      <div class="hero">
        <span class="plant-icon">🌿</span>

        <h1>Quiz végétaux</h1>

        <p>
          Révise les végétaux de ton BP Aménagements Paysagers.
        </p>
      </div>

      <div class="quiz-options">

        <h2>Que veux-tu réviser ?</h2>

        <button
          class="category selected"
          data-category="all"
        >
          Toute la base
        </button>

        <div class="categories">

          ${[
            'Arbres',
            'Arbustes',
            'Conifères',
            'Plantes grimpantes',
            'Plantes de terre de bruyère',
            'Vivaces',
            'Annuelles',
            'Bisannuelles'
          ]
            .map(category => `
              <button
                class="category"
                data-category="${category}"
              >
                ${category}
              </button>
            `)
            .join('')}

        </div>

        <button
          id="startQuiz"
          class="primary"
          disabled
        >
          Chargement...
        </button>

      </div>

    </section>


    <!-- QUIZ -->

    <section id="quiz" class="hidden">

      <div class="quiz-header">

        <button id="quitQuiz" class="back">
          ← Quitter
        </button>

        <span id="progress"></span>

      </div>

      <div class="card">

        <img
          id="plantImage"
          alt="Végétal à identifier"
        >

        <!-- QUESTION -->

        <div id="question">

          <p class="question">
            Quel est ce végétal ?
          </p>

          <button
            id="showAnswer"
            class="primary"
          >
            Afficher la réponse
          </button>

        </div>


        <!-- RÉPONSE -->

        <div id="answer" class="hidden">

          <h2 id="commonName"></h2>

          <div class="plant-info">

            <p id="categoryRow">
              <span>Catégorie</span>
              <strong id="categorie"></strong>
            </p>

            <p id="genusRow">
              <span>Genre</span>
              <strong id="genus"></strong>
            </p>

            <p id="speciesRow">
              <span>Espèce / Cultivar</span>
              <strong id="species"></strong>
            </p>

            <p id="familyRow">
              <span>Famille</span>
              <strong id="family"></strong>
            </p>

            <p id="expositionRow">
              <span>Exposition</span>
              <strong id="exposition"></strong>
            </p>

            <p id="floraisonRow">
              <span>Mois de floraison</span>
              <strong id="floraison"></strong>
            </p>

            <p id="persistanceRow">
              <span>Persistance du feuillage</span>
              <strong id="persistance"></strong>
            </p>

          </div>

          <button
            id="nextPlant"
            class="primary"
          >
            Végétal suivant →
          </button>

        </div>

      </div>

    </section>


    <!-- FIN -->

    <section id="finished" class="hidden">

      <div class="finish">

        <span>🌱</span>

        <h2>Révision terminée !</h2>

        <p>
          Tu as parcouru tous les végétaux de cette sélection.
        </p>

        <button
          id="restart"
          class="primary"
        >
          Recommencer
        </button>

      </div>

    </section>

  </main>
`

// ==================================================
// CHARGEMENT DE NOTION
// ==================================================

async function loadPlants() {
  const startButton =
    document.querySelector('#startQuiz')

  try {
    const response = await fetch('/api/plants', {
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(
        `Erreur API : ${response.status}`
      )
    }

    plants = await response.json()

    console.log(
      'Végétaux reçus depuis Notion :',
      plants
    )

    startButton.disabled = false
    startButton.textContent = 'Commencer le quiz'

  } catch (error) {
    console.error(error)

    startButton.textContent =
      'Erreur de chargement'

    alert(
      "Impossible de charger les végétaux depuis Notion."
    )
  }
}

loadPlants()

// ==================================================
// CHOIX DE LA CATÉGORIE
// ==================================================

document
  .querySelectorAll('.category')
  .forEach(button => {

    button.addEventListener('click', () => {

      document
        .querySelectorAll('.category')
        .forEach(btn => {
          btn.classList.remove('selected')
        })

      button.classList.add('selected')

      selectedCategory =
        button.dataset.category
    })

  })

// ==================================================
// COMMENCER LE QUIZ
// ==================================================

document
  .querySelector('#startQuiz')
  .addEventListener('click', () => {

    if (plants.length === 0) {
      alert(
        "Les végétaux ne sont pas encore chargés."
      )

      return
    }

    if (selectedCategory === 'all') {

      quizPlants = [...plants]

    } else {

      quizPlants = plants.filter(plant => {

        return plant.categories?.includes(
          selectedCategory
        )

      })

    }

    if (quizPlants.length === 0) {

      alert(
        "Il n'y a encore aucun végétal dans cette catégorie."
      )

      return
    }

    shuffle(quizPlants)

    currentIndex = 0

    document
      .querySelector('#home')
      .classList.add('hidden')

    document
      .querySelector('#finished')
      .classList.add('hidden')

    document
      .querySelector('#quiz')
      .classList.remove('hidden')

    displayPlant()
  })

// ==================================================
// AFFICHER LA RÉPONSE
// ==================================================

document
  .querySelector('#showAnswer')
  .addEventListener('click', () => {

    document
      .querySelector('#question')
      .classList.add('hidden')

    document
      .querySelector('#answer')
      .classList.remove('hidden')

  })

// ==================================================
// VÉGÉTAL SUIVANT
// ==================================================

document
  .querySelector('#nextPlant')
  .addEventListener('click', () => {

    currentIndex++

    if (currentIndex >= quizPlants.length) {

      document
        .querySelector('#quiz')
        .classList.add('hidden')

      document
        .querySelector('#finished')
        .classList.remove('hidden')

      return
    }

    displayPlant()
  })

// ==================================================
// QUITTER
// ==================================================

document
  .querySelector('#quitQuiz')
  .addEventListener('click', () => {

    document
      .querySelector('#quiz')
      .classList.add('hidden')

    document
      .querySelector('#home')
      .classList.remove('hidden')

  })

// ==================================================
// RECOMMENCER
// ==================================================

document
  .querySelector('#restart')
  .addEventListener('click', () => {

    document
      .querySelector('#finished')
      .classList.add('hidden')

    document
      .querySelector('#home')
      .classList.remove('hidden')

  })

// ==================================================
// AFFICHER UNE PLANTE
// ==================================================

function displayPlant() {
  const plant = quizPlants[currentIndex]

  // Progression

  document.querySelector('#progress').textContent =
    `${currentIndex + 1} / ${quizPlants.length}`

  // Photo

  const image =
    document.querySelector('#plantImage')

  if (plant.photos?.length > 0) {

    image.src = plant.photos[0]
    image.style.display = ''

  } else {

    image.removeAttribute('src')
    image.style.display = 'none'

  }

  // Nom commun

  document.querySelector(
    '#commonName'
  ).textContent =
    plant.nomCommun || ''

  // Catégorie

  setInfo(
    'categoryRow',
    'categorie',
    plant.categorie
  )

  // Genre

  setInfo(
    'genusRow',
    'genus',
    plant.genre
  )

  // Espèce / Cultivar

  setInfo(
    'speciesRow',
    'species',
    plant.espece
  )

  // Famille

  setInfo(
    'familyRow',
    'family',
    plant.famille
  )

  // Exposition

  setInfo(
    'expositionRow',
    'exposition',
    plant.exposition
  )

  // Floraison

  setInfo(
    'floraisonRow',
    'floraison',
    plant.floraison
  )

  // Persistance

  setInfo(
    'persistanceRow',
    'persistance',
    plant.persistance
  )

  // Question visible

  document
    .querySelector('#question')
    .classList.remove('hidden')

  // Réponse cachée

  document
    .querySelector('#answer')
    .classList.add('hidden')
}

// ==================================================
// AFFICHER / MASQUER UNE INFORMATION
// ==================================================

function setInfo(rowId, valueId, value) {
  const row =
    document.querySelector(`#${rowId}`)

  const element =
    document.querySelector(`#${valueId}`)

  let text = ''

  if (Array.isArray(value)) {
    text = value.join(', ')
  } else {
    text = value || ''
  }

  element.textContent = text

  // Si la propriété n'est pas encore renseignée
  // dans Notion, on masque toute la ligne.

  if (text.trim() === '') {
    row.style.display = 'none'
  } else {
    row.style.display = ''
  }
}

// ==================================================
// MÉLANGER LES VÉGÉTAUX
// ==================================================

function shuffle(array) {
  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j = Math.floor(
      Math.random() * (i + 1)
    )

    ;[array[i], array[j]] =
      [array[j], array[i]]
  }
}