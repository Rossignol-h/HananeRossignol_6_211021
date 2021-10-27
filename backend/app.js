const express = require("express")
const app = express()
const cors = require("cors")
const helmet = require("helmet")
const mongoose = require("mongoose")
const sauceRoutes = require("./routes/sauce")
const userRoutes = require("./routes/user")
const path = require("path")
require("dotenv").config()

mongoose
  .connect(process.env.SECRET_DB)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"))

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use("/images", express.static(path.join(__dirname, "images")))
app.use("/api/sauces", sauceRoutes)
app.use("/api/auth", userRoutes)

module.exports = app
