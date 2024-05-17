import { useEffect, useState,useRef } from "react";
import AnswerPage from "./AnswerPage.js";
import { getDateString } from "./content.js";
import axios from "axios";
import { addViewQ, getTags,getAns } from "./api.js";
import { getFirestore,collection,getDocs, onSnapshot } from 'firebase/firestore';


export default function QuestionList({
  inputValue,
  tagValue,
  q,
  setQ,
  displayedQ,
  setDisplayedQ,
  qClick,
  ansQClick,
  setAnsQClick,
  setQClick,
  setInMain,
  topa,
  user,
  tags,
  answers,
  viewQ
}) {
  // var matchQ = model.data.questions.sort((a, b) => b.askDate - a.askDate);
  const [questionTags, setQuestionTags] = useState({});
  const [question, setQuestion] = useState(null);
  const pageSize = 5; // Number of questions to display per page
  const [currentPage, setCurrentPage] = useState(0); 
  const [aClick, setAclick] = useState(false);
  const questionListRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const questionResponse = await axios.get(
        //   "http://localhost:8000/questions"
        // );
        
        let matchQ = [];
        // const questions = questionResponse.data;
        // console.log(questions);
        q.forEach((question) => {
          fetchTagsForQuestion(question._id);
        });
        matchQ = q.sort((a, b) => {
          let adate = new Date(a.ask_date_time);
          let bdate = new Date(b.ask_date_time);
          return bdate - adate;
        });
        console.log(viewQ);
        if (inputValue !== "") {
          console.log("SearchUse");
          matchQ = goSearch(q, tags, inputValue);
        } else if (tagValue !== "") {
          console.log("TAGVALUE");
          matchQ = tClick(q, tagValue);
        } else if(viewQ.length !== 0){
          
          matchQ = viewQ.questions;
        } else {
          console.log("Original");
        }

        const sortedQuestions = matchQ.sort((a, b) => {
          let adate = new Date(a.ask_date_time);
          let bdate = new Date(b.ask_date_time);
          return bdate - adate;
        });

        setDisplayedQ(matchQ);
        // setQ(questions);
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    };
   
    fetchData(); // Call the async function to fetch data
  }, [inputValue, tagValue, q]);

  useEffect(() => {
    // Reset the current page when the displayed questions change
    setCurrentPage(0);
  }, []);

  function handleNextPage() {
    if (currentPage < Math.floor(displayedQ.length / pageSize)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }

  function handlePrevPage() {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  }
  function renderQuestions(questionTags,setQClick,setQuestion,setInMain,topa) {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    let matchQ = [];
    if(topa.unans){
      matchQ = displayedQ.filter((q) => q.answers.length == 0);
    }
    else if(topa.active){
      const sortedAnswers = answers.sort((a, b) => b.ans_date_time - a.ans_date_time);

      const sortedQuestions = [];
      for (let i = 0; i < sortedAnswers.length; i++) {
        let id = sortedAnswers[i]._id;
        for (let j = 0; j < displayedQ.length; j++) {
          if ( displayedQ[j].answers.includes(id) && !sortedQuestions.includes(q[j])) {
            sortedQuestions.unshift(q[j]);
          }
        }
      }
      matchQ = sortedQuestions;
    }else if(topa.newest){
        matchQ = displayedQ.sort((a, b) => {
        let adate = new Date(a.ask_date_time);
        let bdate = new Date(b.ask_date_time);
        return bdate - adate;
      });
    }else{
      matchQ = displayedQ;
    }
    const displayedQuestions = matchQ.slice(startIndex, endIndex);
    // console.log("displaying",displayedQuestions);
    return (
      <>
      <div id = "Q">
        <ul id="questionList">
          {displayedQuestions.map((question) => (
            <li key={question._id} className="question">
            <div className="q_leftside">
              <span className="q_num_answers">{Array.from(question.answers).length} Answer</span>
              <span className="q_num_views">{question.views} View</span>
            </div>
            <div className="q_rightside">
              <div className="q_top">
                <a
                  className="q_title"
                  onClick={() => {
                    setQClick(true);
                    setQuestion(question);
                    addViewQ(question);
                    setInMain(false);
                  }}
                >
                  {question.title}
                </a>
                <div className="q_metadata">
                  <span className="q_asked_by">{question.asked_by.username}</span>
                  <span> asked </span>
                  <span className="q_ask_date">
                    {getDateString(question.ask_date_time)}
                  </span>
                </div>
              </div>
              <div className="q_tags">
                {questionTags[question._id] ? (
                  questionTags[question._id].map((tag) => (
                    <span key={tag._id} className="q_tag">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span>Loading tags...</span>
                )}
              </div>
            </div>
          </li>
          ))}
        </ul>
      </div>
      <div className="pagination">
      <button onClick={handlePrevPage} disabled={currentPage === 0}>
        Prev
      </button>
      <button
        onClick={handleNextPage}
        disabled={currentPage >= Math.floor(displayedQ.length / pageSize)}
      >
        Next
      </button>
    </div>
    </>
    );
  }
  
  if (qClick) {
    return (
      <AnswerPage
        question={question}
        tags = {questionTags[question._id]}
        onClose={() => setQuestion(null)}
        ansQClick={ansQClick}
        setAnsQClick={setAnsQClick}
        user = {user}
        aClick={aClick}
        setAclick={setAclick}
      />
    );
  } else {
    return (
      <Questions
        questionTags={questionTags}
        setQClick={setQClick}
        setQuestion={setQuestion}
        setInMain={setInMain}
        renderQuestions={renderQuestions}
        topa={topa}
      />
    );
  }
}

function tClick(questions, tagValue) {
  const matchQs = [];
  questions.forEach((q) => {
    console.log("Q: ",q);
    if (q.tags.some((t) => t.name === tagValue)) {
      matchQs.push(q);
    }
  });
  console.log(matchQs);
  return matchQs;
}

function goSearch(questions, tags, sString) {
  const searchW = sString.split(" "); //words array
  const matchQ = [];
  console.log(searchW);
  searchW.forEach((word) => {
    if (word.startsWith("[") && word.endsWith("]")) {
      const tagN = word.slice(1, -1).split("][");
      for (let i = 0; i < questions.length; i++) {
        questions[i].tags.forEach((tagIdToCheck) => {
          let tagObj = tags.find((t) => t._id === tagIdToCheck._id);
          if (tagN.includes(tagObj.name) && !matchQ.includes(questions[i])) {
            matchQ.unshift(questions[i]);
          }
        });
      }
    } else {
      for (let i = 0; i < questions.length; i++) {
        const qText = questions[i].text.split(" ");
        const qTitle = questions[i].title.split(" ");
        if (
          (qText.includes(word) || qTitle.includes(word)) &&
          !matchQ.includes(questions[i])
        ) {
          matchQ.push(questions[i]);
        }
      }
    }
  });
  return matchQ;
}

function Questions({
  questionTags,
  setQClick,
  setQuestion,
  setInMain,
  renderQuestions,
  topa,
}) {
  return (
    <>
      {renderQuestions(questionTags,setQClick,setQuestion,setInMain,topa)}
    </>
  );
}
