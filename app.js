const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");

//graphql schema and resolver
const graphqlSchema = require('./graphql/schema/index')
const graphqlResolver= require('./graphql/resolver/index')
const app = express();

app.use(bodyParser.json());

//endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
  })
);

mongoose
  .connect("mongodb://127.0.0.1:27017/bookEvent", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(4000, () => console.log("server is running on port of 4000"));
  })
  .catch((err) => console.log(err));
