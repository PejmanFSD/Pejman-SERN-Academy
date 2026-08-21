// The middleware for assuring the the user's password is strong:
module.exports = function isStrongPassword(password) {
    // The password should have at least 8 characters:
  if (password.length < 8) return false;
  let hasUpperCase = false;
  let hasLowerCase = false;
  let hasNumber = false;
  for (let char of password) {
    // The password should have at least one capital letter:
    if (char >= "A" && char <= "Z") {
      hasUpperCase = true;
    }
    // The password should have at least one small letter:
    else if (char >= "a" && char <= "z") {
      hasLowerCase = true;
    }
    // The password should have at least one number:
    else if (char >= "0" && char <= "9") {
      hasNumber = true;
    }
  }
  // This function/middleware returns a boolean,
  // if ALL the boolean variables are true, this function returns true
  // if even one of them is false, this function returns false
  return hasUpperCase && hasLowerCase && hasNumber;
}