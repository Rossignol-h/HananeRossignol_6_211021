const User = require("../models/user")
const passwordSchema = require("../models/password")
const bcrypt = require("bcrypt")
const CryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken")
require("dotenv").config()

//-------------------fonction signup: Création d'un user avec hash du MDP -----

exports.signup = (req, res, next) => {
  if (!passwordSchema.validate(req.body.password)) {
    return res.status(403).json({ error: "Mot de passe non securisé !" })
  } else {
    const encryptedEmail = CryptoJS.HmacSHA256(
      req.body.email,
      process.env.SECRET_CRYPTOJS
    ).toString()
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          email: encryptedEmail,
          password: hash,
        })
        user
          .save()
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch(() =>
            res.status(400).json({ message: "Cet Email est déjà utilisé !" })
          )
      })
      .catch((error) => res.status(500).json({ error }))
  }
}

//------------------------- fonction Login: authentification d'un user  ---------
exports.login = (req, res, next) => {
  const encryptedEmail = CryptoJS.HmacSHA256(
    req.body.email,
    process.env.SECRET_CRYPTOJS
  ).toString()
  User.findOne({ email: encryptedEmail })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur inconnu !" })
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" })
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.SECRET_TOKEN, {
              expiresIn: "24h",
            }),
          })
        })
        .catch((error) => res.status(500).json({ error }))
    })
    .catch((error) => res.status(500).json({ error }))
}
