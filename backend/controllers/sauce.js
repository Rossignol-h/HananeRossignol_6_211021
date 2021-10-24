const Sauce = require("../models/sauce")
const fs = require("fs")
//----------------------------- Middleware POST ----------------------------------
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce)
  delete sauceObject._id
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  })
  sauce
    .save()
    .then(() => res.status(201).json({ message: "La sauce est enregistrée !" }))
    .catch((error) => res.status(400).json({ error }))
}
//----------------------------- Middleware GET ----------------------------------
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }))
}
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }))
}
//----------------------------- Middleware PUT ----------------------------------

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body }
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "La sauce est modifiée !" }))
    .catch(error => res.status(400).json({ error }));
}
//------------------------ Middleware POST likes / dislikes ----------------------

exports.likeOneSauce = (req, res) => {
  let userClic = req.body.like
  let sauceId = req.params.id
  let userId = req.body.userId
  if (userClic === -1) {
    Sauce.updateOne(
      { _id: sauceId },
      {
        $inc: { dislikes: 1 },
        $push: { usersDisliked: userId },
      }
    )
      .then(() =>
        res.status(200).json({ message: "Vous n'aimez pas cette sauce" })
      )
      .catch((error) => res.status(400).json({ error }))
  } else if (userClic === 1) {
    Sauce.updateOne(
      { _id: sauceId },
      {
        $inc: { likes: 1 },
        $push: { usersLiked: userId },
      }
    )
      .then(() => res.status(200).json({ message: "Vous aimez cette sauce" }))
      .catch((error) => res.status(400).json({ error }))
  } else {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: userId },
            }
          )
            .then(() =>
              res.status(200).json({ message: "Vous avez annulé votre choix" })
            )
            .catch((error) => res.status(400).json({ error }))
        } else {
          Sauce.updateOne(
            { _id: sauceId },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: userId },
            }
          )
            .then(() =>
              res.status(200).json({ message: "Vous avez annulé votre choix" })
            )
            .catch((error) => res.status(400).json({ error }))
        }
      })
      .catch((error) => res.status(404).json({ error }))
  }
}
//---------------------------------- Middleware DELETE ---------------------------

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1]
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() =>
            res.status(200).json({ message: "La sauce est supprimée !" })
          )
          .catch((error) => res.status(400).json({ error }))
      })
    })
    .catch((error) => res.status(500).json({ error }))
}
