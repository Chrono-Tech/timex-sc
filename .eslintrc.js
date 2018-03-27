module.exports = {
  "root": true,
  "extends": "standard",
  env: {
    node: true,
    mocha: true
  },
  "plugins": [
    "mocha",
    "chai-friendly"
  ],
  "rules": {
    "mocha/no-exclusive-tests": "error",
    "no-unused-expressions": 0,
    "chai-friendly/no-unused-expressions": 2
  }
}
