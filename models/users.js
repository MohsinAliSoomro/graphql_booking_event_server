const { defaultTypeResolver } = require("graphql");
const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createEvents: [
    {
      type: schema.Types.ObjectId,
      ref: "Event",
    },
  ],
});

module.exports= mongoose.model("User",userSchema)