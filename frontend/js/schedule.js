const BASE_URL = 'http://localhost:5000/api'

const userId = localStorage.getItem('pathmind_user_id')

if (!userId) {
  window.location.href = 'onboarding.html'
}

async function getSchedule(minutes) {
  document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'))
  event.target.classList.add('active')

  const resultDiv = document.getElementById('scheduleResult')
  resultDiv.innerHTML = '<p style="color:#aaa; text-align:center;">Building your plan...</p>'

  try {
    const response = await fetch(`${BASE_URL}/schedule/today`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, available_minutes: minutes })
    })

    const data = await response.json()
    renderSchedule(data)

  } catch (err) {
    resultDiv.innerHTML = '<p style="color:red; text-align:center;">Error loading schedule. Please try again.</p>'
  }
}

function renderSchedule(data) {
  const resultDiv = document.getElementById('scheduleResult')

  if (!data.task) {
    resultDiv.innerHTML = `<p style="color:#4caf50; text-align:center; font-size:1.1rem;">${data.message}</p>`
    return
  }

  let html = `<div class="schedule-message">${data.message}</div>`

  if (Array.isArray(data.task) && data.task[0] && data.task[0].session) {
    data.task.forEach(block => {
      html += `<div class="session-block">`
      html += `<div class="session-title">${block.session}</div>`
      block.topics.forEach(t => {
        html += renderTaskCard(t)
      })
      html += `</div>`
    })
  } else {
    data.task.forEach(t => {
      html += renderTaskCard(t)
    })
  }

  resultDiv.innerHTML = html
}

function renderTaskCard(t) {
  if (t.topic === 'Rest') {
    return `
      <div class="task-card" style="border-color:#4caf50;">
        <h4 style="color:#4caf50;">Break time</h4>
        <p>${t.instruction}</p>
      </div>
    `
  }

  return `
    <div class="task-card">
      <h4>${t.topic}</h4>
      <p>${t.instruction}</p>
      ${t.resource_url ? `<a href="${t.resource_url}" target="_blank">${t.resource_name}</a>` : ''}
      ${t.suggested_minutes ? `<div class="task-time">${t.suggested_minutes} mins</div>` : ''}
    </div>
  `
}