const multer = require('multer')
const Groq = require('groq-sdk')
const fs = require('fs')
const { PdfReader } = require('pdfreader')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

const extractTextFromPdf = (filePath) => {
  return new Promise((resolve, reject) => {
    let text = ''
    new PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) reject(err)
      else if (!item) resolve(text)
      else if (item.text) text += item.text + ' '
    })
  })
}

const analyseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const resumeText = await extractTextFromPdf(req.file.path)

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `
          You are a resume analyser for Indian students.
          
          Analyse this resume text and extract the following:
          1. Technical skills
          2. Programming languages known
          3. Projects built
          4. Overall skill level (beginner, intermediate, advanced)
          
          Also suggest which companies this student can apply to right now based on their skills:
          - Ready now: companies they can apply to immediately
          - With 4 weeks prep: companies they can reach soon
          - Dream goal: companies that need more preparation
          
          Also identify skill gaps for product based companies like Google, Microsoft, Amazon.
          
          Resume text:
          ${resumeText}
          
          Return ONLY a JSON object with no extra text, no markdown, no explanation.
          
          Format exactly like this:
          {
            "skills": ["skill1", "skill2"],
            "languages": ["language1", "language2"],
            "projects": ["project1", "project2"],
            "skill_level": "beginner/intermediate/advanced",
            "companies": {
              "ready_now": ["company1", "company2"],
              "with_4_weeks": ["company1", "company2"],
              "dream_goal": ["company1", "company2"]
            },
            "skill_gaps": ["gap1", "gap2"],
            "summary": "one line summary of the student profile"
          }
          `
        }
      ]
    })

    let text = completion.choices[0].message.content
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    const analysis = JSON.parse(text)

    fs.unlinkSync(req.file.path)

    res.json({
      message: 'Resume analysed successfully',
      analysis: analysis
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { upload, analyseResume }