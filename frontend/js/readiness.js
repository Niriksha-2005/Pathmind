const BASE_URL = 'https://pathmind-awrt.onrender.com/api'
const userId = localStorage.getItem('pathmind_user_id')

if (!userId) {
  window.location.href = 'onboarding.html'
}

const levelColors = {
  'Interview ready': '#4caf50',
  'Getting there': '#8bc34a',
  'In progress': '#ff9800',
  'Early stage': '#ff5722',
  'Just starting': '#f44336'
}

async function loadReadiness() {
  try {
    const response = await fetch(`${BASE_URL}/readiness/${userId}`)
    const data = await response.json()

    document.getElementById('readinessSubtitle').textContent =
      `Your readiness for ${data.target_company}`

    const color = levelColors[data.level] || '#6c63ff'
    const degree = (data.readiness_score / 100) * 360

    const card = document.getElementById('readinessCard')

    card.innerHTML = `
      <div class="score-display" style="background: conic-gradient(${color} ${degree}deg, #222 ${degree}deg);">
        <div class="score-inner">
          <span class="score-number" style="color:${color}">${data.readiness_score}%</span>
          <span class="score-label">readiness</span>
        </div>
      </div>

      <div class="level-badge" style="background:${color}22; color:${color}; border:1px solid ${color};">
        ${data.level}
      </div>

      <p class="readiness-message">${data.message}</p>

      <div class="readiness-suggestion">
        <strong>Suggestion:</strong> ${data.suggestion}
      </div>

      <div class="readiness-stats-row">
        <div class="readiness-stat">
          <h4>${data.completed_topics}</h4>
          <p>Completed</p>
        </div>
        <div class="readiness-stat">
          <h4>${data.total_topics}</h4>
          <p>Total topics</p>
        </div>
        <div class="readiness-stat">
          <h4>${data.completion_percentage}%</h4>
          <p>Syllabus done</p>
        </div>
      </div>
    `

  } catch (err) {
    document.getElementById('readinessSubtitle').textContent = 'Error loading readiness score'
  }
}

loadReadiness()