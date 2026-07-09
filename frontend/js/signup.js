const BASE_URL = 'https://pathmind-awrt.onrender.com/api'

let extractedSkills = []

document.getElementById('resumeFile').addEventListener('change', async (e) => {
  const file = e.target.files[0]
  if (!file) return

  document.getElementById('uploadText').textContent = 'Analysing your resume...'
  document.getElementById('uploadBox').style.borderColor = '#6c63ff'

  const formData = new FormData()
  formData.append('resume', file)

  try {
    const response = await fetch(`${BASE_URL}/resume/analyse`, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (data.analysis) {
      extractedSkills = data.analysis.skills
      showResumeResult(data.analysis)
      document.getElementById('uploadText').textContent = '✓ Resume analysed successfully'
      document.getElementById('uploadBox').style.borderColor = '#4caf50'
    }

  } catch (err) {
    document.getElementById('uploadText').textContent = 'Error analysing resume. Please try again.'
    document.getElementById('uploadBox').style.borderColor = 'red'
  }
})

function showResumeResult(analysis) {
  const resultDiv = document.getElementById('resumeResult')
  resultDiv.classList.remove('hidden')

  resultDiv.innerHTML = `
    <h4>Resume analysed</h4>
    <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 1rem;">${analysis.summary}</p>
    <p style="font-size: 0.85rem; color: #aaa; margin-bottom: 0.5rem;">Skills detected:</p>
    <div>
      ${analysis.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
    </div>
    <div class="company-section">
      <h5>Companies you can apply to right now:</h5>
      ${analysis.companies.ready_now.map(c => `<span class="skill-tag" style="background:#0d2b1a; color:#4caf50;">${c}</span>`).join('')}
    </div>
    <div class="company-section">
      <h5>With 4 weeks prep:</h5>
      ${analysis.companies.with_4_weeks.map(c => `<span class="skill-tag" style="background:#2b1a0d; color:#ff9800;">${c}</span>`).join('')}
    </div>
    <div class="company-section">
      <h5>Dream goal:</h5>
      ${analysis.companies.dream_goal.map(c => `<span class="skill-tag" style="background:#1a0d2b; color:#9c27b0;">${c}</span>`).join('')}
    </div>
    <div class="company-section">
      <h5>Skill gaps to close:</h5>
      ${analysis.skill_gaps.map(g => `<span class="skill-tag" style="background:#2b0d0d; color:#f44336;">${g}</span>`).join('')}
    </div>
  `
}

async function signup() {
  const name = document.getElementById('name').value.trim()
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value
  const branch = document.getElementById('branch').value
  const goal = document.getElementById('goal').value
  const targetCompany = document.getElementById('targetCompany').value.trim()
  const hoursPerDay = document.getElementById('hoursPerDay').value
  const targetMonths = document.getElementById('targetMonths').value

  if (!name || !email || !password || !branch || !goal || !targetCompany || !hoursPerDay || !targetMonths) {
    alert('Please fill all fields')
    return
  }

  const btn = document.getElementById('signupBtn')
  btn.textContent = 'Creating your account...'
  btn.disabled = true

  try {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, password, branch, goal,
        target_company: targetCompany,
        hours_per_day: parseInt(hoursPerDay),
        target_months: parseInt(targetMonths)
      })
    })

    const data = await response.json()

    if (data.error) {
      alert(data.error)
      btn.textContent = 'Create account and generate roadmap'
      btn.disabled = false
      return
    }

    localStorage.setItem('pathmind_token', data.token)
    localStorage.setItem('pathmind_user_id', data.userId)
    localStorage.setItem('pathmind_user_name', data.name)

    btn.textContent = 'Generating your AI roadmap...'
    
    if (password.length < 8) {
        alert('Password must be at least 8 characters')
        btn.textContent = 'Create account and generate roadmap'
        btn.disabled = false
        return
    }

    if (!/[0-9]/.test(password)) {
        alert('Password must contain at least one number')
        btn.textContent = 'Create account and generate roadmap'
        btn.disabled = false
        return
    }

    if (!/[!@#$%^&*]/.test(password)) {
         alert('Password must contain at least one special character (!@#$%^&*)')
        btn.textContent = 'Create account and generate roadmap'
        btn.disabled = false
        return
    }

    
    const roadmapResponse = await fetch(`${BASE_URL}/roadmap/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: data.userId,
        branch, goal,
        target_company: targetCompany,
        hours_per_day: parseInt(hoursPerDay),
        target_months: parseInt(targetMonths)
      })
    })

    const roadmapData = await roadmapResponse.json()

    if (!roadmapData.roadmap) {
      throw new Error('Roadmap generation failed')
    }

    localStorage.setItem('pathmind_roadmap', JSON.stringify(roadmapData.roadmap))
    localStorage.setItem('pathmind_roadmap_id', roadmapData.roadmap_id)

    window.location.href = 'roadmap.html'

  } catch (err) {
    alert('Error: ' + err.message)
    btn.textContent = 'Create account and generate roadmap'
    btn.disabled = false
  }
}