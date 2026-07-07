const BASE_URL = 'https://pathmind-awrt.onrender.com/api'

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