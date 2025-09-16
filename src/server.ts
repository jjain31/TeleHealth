import express from 'express'
const app = express()
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
const PORT = process.env.PORT || 3000

app.get('/health', (req, res) => {
    res.send('Welcome to the Auth User Service')
})
app.listen(PORT, () => {
    console.log(`Auth User Service is running on port ${PORT}`)
})
