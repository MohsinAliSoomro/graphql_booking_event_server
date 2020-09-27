const bcrptjs = require("bcryptjs");

//models
const Event = require("../../models/events");
const User = require("../../models/users");

const events = async (eventids) => {
  try {
    const event = await Event.find({ _id: { $in: eventids } });
    event.map((evt) => {
      return {
        ...evt._doc,
        _id: evt.id,
        date: new Date(evt._doc.date).toISOString(),
        creator: user.bind(this, evt.creator),
      };
    });
    return event;
  } catch (err) {
    throw err;
  }
};

const user = async (userid) => {
  try {
    const usr = await User.findById(userid);
    return {
      ...usr._doc,
      _id: usr.id,
      password: null,
      createEvents: events.bind(this, usr._doc.createEvents),
    };
  } catch (error) {}
};

module.exports = {
  users: async () => {
    try {
      const res = await User.find();
      return {
        ...res._doc,
        _id: res.id,
        createEvents: events.bind(this, res._doc.createEvents),
      };
    } catch (err) {
      throw new Error(err);
    }
  },
  events: async () => {
    try {
      const res = await Event.find();
      return res.map((event) => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator),
        };
      });
    } catch (err) {
      throw new Error(err);
    }
  },
  createEvent: async (args) => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "5f6f49466f8ba71d5cc0deac",
    });
    let CreateEventCache;
    try {
      const userhas = await User.findById("5f6f49466f8ba71d5cc0deac");

      if (!userhas) {
        throw new Event("User Not Found");
      }
      const result = await event.save();
      CreateEventCache = {
        ...result._doc,
        _id: result.id,
        date: new Date(result._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator),
      };

      userhas.createEvents.push(event);
      await userhas.save();

      return CreateEventCache;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createUser: async (args) => {
    try {
      const userhas = await User.findOne({ email: args.userInput.email });
      if (userhas) {
        throw new Error("User exit already...");
      }
      const hashPassord = await bcrptjs.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashPassord,
      });
      const res = await user.save();

      return { ...res._doc, password: null, _id: res.id };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
