var bcrypt = require('bcrypt');

exports.cryptPassword = async function(password) {
   let salt = await bcrypt.genSalt(10);
   return await bcrypt.hash(password, salt);
};

exports.comparePassword = async function(plainPass, hashword) {
   return await bcrypt.compare(plainPass, hashword);
};