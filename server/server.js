// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require("express");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(cookieParser());
const url = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(url);
let db = mongoose.connection;

console.log("Connected to MongoDB server");

const Question = require("./models/questions");
const Answer = require("./models/answers");
const Tag = require("./models/tags");
const User = require("./models/users");
const Comment = require("./models/comments")
app.use(express.json());

// const generateSecretKey = async () => {
//   const saltRounds = 10; // Number of salt rounds
//   const randomString = await bcrypt.genSalt(saltRounds);
//   return randomString;
// };

app.use(
  session({
    secret: 'your-secret-key', // Replace with your own secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 900000, // Set the maximum age of the session cookie
      httpOnly: true, // Ensure the cookie is only accessible via HTTP
    },
  })
);

  

// const sessions = {};

// Handle user registration
app.post('/signup', async (req, res) => {
  const { username, email, password, passwordVerify } = req.body;

  // Check if password and passwordVerify match
  if (password !== passwordVerify) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Check if email already exists in database
    const existingUser = await User.findOne({ $or: [{ email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
    });

    // Save user to database
    await user.save();

    // Redirect to login page
    //res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// app.get('/autologin', (req, res) => {
//   if (req.session.user) {
//     return res.status(200).json(req.session.user);
//   } else {
//     return res.status(401).json({ message: 'Not logged in' });
//   }
// });

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const cookies = req.cookies;
   
    try {
      // Check if user exists in the database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the provided password matches the user's password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
      // const sessionId = Math.random().toString(36).substring(2);
      // sessions[sessionId] = user;
      // req.session.user = user;
      // req.session.save();
      // res.cookie('session', sessionId, { maxAge: 900000, httpOnly: true });
      res.cookie('userCookie', 'cookie-value', { maxAge: 3600000, httpOnly: true });
      // Successful login
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to perform login' });
    }
  });

  app.route('/posts/userRepA/:id').post(async (req, res) => {
    const answerId = req.params.id; // Retrieve question id from URL parameter
    const voteType = req.body.voteType; 
    const userId = req.body.id;

    const user = await User.findById(userId);
   
    try {
        let voteCount = 0;
        let reputationChange = 0;
        if (voteType === 'upvote') {
          voteCount = 1;
          reputationChange = 5;
        } else if (voteType === 'downvote') {
          voteCount = -1;
          reputationChange = -10;
        }
        const answer = await Answer.findByIdAndUpdate(answerId, { $inc: { votes: voteCount } },{new:true});
        const author = await User.findByIdAndUpdate(answer.ans_by, { $inc: { reputation: reputationChange } });

        // Return the updated question with the new 'views' value
        res.json({ votes: answer.votes + voteCount });
      } catch (error) {
        // Handle error if any
        console.error("Error updating question views:", error);
        res.status(500).json({ error: 'Internal server error' });
      }
  });
  app.route('/posts/userRepC/:id').post(async (req, res) => {
    const commentId = req.params.id; // Retrieve question id from URL parameter
    const voteType = req.body.voteType; 
    const userId = req.body.id;

    const user = await User.findById(userId);
   
    try {
        let voteCount = 0;
        // let reputationChange = 0;
        if (voteType === 'upvote') {
          voteCount = 1;
          // reputationChange = 5;
        } 
        const comment = await Comment.findByIdAndUpdate(commentId, { $inc: { votes: voteCount } },{new:true});
        // const author = await User.findByIdAndUpdate(comment.comment_by, { $inc: { reputation: reputationChange } });
        // Return the updated question with the new 'views' value
        res.json({ votes: comment.votes + voteCount });
      } catch (error) {
        // Handle error if any
        console.error("Error updating question views:", error);
        res.status(500).json({ error: 'Internal server error' });
      }
  });
  app.route('/posts/userRepQ/:id').post(async (req, res) => {
    const questionId = req.params.id; // Retrieve question id from URL parameter
    const voteType = req.body.voteType; 
    const userId = req.body.id;

    const user = await User.findById(userId);
   
    try {
        let voteCount = 0;
        let reputationChange = 0;
        if (voteType === 'upvote') {
          voteCount = 1;
          reputationChange = 5;
        } else if (voteType === 'downvote') {
          voteCount = -1;
          reputationChange = -10;
        }
        const question = await Question.findByIdAndUpdate(questionId, { $inc: { votes: voteCount } },{new:true});
        const author = await User.findByIdAndUpdate(question.asked_by, { $inc: { reputation: reputationChange } });

        // Return the updated question with the new 'views' value
        res.json({ votes: question.votes + voteCount });
      } catch (error) {
        // Handle error if any
        console.error("Error updating question views:", error);
        res.status(500).json({ error: 'Internal server error' });
      }
  });
app.route('/posts/question/:id').post(async (req, res) => {
    const questionId = req.params.id; // Retrieve question id from URL parameter
  
    // Update the 'views' field of the question by incrementing it by 1
    try {
        // Update the 'views' field of the question by incrementing it by 1
        const question = await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });
    
        // Return the updated question with the new 'views' value
        res.json({ views: question.views + 1 });
      } catch (error) {
        // Handle error if any
        console.error("Error updating question views:", error);
        res.status(500).json({ error: 'Internal server error' });
      }
  });
  
app
    .route('/posts/tags/:id')
    .get(async (req, res) => {
        const questionId = req.params.id; // Retrieve question id from URL parameter
    
        try {
        // Query the Question model to find the question by id and populate the 'tags' field with tag documents
        const question = await Question.findById(questionId).populate('tags');
    
        if (!question) {
            // Return an error response if question not found
            return res.status(404).json({ error: 'Question not found' });
        }
    
        // Extract the tag names from the populated 'tags' field
        const tagNames = question.tags.map(tag => tag.name);
    
        // Return the tag names as text in the response
        res.json(tagNames);
        } catch (error) {
        // Return an error response if an error occurs during database query
        res.status(500).json({ error: 'Internal server error' });
        }
    });
app
    .route('/posts/answers/:id')
    .get(async (req, res) => {
        const questionId = req.params.id; // Retrieve question id from URL parameter
    
        try {
        // Query the Question model to find the question by id and populate the 'tags' field with tag documents
        const question = await Question.findById(questionId).populate({
          path: 'answers',
          populate: {
            path: 'comments',
            path: 'ans_by'
          },
        });
        if (!question) {
            // Return an error response if question not found
            return res.status(404).json({ error: 'Question not found' });
        }
    
        // question.answers.populate('comments');
    
        // Return the tag names as text in the response
        res.json(question.answers);
        } catch (error) {
        // Return an error response if an error occurs during database query
        res.status(500).json({ error: 'Internal server error' });
        }
    });
app
    .route("/users/:id")
    .get((req, res) => {
      const userId = req.params.id;

      User.findById(userId)
        .then((user) => {
          if(user) {
            res.status(200).send(user);
          } else {
            res.status(404).send("User not found");
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send(`Internal Server Error ${userId}`);
        });
    })
    .put((req, res) => {
      const userId = req.params.id;
      const tagData = req.body.newCreatedTags;
      // Query for created_tags by this user
      // const tagData = req.query.tags;

      User.findByIdAndUpdate(userId, {$push: {created_tags: tagData}})
        .then(() => res.status(200).send(`User Data Updated Successfully ${tagData}`))
        .catch(err => {
          console.log(err);
          res.status(500).send("User Data Not Updated");
        });
    })
    .delete(async (req, res) => {
      try {
        const userId = req.params.id;
    
        // Delete the user
        await User.findByIdAndDelete(userId);
    
        // Delete the questions related to the user
        await Question.deleteMany({ asked_by: userId });
    
        // Delete the answers related to the user
        await Answer.deleteMany({ ans_by: userId });
    
        res.status(200).json({ message: 'User and associated data deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the user and associated data' });
      }
    });
app
    .route("/questions/:id")
    .get((req, res) => {
      const userId = req.params.id;
      Answer.find({ ans_by: userId })
      .then(answers => {
        const answerIds = answers.map(answer => answer._id);

        Question.find({ answers: { $in: answerIds } })
          .populate('answers')
          .then(questions => res.status(200).send(questions))
          .catch(err => {
            console.log(err);
            res.status(500).send("Question Data Not Found");
          });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send("Answer Data Not Found");
      });
        
    })
    .put((req, res) => {
        const questionId = req.params.id;
        const newAnswerId = req.body.newAnswerId; // Assuming the client sends the newly created answer's ID in the request body
        
        // Find the question by ID and update the answers array
        Question.findByIdAndUpdate(questionId, { $push: { answers: newAnswerId } })
            .then(() => {
                res.status(200).send("Question updated successfully");
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Internal Server Error");
            });
    })
    .delete((req, res) => {
      const questionId = req.params.id;
      
      // Delete the question by ID
      Question.deleteOne({_id: questionId})
          .then(() => {
              res.status(200).send("Question deleted successfully");
          })
          .catch((err) => {
              console.error(err);
              res.status(500).send("Failed to delete Question");
          });
    });
  app
    .route("/tags/:id")
    .put((req, res) => {
      const tagId = req.params.id;
      const newName = req.query.newName;

      // Get old tag name
      Tag.findById(tagId)
        .then(tag => {
          // User.find()
          //     .then(users => {

          //       users.forEach(user => {
          //         // Checks if tag is used by other users
          //         Question.find()
          //           .then(questions => {
          //             questions.forEach(question => {
          //               const questionTagNames = question.tags.map(tag => tag.name);
          //               if(!user.created_tags.includes(tagName) && questionTagNames.includes(tagName)){
          //                 res.status(500).send("Cannot delete tag: Used by other users");
          //               }
          //             })
          //           })
          //       });
          //     })
          const oldName = tag.name; res.send(`newName: ${newName} oldName: ${tag.name}`)
          if(newName){
            // Updates all tags with old name to new name
            Tag.updateMany({name: oldName}, {$set: {name: newName}})
              .then(updatedTags => console.log(`Updated ${updatedTags.length} tags`))
              .catch(err => console.log(err));
    
            // Updates user that created the tag with new tag name in created_tags
            User.findOneAndUpdate({created_tags: oldName},
              {$set: {"created_tags.$": newName}}, {new: true})
              .then(user => console.log(user))
              .catch(err => console.log(err));
            }
            
        })
        .catch(err => console.log(err));

      
    })
    .delete((req, res) => {
      const tagId = req.params.id;

      let tagName;
      Tag.findById(tagId)
        .then(tag => tagName = tag.name)
        .catch(err => console.log(err));
      
      
      // Delete the tag by ID
      Tag.deleteOne({_id: tagId})
          .then(() => {
              res.status(200).send(`Tag deleted successfully: ${tagName}`);
              // Check if tags of 'tagName' exists, if not, delete user's created tag by name
              User.find()
              .then(users => {
                const userPromises = [];
            
                users.forEach(user => {
                  userPromises.push(
                    Tag.countDocuments({ name: tagName })
                      .then(tagCount => {
                        if (tagCount === 0) {
                          return User.updateOne({_id: user._id}, {$pull: {created_tags: {$in: [tagName]}}});
                        }
                      })
                  );
                });
                return Promise.all(userPromises);
              })
          })
          .catch((err) => {
              console.error(err);
              res.status(500).send("Failed to delete tag");
          });

    
    });
app.route("/answers2/:id").put((req, res) => {
      const answerId = req.params.id;
      const updatedAnswer = req.body;
      
      // Update the answer with answerId using the updatedAnswer object
      Answer.findByIdAndUpdate(
        answerId,
        updatedAnswer,
        { new: true } // Set { new: true } to return the updated answer
      )
        .then((updatedAnswer) => {
          res.status(200).json(updatedAnswer); // Send the updated answer as the response
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Internal Server Error");
        });
    });
app
    .route("/answers/:id")
    .put((req, res) => {
        const answerId = req.params.id;
        const newCommentId = req.body.newCommentId; // Assuming the client sends the newly created answer's ID in the request body
        
        // Modifies the answer with answerId
        Answer.findByIdAndUpdate(answerId, { $push: { comments: newCommentId } })
            .then(() => {
                res.status(200).send("Answer updated successfully");
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Internal Server Error");
            });
    })
    .delete((req, res) => {
      const answerId = req.params.id;
      
      // Delete answer by ID
      Answer.deleteOne({_id: answerId})
          .then(() => {
              res.status(200).send("Answer deleted successfully");
          })
          .catch((err) => {
              console.error(err);
              res.status(500).send("Failed to delete Answer");
          });
    });
app
    .route("/users")
    .get((req, res) => {
    
        User.find({})
        .then((users) => {
            // Send the fetched questions as a response
            res.json(users);
        })
        .catch((err) => {
            // Handle any errors that occur during the fetch operation
            console.error(err);
            res.status(500).send("Internal Server Error");
        });
    })
app
    .route("/questions")
    .get((req, res) => {
    
        Question.find({})
        .populate('tags')
        .populate('asked_by')
        .then((questions) => {
            // Send the fetched questions as a response
            res.json(questions);
        })
        .catch((err) => {
            // Handle any errors that occur during the fetch operation
            console.error(err);
            res.status(500).send("Internal Server Error");
        });
    })
    .post((req, res) => {
        const questionData = req.body;

        // Create a new Question instance with the extracted data
        const question = new Question(questionData);

        // Save the new question to the MongoDB using Mongoose
        question
            .save()
            .then((savedQuestion) => {
                // Send the saved question as a response
                res.json(savedQuestion);
            })
            .catch((err) => {
                // Handle any errors that occur during the save operation
                console.error(err);
                res.status(500).send("Internal Server Error");
            });
    })
    .put((req, res) => {
      const questionData = req.body;
      console.log("questionData from server: ", questionData);

      // Updates existing question by questionID
      Question.findByIdAndUpdate(questionData._id, questionData, {new: true})
        .then((newQuestion) => res.status(200).send(newQuestion))
        .catch(err => {
          console.log(err);
          res.status(500).send("Question Not Found")
        });

    })


app
    .route("/answers")
    .get((req, res) => {
        Answer.find()
            .then((answers) => {
                // Send the fetched questions as a response
                res.json(answers);
            })
            .catch((err) => {
                // Handle any errors that occur during the fetch operation
                console.error(err);
                res.status(500).send("Internal Server Error");
            });
    })
    .post((req, res) => {
        const answerData = req.body;

        // Create a new Question instance with the extracted data
        const answer = new Answer(answerData);

        // Save the new question to the MongoDB using Mongoose
        answer
            .save()
            .then((savedAnswer) => {
                // Send the saved question as a response
                res.json(savedAnswer);
            })
            .catch((err) => {
                // Handle any errors that occur during the save operation
                console.error(err);
                res.status(500).send("Internal Server Error");
            });
    });

app
    .route("/tags")
    .get(async(req, res) => {
        try {
            const { names } = req.query;
            let filteredTags;
            if (names) {
              // Fetch all tags from the database
              const allTags = await Tag.find();
              // Filter tags based on the names provided in Qtags
              filteredTags = allTags.filter(tag => names.includes(tag.name));
            } else {
              // Fetch all tags from the database
              filteredTags = await Tag.find();
            }
            
            // Send the filteredTags as response
            res.json(filteredTags);
          } catch (error) {
            // Handle error if any
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
    })
    .post((req, res) => {
        const tagData = req.body;

        // Create a new Question instance with the extracted data
        const tag = new Tag(tagData);

        // Save the new question to the MongoDB using Mongoose
        tag
            .save()
            .then((savedTag) => {
                // Send the saved question as a response
                res.json(savedTag);
            })
            .catch((err) => {
                // Handle any errors that occur during the save operation
                console.error(err);
                res.status(500).send("Internal Server Error");
            });
    });
    app.route('/comments')
    .get(async (req, res) => {
      try {
        const { answerId } = req.query;
  
        // Fetch comments based on the provided answer ID
        const ansData = await Answer.findById(answerId).populate('comments');
        const comments = ansData.comments; 
        // Send the comments as a response
        res.json(comments);
      } catch (error) {
        // Handle error if any
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    .post((req, res) => {
      const commentData = req.body;
  
      // Create a new Comment instance with the extracted data
      const comment = new Comment(commentData);
  
      // Save the new comment to the MongoDB using Mongoose
      comment
        .save()
        .then((savedComment) => {
          // Send the saved comment as a response
          res.json(savedComment);
        })
        .catch((err) => {
          // Handle any errors that occur during the save operation
          console.error(err);
          res.status(500).send('Internal Server Error');
        });
    });

   
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
process.on("SIGINT", () => {
    db.close();
    console.log("Server closed. Database instance disconnected");
    process.exit(0);
});