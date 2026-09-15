import './style.css'

const plants = [
  {
    nomCommun: 'Tournesol',
    genre: 'Helianthus',
    espece: 'annuus',
    famille: 'Asteraceae',
    categorie: 'Annuelles',
    image:
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651'
  },
  {
    nomCommun: 'Pissenlit',
    genre: 'Taraxacum',
    espece: 'officinale',
    famille: 'Asteraceae',
    categorie: 'Vivaces',
    image:
      'https://images.unsplash.com/photo-1497250681960-ef046c08a56e'
  }
]

let quizPlants = []
let currentIndex = 0
let answerVisible = false

document.querySelector('#app').innerHTML = `
  <main class="container">

    <section id="home">
      <div class="hero">
        <span class="plant-icon">🌿</span>
        <h1>Quiz végétaux</h1>
        <p>Révise les végétaux de ton BP Aménagements Paysagers.</p>
      </div>

      <div class="quiz-options">
        <h2>Que veux-tu réviser ?</h2>

        <button class="category selected" data-category="all">
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
            .map(
              category => `
                <button class="category" data-category="${category}">
                  ${category}
                </button>
              `
            )
            .join('')}
        </div>

        <button id="startQuiz" class="primary">
          Commencer le quiz
        </button>
      </div>
    </section>

    <section id="quiz" class="hidden">

      <div class="quiz-header">
        <button id="quitQuiz" class="back">
          ← Quitter
        </button>

        <span id="progress"></span>
      </div>

      <div class="card">

        <img id="plantImage" alt="Végétal à identifier">

        <div id="question">
          <p class="question">
            Quel est ce végétal ?
          </p>

          <button id="showAnswer" class="primary">
            Afficher la réponse
          </button>
        </div>

        <div id="answer" class="hidden">

          <h2 id="commonName"></h2>

          <div class="plant-info">
            <p>
              <span>Genre</span>
              <strong id="genus"></strong>
            </p>

            <p>
              <span>Espèce / Cultivar</span>
              <strong id="species"></strong>
            </p>

            <p>
              <span>Famille</span>
              <strong id="family"></strong>
            </p>
          </div>

          <button id="nextPlant" class="primary">
            Végétal suivant →
          </button>

        </div>

      </div>

    </section>

    <section id="finished" class="hidden">
      <div class="finish">
        <span>🌱</span>
        <h2>Révision terminée !</h2>
        <p>Tu as parcouru tous les végétaux de cette sélection.</p>

        <button id="restart" class="primary">
          Recommencer
        </button>
      </div>
    </section>

  </main>
`

let selectedCategory = 'all'

document.querySelectorAll('.category').forEach(button => {
  button.addEventListener('click', () => {
    document
      .querySelectorAll('.category')
      .forEach(btn => btn.classList.remove('selected'))

    button.classList.add('selected')
    selectedCategory = button.dataset.category
  })
})

document.querySelector('#startQuiz').addEventListener('click', () => {
  if (selectedCategory === 'all') {
    quizPlants = [...plants]
  } else {
    quizPlants = plants.filter(
      plant => plant.categorie === selectedCategory
    )
  }

  if (quizPlants.length === 0) {
    alert("Il n'y a encore aucun végétal dans cette catégorie.")
    return
  }

  shuffle(quizPlants)

  currentIndex = 0

  document.querySelector('#home').classList.add('hidden')
  document.querySelector('#quiz').classList.remove('hidden')

  displayPlant()
})

document.querySelector('#showAnswer').addEventListener('click', () => {
  answerVisible = true

  document.querySelector('#question').classList.add('hidden')
  document.querySelector('#answer').classList.remove('hidden')
})

document.querySelector('#nextPlant').addEventListener('click', () => {
  currentIndex++

  if (currentIndex >= quizPlants.length) {
    document.querySelector('#quiz').classList.add('hidden')
    document.querySelector('#finished').classList.remove('hidden')
    return
  }

  displayPlant()
})

document.querySelector('#quitQuiz').addEventListener('click', () => {
  document.querySelector('#quiz').classList.add('hidden')
  document.querySelector('#home').classList.remove('hidden')
})

document.querySelector('#restart').addEventListener('click', () => {
  document.querySelector('#finished').classList.add('hidden')
  document.querySelector('#home').classList.remove('hidden')
})

function displayPlant() {
  const plant = quizPlants[currentIndex]

  answerVisible = false

  document.querySelector('#progress').textContent =
    `${currentIndex + 1} / ${quizPlants.length}`

  document.querySelector('#plantImage').src = plant.image

  document.querySelector('#commonName').textContent =
    plant.nomCommun

  document.querySelector('#genus').textContent =
    plant.genre

  document.querySelector('#species').textContent =
    plant.espece

  document.querySelector('#family').textContent =
    plant.famille

  document.querySelector('#question').classList.remove('hidden')
  document.querySelector('#answer').classList.add('hidden')
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}