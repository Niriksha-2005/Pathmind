const BASE_URL = 'https://pathmind-awrt.onrender.com/api'

const userId = localStorage.getItem('pathmind_user_id')
const userName = localStorage.getItem('pathmind_user_name')
const rawRoadmap = localStorage.getItem('pathmind_roadmap')
let roadmap = []
try {
  roadmap = rawRoadmap ? JSON.parse(rawRoadmap) : []
} catch (e) {
  roadmap = []
}

if (!userId) {
  window.location.href = 'onboarding.html'
}

document.getElementById('roadmapSubtitle').textContent =
  `Hey ${userName} — here is your personalized week by week plan`

let currentQuiz = null
let currentTopic = null
let currentBtn = null

async function loadProgress() {
  try {
    const response = await fetch(`${BASE_URL}/progress/${userId}`)
    const data = await response.json()
    return data.topics || []
  } catch (err) {
    return []
  }
}

async function startQuiz(topicName, btn) {
  currentTopic = topicName
  currentBtn = btn

  btn.textContent = 'Loading quiz...'
  btn.disabled = true

  try {
    const response = await fetch(`${BASE_URL}/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topicName })
    })

    const data = await response.json()
    currentQuiz = data.questions
    showQuizModal(topicName, data.questions)

  } catch (err) {
    btn.textContent = 'Take quiz to complete'
    btn.disabled = false
    alert('Error loading quiz. Please try again.')
  }
}

function showQuizModal(topic, questions) {
  const modal = document.getElementById('quizModal')
  const modalTitle = document.getElementById('quizTopic')
  const quizBody = document.getElementById('quizBody')

  modalTitle.textContent = `Quiz — ${topic}`
  quizBody.innerHTML = ''

  questions.forEach((q, index) => {
    const questionDiv = document.createElement('div')
    questionDiv.className = 'quiz-question'
    questionDiv.innerHTML = `
      <p class="question-text">${index + 1}. ${q.question}</p>
      <div class="options">
        ${q.options.map((opt, i) => `
          <label class="option-label">
            <input type="radio" name="q${index}" value="${i}">
            ${opt}
          </label>
        `).join('')}
      </div>
    `
    quizBody.appendChild(questionDiv)
  })

  modal.classList.remove('hidden')
  currentBtn.textContent = 'Take quiz to complete'
  currentBtn.disabled = false
}

async function submitQuiz() {
  const answers = []
  const correctAnswers = currentQuiz.map(q => q.correct)

  for (let i = 0; i < currentQuiz.length; i++) {
    const selected = document.querySelector(`input[name="q${i}"]:checked`)
    if (!selected) {
      alert('Please answer all questions before submitting.')
      return
    }
    answers.push(parseInt(selected.value))
  }

  const submitBtn = document.getElementById('submitQuizBtn')
  submitBtn.textContent = 'Submitting...'
  submitBtn.disabled = true

  try {
    const response = await fetch(`${BASE_URL}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        topic_name: currentTopic,
        answers,
        correct_answers: correctAnswers
      })
    })

    const data = await response.json()

    if (data.passed) {
      alert(`✅ ${data.message}`)
      closeQuizModal()
      currentBtn.textContent = 'Completed ✅'
      currentBtn.classList.add('completed')
      currentBtn.disabled = true
      currentBtn.closest('.week-card').classList.add('completed')
    } else {
      alert(`❌ ${data.message}`)
      closeQuizModal()
    }

  } catch (err) {
    alert('Error submitting quiz. Please try again.')
  }

  submitBtn.textContent = 'Submit answers'
  submitBtn.disabled = false
}

function closeQuizModal() {
  document.getElementById('quizModal').classList.add('hidden')
  currentQuiz = null
  currentTopic = null
}

async function renderRoadmap() {
  const container = document.getElementById('roadmapContainer')
  const completedTopics = await loadProgress()
  const completedNames = completedTopics.map(t => t.topic_name)

  if (roadmap.length === 0) {
    container.innerHTML = '<p style="color:#aaa">No roadmap found. Please go back and generate one.</p>'
    return
  }

  roadmap.forEach(week => {
    const isCompleted = completedNames.includes(week.topic)

    const card = document.createElement('div')
    card.className = `week-card ${isCompleted ? 'completed' : ''}`

    card.innerHTML = `
      <div class="week-number">W${week.week}</div>
      <div class="week-info">
        <h3>${week.topic}</h3>
        <p>${week.hours} hours estimated</p>
        <a href="${week.resource_url}" target="_blank">${week.resource_name}</a>
      </div>
      <div class="week-actions">
        <button class="btn-done ${isCompleted ? 'completed' : ''}"
          onclick="startQuiz('${week.topic}', this)"
          ${isCompleted ? 'disabled' : ''}>
          ${isCompleted ? 'Completed ✅' : 'Take quiz to complete'}
        </button>
        <span class="week-hours">Week ${week.week}</span>
      </div>
    `

    container.appendChild(card)
  })
}

renderRoadmap()