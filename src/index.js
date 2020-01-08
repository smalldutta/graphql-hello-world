const { ApolloServer, gql, PubSub } = require('apollo-server');

const typeDefs = gql`
    type Query{
    hello (name:String!):String!
    user:User!
},
type User{
    id:ID!
    username: String!
},
type Error{
field: String!
message: String!
},
type RegisterResponse{
    error:[Error!]!
    user: User!
},
input UserInfo {
    username:String!
    password:String!
    age:Int!
},

type Mutation{
    login(userInfo:UserInfo!): String!
    register(userInfo:UserInfo!): RegisterResponse!
}

type Subscription {
     newUser:User! 
}

`;
const NEW_USER = 'NEW_USER';


const resolvers = {

    Subscription: {
        newUser: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(NEW_USER)
        }
    },

    Query: {
        hello: (parent, { name }) => {

            return `hey ${name}`

        },
        user: () => ({
            id: 1,
            username: "bob"
        }),

    },
    Mutation: {
        login: (parent, { userInfo: { username } }, context, info) => {
            return username;
        },
        register: (_, { userInfo: { username } }, pubsub) => {
            const user = {
                id: 1,
                username
            }
            pubsub.publish(NEW_USER, {
                newUser: user
            })
            return {

                errors: [{
                    field: "Username",
                    message: "bad"
                }],
                user: {
                    id: 1,
                    username: "bob"
                }

            }
        }
    }
};

const pubsub = new PubSub();


const server = new ApolloServer({ typeDefs, resolvers, context: (req, res) => ({ req, res, pubsub }) });

server.listen().then(({ url }) => console.log(`server started at ${url}`))