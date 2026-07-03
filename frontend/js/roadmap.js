const BASE_URL = 'https://pathmind-awrt.onrender.com/api'

const userId = localStorage.getItem('pathmind_user_id')
const userName = localStorage.getItem('pathmind_user_name')
// let roadmap = JSON.parse(localStorage.getItem('pathmind_roadmap') || '[]')
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

async function loadProgress() {
  try {
    const response = await fetch(`${BASE_URL}/progress/${userId}`)
    const data = await response.json()
    return data.topics || []
  } catch (err) {
    return []
  }
}

async function markDone(topicName, btn) {
  try {
    btn.textContent = 'Marking...'
    btn.disabled = true

    await fetch(`${BASE_URL}/progress/mark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, topic_name: topicName })
    })

    btn.textContent = 'Completed'
    btn.classList.add('completed')
    btn.closest('.week-card').classList.add('completed')

  } catch (err) {
    btn.textContent = 'Mark as done'
    btn.disabled = false
  }
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
          onclick="markDone('${week.topic}', this)"
          ${isCompleted ? 'disabled' : ''}>
          ${isCompleted ? 'Completed' : 'Mark as done'}
        </button>
        <span class="week-hours">Week ${week.week}</span>
      </div>
    `

    container.appendChild(card)
  })
}

renderRoadmap()