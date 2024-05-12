import axios from "axios";

// Gets user by ID
export async function getUser(userId) {
  try {
    const userResponse = await axios.get(`http://localhost:8000/users/${userId}`);
    // Handle successful response for user

    // Return the retrieved data as an object
    return {
      user: userResponse.data,
    };
  } catch (error) {
    // Handle error
    console.error("Error retrieving data:", error);
    throw error; // Throw error to propagate it to the caller
  }
}

export async function getUsers() {
  try {
    const userResponse = await axios.get(`http://localhost:8000/users`);
    // Handle successful response for user
    console.log(userResponse);
    // Return the retrieved data as an object
    return {
      user: userResponse.data,
    };
  } catch (error) {
    // Handle error
    console.error("Error retrieving data:", error);
    throw error; // Throw error to propagate it to the caller
  }
}


// Gets all questions in database
export async function getQuestions() {
  try {
    const questionResponse = await axios.get("http://localhost:8000/questions");
    // Handle successful response for questions
    // console.log("Question data:", questionResponse.data);

    // Return the retrieved data as an object
    return {
      questions: questionResponse.data,
    };
  } catch (error) {
    // Handle error for questions or answers
    console.error("Error retrieving data:", error);
    throw error; // Throw error to propagate it to the caller
  }
}

// Gets all questions in database
export async function getQuestionsByUser(userId) {
  try {
    const questionResponse = await axios.get(`http://localhost:8000/questions/${userId}`);
    // Handle successful response for questions
    // console.log("Question data:", questionResponse.data);
    console.log("from api:", questionResponse.data);
    // Return the retrieved data as an object
    return {
      questions: questionResponse.data,
    };
  } catch (error) {
    // Handle error for questions or answers
    console.error("Error retrieving data:", error);
    throw error; // Throw error to propagate it to the caller
  }
}

// Gets all tags in database
export async function getTags() {
  try {
    const tagResponse = await axios.get("http://localhost:8000/tags");
    // Handle successful response for questions
    // console.log("In axios.getTags function");
    // console.log("Tag data:", tagResponse.data);

    // Return the retrieved data as an object
    return {
      tags: tagResponse.data,
    };
  } catch (error) {
    // Handle error for questions or answers
    console.error("Error retrieving data:", error);
    throw error; // Throw error to propagate it to the caller
  }
}

// Gets all answers in database
export async function getAns() {
  try {
    const answerResponse = await axios.get("http://localhost:8000/answers");
    // Handle successful response for questions
    // console.log("Answer data:", answerResponse.data);

    // Return the retrieved data as an object
    return {
      answers: answerResponse.data,
    };
  } catch (error) {
    // Handle error for questions or answers
    console.error("Error retrieving data:", error);
    throw error; // Throw error to propagate it to the caller
  }
}


export async function addViewQ(question) {
  try {
    const viewAdd = await axios.post(
      `http://localhost:8000/posts/question/${question._id}`
    );
    console.log(viewAdd);
  } catch (error) {
    // Handle error for questions or answers
    console.error("Error retrieving data:", error);
    throw error; // Throw error to propagate it to the caller
  }
}

export async function matchAns(question) {
  try {
    const answers = await axios.get(
      `http://localhost:8000/posts/answers/${question._id}`
    );
    console.log("Answer Data: ", answers);
    return {
      answers: answers.data,
    };
  } catch (error) {
    // Handle error for questions or answers
    console.error("Error retrieving data:", error);
    throw error; // Throw error to propagate it to the caller
  }
}

export async function getLastAnsById(questionId) {
  try {
    const answerResponse = await axios.get("http://localhost:8000/answers");
    const questionResponse = await axios.get("http://localhost:8000/questions");
    // Handle successful response for questions
    // console.log("Answer data id:", answerResponse.data);

    const question = questionResponse.data.find((q) => q._id == questionId);
    const lastAnsId = question.answers[question.answers.length - 1];

    const lastAns = answerResponse.data.find((ans) => ans._id == lastAnsId);
    // Return the retrieved data as an object
    return {
      answer: lastAns,
    };
  } catch (error) {
    // Handle error for questions or answers
    console.error("Error retrieving data:", error);
    throw error; // Throw error to propagate it to the caller
  }
}
