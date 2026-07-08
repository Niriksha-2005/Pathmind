const NOTIF_BASE_URL = 'https://pathmind-awrt.onrender.com/api'
const userId = localStorage.getItem('pathmind_user_id')

async function loadNotifications() {
  if (!userId) return

  try {
    const response = await fetch(`${NOTIF_BASE_URL}/notifications/${userId}`)
    const data = await response.json()

    if (!data.notifications) return

    const dropdown = document.getElementById('notificationDropdown')
    const count = document.getElementById('notifCount')

    count.textContent = data.notifications.length

    dropdown.innerHTML = data.notifications.map(n => `
      <div class="notif-item ${n.type}">
        <span class="notif-icon">${n.icon}</span>
        <span>${n.message}</span>
      </div>
    `).join('')

  } catch (err) {
    console.log('Notification error:', err)
  }
}

function toggleNotifications() {
  const dropdown = document.getElementById('notificationDropdown')
  dropdown.classList.toggle('hidden')
}

document.addEventListener('click', (e) => {
  const bell = document.getElementById('notificationBell')
  const dropdown = document.getElementById('notificationDropdown')
  if (!bell.contains(e.target)) {
    dropdown.classList.add('hidden')
  }
})

loadNotifications()