  const mongoose = require("mongoose");
  const Schema = mongoose.Schema;

  module.exports = {
    Blog: require("./blogModel"),
    User: require("./userModel"),
  };

  



