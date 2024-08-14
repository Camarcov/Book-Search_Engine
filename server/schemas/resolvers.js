const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, { _id }) => {
            const user = await User.findById(_id);

            if (!user) {
                throw new Error('Cannot find a user with this id!');
            }

            return user;
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) throw new AuthenticationError;

            const isCorrectPassword = user.isCorrectPassword(password);
            if (!isCorrectPassword) throw new AuthenticationError;

            const token = signToken(user);

            return { token, user };
        },
        addUser: async (parent, { username, email, password }) => {
            try {
                const user = await User.create({ username, email, password });
                const token = signToken(user);

                return { token, user };
            } catch (err) {
                console.error(err);
            }
        },
        saveBook: async (parent, { userId, input }) => {
            const user = await User.findById(userId);
            if (user.savedBooks === null) user.savedBooks = [];
            user.savedBooks.push(input);
            user.save();

            return user;
        },
        removeBook: async (parent, { userId, bookId }) => {
            let user = await User.findById(userId);
            user.savedBooks = user.savedBooks.filter(e => e.bookId !== bookId);
            user.save();

            return user;
        }
    }
};

module.exports = resolvers;