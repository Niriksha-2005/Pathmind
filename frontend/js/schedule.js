const BASE_URL = 'https://pathmind-awrt.onrender.com/api'

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
    loadMockQuestions()

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

async function loadMockQuestions() {
  const mockDiv = document.getElementById('mockQuestions')
  mockDiv.innerHTML = '<p style="color:#aaa; text-align:center;">Loading interview questions...</p>'

  try {
    const response = await fetch(`${BASE_URL}/quiz/mock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })

    const data = await response.json()

    if (data.error) {
      mockDiv.innerHTML = '<p style="color:#aaa;">No mock questions available yet.</p>'
      return
    }

    let html = `
      <div class="mock-header">
        <h3>🎯 Mock Interview Practice</h3>
        <p style="color:#aaa; font-size:0.9rem;">Topic: ${data.topic}</p>
      </div>
    `

    data.questions.forEach((q, index) => {
      html += `
        <div class="mock-card">
          <p class="mock-question">Q${index + 1}. ${q.question}</p>
          <p class="mock-hint">💡 Hint: ${q.hint}</p>
          <button class="btn-secondary show-answer-btn" onclick="toggleAnswer(${index})">
            Show Answer
          </button>
          <div class="mock-answer hidden" id="answer-${index}">
            <p>${q.answer}</p>
          </div>
        </div>
      `
    })

    mockDiv.innerHTML = html

  } catch (err) {
    mockDiv.innerHTML = '<p style="color:#aaa;">Error loading questions.</p>'
  }
}

function toggleAnswer(index) {
  const answerDiv = document.getElementById(`answer-${index}`)
  const btn = answerDiv.previousElementSibling

  if (answerDiv.classList.contains('hidden')) {
    answerDiv.classList.remove('hidden')
    btn.textContent = 'Hide Answer'
  } else {
    answerDiv.classList.add('hidden')
    btn.textContent = 'Show Answer'
  }
}