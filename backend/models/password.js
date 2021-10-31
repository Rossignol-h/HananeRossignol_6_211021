var passwordValidator = require("password-validator")

const passwordSchema = new passwordValidator()
passwordSchema // 12 à 30 caractères
  .is()
  .min(12)
  .is()
  .max(30)
//.has().uppercase()
//.has().lowercase()
//.has().digits(2)
//.has().symbols()
//.has().not().spaces()
//.is().not().oneOf(["Passw0rd", "Password123"])

module.exports = passwordSchema
