const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth')

const resolvers = {
  //getting the data query
  Query: {
    //context in this section needs to be replaced by a different object
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  //changing the data
  Mutation: {
    loginUser: async (parent, {email, password}) => {
            const user = await User.findOne({ email });

          if (!user) {
            throw new AuthenticationError('No profile with this email found!');
        }

        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
          throw new AuthenticationError('Wrong CREDS!');
        }
        const token = signToken(user);
        return {token, user};
      },

    addUser: async (parent, {username, email, password}) => {
      const user = await User.create({username, email, password});
      const token = signToken(user);
      return {token, user}
    },

    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        return User.findByIdAndUpdate(
          {_id: context.user._id}, 
          {$addToSet: {savedBooks: input } }, 
          {new: true}
          );
    }
      throw new AuthenticationError('Please Login');
    },
    
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        return User.findByIdAndUpdate(
          { _id: context.user._id}, 
          {$pull: {savedBooks: { bookId }}}, 
          {new: true}
          );
  }
  throw new AuthenticationError('Please Login');
  },
  }
};

module.exports = resolvers;