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
  return hasUpperCase && hasLowerCase && hasNumber;
}