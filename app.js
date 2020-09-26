const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrptjs = require("bcryptjs");
//mongodb models
const Event = require("./models/events");
const User = require("./models/users");
const app = express();

app.use(bodyParser.json());

const events = (eventids) => {
  return Event.find({ _id: { $in: eventids } })
    .then((event) => {
      return event.map((evt) => {
        return {
          ...evt._doc,
          _id: evt.id,
          creator: user.bind(this, evt.creator),
        };
      });
    })
    .catch((err) => {
      throw err;
    });
};

const user = (userid) => {
  return User.find(userid)
    .then((usr) => {
      return {
        ...usr._doc,
        _id: usr.id,
        createEvent: events.bind(this, usr._doc.createEvent),
      };
    })
    .catch((err) => {
      throw err;
    });
};

//endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
    type Event {
      _id:ID!
      title:String!
      description:String!
      price:Float!
      date:String!
      creator: User!
    }
    type User {
      _id:ID
      email:String!
      password:String
      createEvents: [Event!]
    }
    input EventInput{
      title:String!
      description:String!
      price:Float!
      date:String!
    }

    input UserInput{
      email:String!
      password:String!
    }
    type RootQuery {
        events: [Event!]!
        users: [User!]!
    }

    type RootMutation {
        createEvent(eventInput:EventInput): Event
        createUser(userInput:UserInput): User
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
    `),
    rootValue: {
      users: () => {
        return User.find()
        .then(res=>{
          return {...res._doc,
            _id:res.id,
             createEvents:events(this,events.bind(this,res._doc.createEvents))
            }
        })
          .catch((err) => {
            throw new Error(err);
          });
      },
      events: () => {
        return Event.find()
          .then((res) => {
            return res.map((events) => {
              return {
                ...events._doc,
                _id:events.id,
                creator:user.bind(this,events._doc.creator)
              };
            });
          })
          .catch((err) => {
            throw new Error(err);
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: "5f6f49466f8ba71d5cc0deac",
        });
        let CreateEventCache;
        return event
          .save()
          .then((result) => {
            CreateEventCache = { ...result._doc, _id: result.id };
            return User.findById("5f6f49466f8ba71d5cc0deac");
          })
          .then((user) => {
            if (!user) {
              throw new Event("User Not Found");
            }
            user.createEvents.push(event);
            return user.save();
          })
          .then((res) => {
            return CreateEventCache;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
      createUser: (args) => {
        return User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error("User exit already...");
            }
            return bcrptjs.hash(args.userInput.password, 12);
          })
          .then((hashPassord) => {
            const user = new User({
              email: args.userInput.email,
              password: hashPassord,
            });
            return user
              .save()
              .then((res) => {
                return { ...res._doc, password: null, _id: res.id };
              })
              .catch((err) => {
                console.log(err);
                throw err;
              });
          })
          .catch((err) => {
            throw new Error(err);
          });
      },
    },
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
