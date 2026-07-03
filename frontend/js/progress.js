const BASE_URL = 'https://pathmind-awrt.onrender.com/api'

const userId = localStorage.getItem('pathmind_user_id')

if (!userId) {
  window.location.href = 'onboarding.html'
}

async function loadProgress() {
  try {
    const response = await fetch(`${BASE_URL}/progress/${userId}`)
    const data = await response.json()

    document.getElementById('progressSubtitle').textContent =
      `You have completed ${data.completed} out of ${data.total_topics} topics`

    document.getElementById('progressPercentage').textContent = `${data.percentage}%`
    document.getElementById('completedCount').textContent = data.completed
    document.getElementById('totalCount').textContent = data.total_topics
    document.getElementById('remainingCount').textContent = data.total_topics - data.completed

    const circle = document.getElementById('progressCircle')
    const degree = (data.percentage / 100) * 360
    circle.style.background = `conic-gradient(#6c63ff ${degree}deg, #222 ${degree}deg)`

    const topicsContainer = document.getElementById('completedTopics')

    if (data.topics.length === 0) {
      topicsContainer.innerHTML = '<p style="color:#aaa">No topics completed yet. Go to your roadmap and start learning.</p>'
      return
    }

    data.topics.forEach(topic => {
      const item = document.createElement('div')
      item.className = 'completed-topic-item'

      const date = new Date(topic.completed_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })

      item.innerHTML = `
        <span class="topic-name">${topic.topic_name}</span>
        <span class="topic-date">${topic.status === 'completed' ? 'Completed on ' + date : topic.status}</span>
      `

      topicsContainer.appendChild(item)
    })

  } catch (err) {
    document.getElementById('progressSubtitle').textContent = 'Error loading progress. Please try again.'
  }
}

loadProgress()