function toggleTheme() {
  const body = document.body
  const toggle = document.getElementById('themeToggle')

  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode')
    if (toggle) toggle.checked = false
    localStorage.setItem('pathmind_theme', 'dark')
  } else {
    body.classList.add('light-mode')
    if (toggle) toggle.checked = true
    localStorage.setItem('pathmind_theme', 'light')
  }
}

function loadTheme() {
  const saved = localStorage.getItem('pathmind_theme')
  const toggle = document.getElementById('themeToggle')

  if (saved === 'light') {
    document.body.classList.add('light-mode')
    if (toggle) toggle.checked = true
  } else {
    document.body.classList.remove('light-mode')
    if (toggle) toggle.checked = false
  }
}

loadTheme()