const express = require(`express`)
const app = express()
const PORT = 8000
const bodyParser = require('body-parser')
const cors = require(`cors`)
// const auth = require(`./routes/auth.routes`)

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(__dirname))
// app.use(`/auth`, auth)


const userRoute = require(`./routes/user.routes`)
app.use(`/user`, userRoute)

const menuRoute = require(`./routes/menu.routes`)
app.use(`/menu`, menuRoute)

const mejaRoute = require(`./routes/meja.routes`)
app.use(`/meja`, mejaRoute)

const transaksiRoute = require(`./routes/transaksi.routes`)
app.use(`/transaksi`, transaksiRoute)


app.listen(PORT, () => {
  console.log(`Server of cafe runs on port
  ${PORT}`)
})