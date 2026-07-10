const BASE_URL = 'https://pathmind-awrt.onrender.com/api'

function togglePassword(id) {
  const input = document.getElementById(id)
  const icon = input.nextElementSibling.querySelector('svg')
  
  if (input.type === 'password') {
    input.type = 'text'
    icon.setAttribute('stroke', '#6c63ff')
  } else {
    input.type = 'password'
    icon.setAttribute('stroke', '#666')
  }
}

async function login() {
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value

  if (!email || !password) {
    alert('Please fill all fields')
    return
  }

  const btn = document.getElementById('loginBtn')
  btn.textContent = 'Logging in...'
  btn.disabled = true

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (data.error) {
      alert(data.error)
      btn.textContent = 'Login'
      btn.disabled = false
      return
    }

    localStorage.setItem('pathmind_token', data.token)
    localStorage.setItem('pathmind_user_id', data.userId)
    localStorage.setItem('pathmind_user_name', data.name)

    const roadmapResponse = await fetch(`${BASE_URL}/roadmap/generate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`
      }
    })

    window.location.href = 'roadmap.html'

  } catch (err) {
    alert('Error: ' + err.message)
    btn.textContent = 'Login'
    btn.disabled = false
  }
}