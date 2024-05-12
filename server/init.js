//Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.

// Pass URL of your mongoDB instance as first argument(e.g., mongodb://127.0.0.1:27017/fake_so)
let userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

function tagCreate(name) {
    let tag = new Tag({ name: name });
    return tag.save();
  }

let User = require('./models/users')

async function createAdmin(userArgs){
    let user = new User(
        {username: userArgs,
         password: userArgs,
         email: "admin@admin.com",
         reputation: 9999999,
        })
    console.log("user: ", user);
    return user.save();
}

let mongoose = require('mongoose');
let mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const populate = async () => {
  await createAdmin(userArgs[1]);
  if(db) db.close();
  console.log('done');
}

populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if(db) db.close();
  });

console.log('processing ...');
