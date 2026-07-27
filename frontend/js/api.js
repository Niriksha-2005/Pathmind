const BASE_URL = 'https://pathmind-awrt.onrender.com/api'

function getToken() {
  return localStorage.getItem('pathmind_token')
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }
}

function checkAuth() {
  const token = getToken()
  const userId = localStorage.getItem('pathmind_user_id')
  if (!token || !userId) {
    window.location.href = 'login.html'
    return false
  }
  return true
}