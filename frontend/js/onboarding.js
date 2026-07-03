const BASE_URL = 'https://pathmind-awrt.onrender.com/api'

let extractedSkills = []

// Upload button click → triggers file input
document.getElementById('uploadBtn').addEventListener('click', () => {
  const input = document.getElementById('resumeFile')
  input.value = ''
  input.click()
})

// File selected → analyse resume
document.getElementById('resumeFile').addEventListener('change', async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const uploadBox = document.getElementById('uploadBox')
  uploadBox.innerHTML = '<p>Analysing your resume...</p>'

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
      uploadBox.innerHTML = '<p style="color: #6c63ff;">✓ Resume analysed successfully</p>'
    }

  } catch (err) {
    uploadBox.innerHTML = '<p style="color: red;">Error analysing resume. Please try again.</p>'
    console.log('Resume error:', err)
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

async function generateRoadmap() {
  const name = document.getElementById('name').value.trim()
  const email = document.getElementById('email').value.trim()
  const branch = document.getElementById('branch').value
  const goal = document.getElementById('goal').value
  const targetCompany = document.getElementById('targetCompany').value.trim()
  const hoursPerDay = document.getElementById('hoursPerDay').value
  const targetMonths = document.getElementById('targetMonths').value

  if (!name || !email || !branch || !goal || !targetCompany || !hoursPerDay || !targetMonths) {
    alert('Please fill all fields')
    return
  }

  const btn = document.getElementById('generateBtn')
  btn.textContent = 'Creating your account...'
  btn.disabled = true

  try {
    const userPayload = {
      name,
      email,
      branch,
      goal,
      target_company: targetCompany,
      hours_per_day: parseInt(hoursPerDay),
      target_months: parseInt(targetMonths)
    }

    const userResponse = await fetch(`${BASE_URL}/users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload)
    })

    const userData = await userResponse.json()
    console.log('User created:', userData)

    if (!userData.userId) {
      throw new Error('User creation failed: ' + JSON.stringify(userData))
    }

    const userId = userData.userId
    localStorage.setItem('pathmind_user_id', userId)
    localStorage.setItem('pathmind_user_name', name)

    btn.textContent = 'Generating your AI roadmap...'

    const roadmapPayload = {
      user_id: userId,
      branch,
      goal,
      target_company: targetCompany,
      hours_per_day: parseInt(hoursPerDay),
      target_months: parseInt(targetMonths)
    }

    const roadmapResponse = await fetch(`${BASE_URL}/roadmap/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roadmapPayload)
    })

    const roadmapData = await roadmapResponse.json()
    console.log('Roadmap generated:', roadmapData)

    if (!roadmapData.roadmap) {
      throw new Error('Roadmap generation failed: ' + JSON.stringify(roadmapData))
    }

    localStorage.setItem('pathmind_roadmap', JSON.stringify(roadmapData.roadmap))
    localStorage.setItem('pathmind_roadmap_id', roadmapData.roadmap_id)

    window.location.href = 'roadmap.html'

  } catch (err) {
    console.log('Error:', err.message)
    alert('Error: ' + err.message)
    btn.textContent = 'Generate my roadmap'
    btn.disabled = false
  }
}