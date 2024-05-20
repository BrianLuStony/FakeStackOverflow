import { getDateString } from "./content.js";
import { useState, useEffect, useRef } from "react";
import { matchAns } from "./api.js";
import Comment from "./comment.js"
import AnswerQuestion from "./AnswerQuestion.js";
import axios from "axios";


export default function AnswerPage({ question, tags, ansQClick, setAnsQClick ,user,aClick,setAclick}) {
  return (
    <Ans
      question={question}
      tags = {tags}
      ansQClick={ansQClick}
      setAnsQClick={setAnsQClick}
      user = {user}
      aClick={aClick}
      setAclick={setAclick}
    />
  );
}

function Ans(props) {
  console.log(props.question.votes);
  // const sessionCookie = document.cookie
  //   .split('; ')
  //   .find(row => row.startsWith('session='));
  // const sessionId = sessionCookie ? sessionCookie.split('=')[1] : null;
  
  
  const [question,setQuestion] = useState(props.question)
  const [anss, setAns] = useState([]);
  const [answerC,setAnswerC] = useState(false);
  const[comments,setComment]= useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [clickComment,setcComment] = useState(null);
  const [currentCommentPage, setCurrentCommentPage] = useState(0);
  const [editAns,setEditAns] = useState(null);
  const pageCSize = 3;

  function handlePrevCommentPage() {
    setCurrentCommentPage((prevPage) => prevPage - 1);
  }

  function handleNextCommentPage() {
    setCurrentCommentPage((prevPage) => prevPage + 1);
  }

  
  const pageSize = 5;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { answers } = await matchAns(props.question);
        setAnswerC(true);
        setAns(answers);
      } catch (error) {
        console.log("Cannot get Ans: " ,error);
      }
    };
    fetchData();
  }, [anss]);

  const tags = props.tags
  const numAns = question.answers.length;
  const printNA = numAns + " answer" + (numAns > 1 ? "s" : "");
  const printV =
    question.views + 1 + " view" + (question.views + 1 > 1 ? "s" : "");
  function handleUpvoteAnswer(answerId) {

    if (props.user === null) {
      alert('Please log in to downvote.');
      return;
    }
    if(props.user.reputation<50){
      alert('Reputation too low.');
      return;
    }
    axios
      .post(`http://localhost:8000/posts/userRepA/${answerId}`, { voteType: 'upvote' ,user: props.user})
      .then((response) => {
        // Update the vote count in the state
        const updatedAnswers = anss.map((answer) => {
          if (answer._id === answerId) {
            return { ...answer, votes: answer.votes + 1 };
          }
          return answer;
        });
        setAns(updatedAnswers);
      })
      .catch((error) => {
        console.error('Error upvoting answer:', error);
        alert('Error upvoting answer. Please try again.');
      });
  }
  function handleDownvoteAnswer(answerId) {
    // Make an HTTP POST request to downvote the answer
    // Replace `answerId` with the actual ID of the answer
    if (props.user === null) {
      alert('Please log in to downvote.');
      return;
    }
    if(props.user.reputation<50){
      alert('Reputation too low.');
      return;
    }
    axios
      .post(`http://localhost:8000/posts/userRepA/${answerId}`, { voteType: 'downvote' ,user: props.user})
      .then((response) => {
        // Update the vote count in the state
        const updatedAnswers = anss.map((answer) => {
          if (answer._id === answerId) {
            return { ...answer, votes: answer.votes - 1 };
          }
          return answer;
        });
        setAns(updatedAnswers);
      })
      .catch((error) => {
        console.error('Error downvoting answer:', error);
        alert('Error downvoting answer. Please try again.');
      });
  }
  function handleAnsClick() {
    props.setAnsQClick(!props.ansQClick);
    setAnswerC(true);
    props.setAclick(true);
  }
  function handleCClick(){
    setcComment(null);
  }
  function handlePrevPage() {
    // if (!sessionId) {
    //   alert('Please log in to upvote.');
    //   return;
    // }
    setCurrentPage((prevPage) => prevPage - 1);
  }

  function handleNextPage() {
    setCurrentPage((prevPage) => prevPage + 1);
  }

  function handleUpvoteQ() {
    // Make an HTTP POST request to upvote the question
    if (props.user === null) {
      alert('Please log in to downvote.');
      return;
    }
    if(props.user.reputation<50){
      alert('Reputation too low.');
      return;
    }
    axios
      .post(`http://localhost:8000/posts/userRepQ/${question._id}`, { voteType: 'upvote',user: props.user })
      .then((response) => {
        // Update the vote count in the state
        // const { votes } = response.data;
        let qv = question.votes;
        qv++;
        setQuestion({ ...question, votes:qv });
      })
      .catch((error) => {
        console.error('Error upvoting question:', error);
        alert('Error upvoting question. Please try again.');
      });
  }

  function handleDownvoteQ() {
    // Make an HTTP POST request to downvote the question
    if (props.user === null) {
      alert('Please log in to downvote.');
      return;
    }
    if(props.user.reputation<50){
      alert('Reputation too low.');
      return;
    }
    axios
      .post(`http://localhost:8000/posts/userRepQ/${question._id}`, { voteType: 'downvote',user: props.user})
      .then((response) => {
        // Update the vote count in the state
        // const { votes } = response.data;
        let qv = question.votes;
        qv--;
        setQuestion({ ...question, votes: qv });
      })
      .catch((error) => {
        console.error('Error downvoting question:', error);
        alert('Error downvoting question. Please try again.');
      });
  }
  function handleUpvoteC(commentId) {
    // Make an HTTP POST request to upvote the comment
    // Replace `commentId` with the actual ID of the comment
    if (props.user === null) {
      alert('Please log in to upvote.');
      return;
    }
    // if (props.user.reputation < 50) {
    //   alert('Reputation too low.');
    //   return;
    // }
    axios
      .post(`http://localhost:8000/posts/userRepC/${commentId}`, { voteType: 'upvote', user: props.user })
      .then((response) => {
        // Update the vote count in the state
        const updatedAnswers = anss.map((answer) => {
          // Find the comment in the answers and update its vote count
          const updatedComments = answer.comments.map((comment) => {
            if (comment._id === commentId) {
              return { ...comment, votes: comment.votes + 1 };
            }
            return comment;
          });
          return { ...answer, comments: updatedComments };
        });
        setAns(updatedAnswers);
      })
      .catch((error) => {
        console.error('Error upvoting comment:', error);
        alert('Error upvoting comment. Please try again.');
      });
  }
  
  function handleCommentClick(answer) {
    if (props.user.reputation < 50) {
      alert('Reputation too low.');
      return;
    }
    setcComment(answer);
  }
  async function handleDeleteClick(ans){
    if(ans.ans_by.email !== props.user.email){
      alert("you are not the owner");
      return;
    }else{
      alert("you are the owner");
      await axios.delete(`http://localhost:8000/answers/${ans._id}`);
    }
  }
  async function handleEditClick(ans){
    if(ans.ans_by.email !== props.user.email){
      alert("you are not the owner");
      return;
    }else{
      alert("you are the owner");
      props.setAnsQClick(true);
      setEditAns(ans);
    }
  }
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedAnswers = anss.slice(startIndex, endIndex).reverse();
    return (
      <div id="inQ">
        <div id="A">
          <div id="abody">
            <div id="aleft">
              <h2>{printNA}</h2>
              <h2 style={{ marginTop: "100%" }}>{printV}</h2>
            </div>
            <div id="amiddle">
              <div id="Qname">
                <h2>{question.title}</h2>
              </div>
              <div id="Qdescript">
                <p style={{ paddingTop: "50px" }}>
                  {question.text.split(" ").map((word) => {
                    if (/\[(.*?)\]\((.*?)\)/.test(word)) {
                      const lastw = word[word.length - 1];
                      const name = word.match(/\[(.*?)\]/)[1];
                      const link = word.match(/\((.*?)\)/)[1];
                      return (
                        <>
                          <span> </span>
                          <a href={link} key={word}>
                            {name}
                          </a>
                          {lastw === ")" ? (
                            <span> </span>
                          ) : (
                            <span>{lastw} </span>
                          )}
                        </>
                      );
                    } else {
                      return word + " ";
                    }
                  })}
                </p>
                <div>
                  {tags.map((tag) => (
                    <span key={tag._id} className="q_tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div id="aright">
              <div className="votecell">
                <button className= "vbutton" onClick={handleUpvoteQ}>Upvote</button>
                <div className= "vcount">{question.votes}</div>
                <button className= "vbutton" onClick={handleDownvoteQ}>Downvote</button>
              </div>
              <div className="auName">
                <span style={{ color: "red" }}>{question.asked_by.username}</span>
                <br />
                <span style={{ color: "grey" }}>
                  {getDateString(question.ask_date_time)}
                </span>
              </div>
            </div>
          </div>
          <div className="answer-container">
            <ul id="answerList">
              {displayedAnswers.map((ans) => (
                <div key={ans._id}>
                  <li className="answer">
                    <div className="votecell">
                      <button className="vbutton" onClick={() => handleUpvoteAnswer(ans._id)}>Upvote</button>
                      <div className="vcount">{ans.votes}</div>
                      <button className="vbutton" onClick={() => handleDownvoteAnswer(ans._id)}>Downvote</button>
                    </div>
                    <div className="answerbody">
                      <p>{ans.text}</p>
                    </div>
                    <div className="aData">
                      <span className="aname q_metadata_name">{ans.ans_by.username}</span>
                      <br />
                      <span className="adate q_metadata_date">
                        {getDateString(ans.ans_date_time)}
                      </span>
                      <br />
                    </div>
                  </li>
                </div>    )
                      )};
            </ul>
            <div className="pagination">
              <button onClick={handlePrevPage} disabled={currentPage === 0}>
                Prev
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= Math.floor(displayedAnswers.length / pageSize)}
              >
                Next
              </button>
            </div>
          </div>
          <button id="ansQ" className="ansQ" onClick={handleAnsClick}>
            Answer Question
          </button>
        </div>
      </div>
    );
  }
