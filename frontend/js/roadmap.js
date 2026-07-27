const BASE_URL = 'https://pathmind-awrt.onrender.com/api'

const userId = localStorage.getItem('pathmind_user_id')
const userName = localStorage.getItem('pathmind_user_name')
const token = localStorage.getItem('pathmind_token')
const rawRoadmap = localStorage.getItem('pathmind_roadmap')

let roadmap = []
try {
  roadmap = rawRoadmap ? JSON.parse(rawRoadmap) : []
} catch (e) {
  roadmap = []
}

// Auth check — redirect to login if not logged in
if (!userId || !token) {
  window.location.href = 'login.html'
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

document.getElementById('roadmapSubtitle').textContent =
  `Hey ${userName} — here is your personalized week by week plan`

let currentQuiz = null
let currentTopic = null
let currentBtn = null
let currentDifficulty = 'medium'
let isPracticeMode = false

async function loadProgress() {
  try {
    const response = await fetch(`${BASE_URL}/progress/${userId}`, {
      headers: authHeaders()
    })
    const data = await response.json()
    return data.topics || []
  } catch (err) {
    return []
  }
}

async function startQuiz(topicName, btn) {
  currentTopic = topicName
  currentBtn = btn
  isPracticeMode = false

  btn.textContent = 'Loading quiz...'
  btn.disabled = true

  try {
    const response = await fetch(`${BASE_URL}/quiz/generate`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        topic: topicName,
        user_id: userId
      })
    })

    const data = await response.json()
    currentQuiz = data.questions
    currentDifficulty = data.difficulty
    showQuizModal(topicName, data.questions, data.difficulty)

  } catch (err) {
    console.log('Quiz error:', err)
    btn.textContent = 'Take quiz to complete'
    btn.disabled = false
    alert('Error loading quiz. Please try again.')
  }
}

async function practiceQuiz(topicName, btn) {
  currentTopic = topicName
  currentBtn = btn
  isPracticeMode = true

  btn.textContent = 'Loading...'
  btn.disabled = true

  try {
    const response = await fetch(`${BASE_URL}/quiz/generate`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        topic: topicName,
        user_id: userId
      })
    })

    const data = await response.json()
    currentQuiz = data.questions
    currentDifficulty = data.difficulty
    showQuizModal(topicName, data.questions, data.difficulty)

  } catch (err) {
    btn.textContent = 'Practice again'
    btn.disabled = false
    alert('Error loading quiz. Please try again.')
  } finally {
    btn.textContent = 'Practice again'
    btn.disabled = false
  }
}

async function showMoreResources(topic) {
  try {
    const response = await fetch(`${BASE_URL}/resources/${encodeURIComponent(topic)}`)
    const data = await response.json()

    const modal = document.getElementById('quizModal')
    const modalTitle = document.getElementById('quizTopic')
    const quizBody = document.getElementById('quizBody')
    const footer = document.querySelector('.quiz-footer')

    modalTitle.textContent = `Resources — ${topic}`
    footer.style.display = 'none'

    if (!data.resources || data.resources.length === 0) {
      quizBody.innerHTML = '<p style="color:#aaa; text-align:center;">No additional resources found for this topic.</p>'
    } else {
      quizBody.innerHTML = data.resources.map(r => `
        <div class="resource-card">
          <span class="resource-badge ${r.is_free ? 'free' : 'paid'}">${r.is_free ? 'Free' : 'Paid'}</span>
          <span class="resource-type-badge">${r.resource_type}</span>
          <a href="${r.resource_url}" target="_blank" class="resource-card-link">${r.resource_name}</a>
        </div>
      `).join('')
    }

    modal.classList.remove('hidden')

  } catch (err) {
    alert('Error loading resources.')
  }
}

function showQuizModal(topic, questions, difficulty) {
  const modal = document.getElementById('quizModal')
  const modalTitle = document.getElementById('quizTopic')
  const quizBody = document.getElementById('quizBody')
  const footer = document.querySelector('.quiz-footer')

  footer.style.display = 'block'

  const difficultyColor = difficulty === 'hard' ? '#f44336' : difficulty === 'easy' ? '#4caf50' : '#ff9800'

  modalTitle.innerHTML = `Quiz — ${topic} <span style="font-size:0.8rem; padding:2px 10px; border-radius:20px; background:${difficultyColor}22; color:${difficultyColor};">${difficulty}</span>`

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
  currentBtn.textContent = isPracticeMode ? 'Practice again' : 'Take quiz to complete'
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
      headers: authHeaders(),
      body: JSON.stringify({
        user_id: userId,
        topic_name: currentTopic,
        answers,
        correct_answers: correctAnswers,
        difficulty: currentDifficulty,
        practice_mode: isPracticeMode
      })
    })

    const data = await response.json()

    if (isPracticeMode) {
      closeQuizModal()
      isPracticeMode = false

      if (data.score === 3) {
        alert(`🔥 Perfect score! ${data.score}/3 on ${currentDifficulty} difficulty. Next practice will be harder!`)
      } else if (data.score >= 2) {
        alert(`✅ Good job! ${data.score}/3 on ${currentDifficulty} difficulty. Keep practicing!`)
      } else {
        alert(`📚 You got ${data.score}/3 on ${currentDifficulty} difficulty. Next practice will be easier. Keep trying!`)
      }

    } else {
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
    }

  } catch (err) {
    alert('Error submitting quiz. Please try again.')
  }

  submitBtn.textContent = 'Submit answers'
  submitBtn.disabled = false
  isPracticeMode = false
}

function closeQuizModal() {
  document.getElementById('quizModal').classList.add('hidden')
  document.querySelector('.quiz-footer').style.display = 'block'
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
        <div class="resource-links">
          <a href="${week.resource_url}" target="_blank" class="resource-link free">
            <span class="resource-badge free">Free</span>
            ${week.resource_name}
          </a>
          <span class="more-resources-btn" onclick="showMoreResources('${week.topic}')">
            + More resources
          </span>
        </div>
      </div>
      <div class="week-actions">
        ${isCompleted ? `
          <button class="btn-done completed" disabled>Completed ✅</button>
          <button class="btn-practice" onclick="practiceQuiz('${week.topic}', this)">Practice again</button>
        ` : `
          <button class="btn-done" onclick="startQuiz('${week.topic}', this)">Take quiz to complete</button>
        `}
        <span class="week-hours">Week ${week.week}</span>
      </div>
    `

    container.appendChild(card)
  })
}

renderRoadmap()