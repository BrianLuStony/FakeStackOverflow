import { useEffect, useState } from "react";
import { getAns, getLastAnsById } from "./api";

// ******* BUG: sort newest wont change display until
// another sort function is used

export default function ContentTop({
  q,
  top,
  displayedQ,
  setDisplayedQ,
  inputValue,
  setQflag,
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [inputValue]);

  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        let { answers } = await getAns();
        answers.filter((ans) => ans !== undefined);
        setAnswers(answers);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAnswers();
  }, [setQflag]);

  // console.log("Hello" + inputValue);
  const sortButtons = [
    {
      name: "Newest",
      sortFunction: sortNewest,
    },
    {
      name: "Active",
      sortFunction: sortActive,
    },
    {
      name: "Unanswered",
      sortFunction: sortUnanswered,
    },
  ];

  function sortNewest() {
    // const sortedQuestions = q.sort((a, b) => {
    //   let adate = new Date(a.ask_date_time);
    //   let bdate = new Date(b.ask_date_time);
    //   return bdate - adate;
    // });
    console.log("Sort newest");

    // setDisplayedQ(sortedQuestions);
    top.setNewest(true);
    top.setActive(false);
    top.setUnans(false);
    // console.log("From sortnewest: " + sortedQuestions[0].qid);
    // console.log("From sortnewest: " + sortedQuestions[0].qid);
  }

  function sortActive() {
    console.log("Sort active");

    // // console.log("answers", answers);
    // const sortedAnswers = answers.sort((a, b) => b.ans_date_time - a.ans_date_time);

    // const sortedQuestions = [];
    // for (let i = 0; i < sortedAnswers.length; i++) {
    //   let id = sortedAnswers[i]._id;
    //   for (let j = 0; j < q.length; j++) {
    //     if (q[j].answers.includes(id) && !sortedQuestions.includes(q[j])) {
    //       sortedQuestions.unshift(q[j]);
    //     }
    //   }
    // }

    // setDisplayedQ(sortedQuestions);
    top.setNewest(false);
    top.setActive(true);
    top.setUnans(false);
  }

  function sortUnanswered() {
    // const sortedQuestions = q.filter((q) => q.answers.length == 0);
    console.log("Sort unanswered");

    // setDisplayedQ(sortedQuestions);
    top.setNewest(false);
    top.setActive(false);
    top.setUnans(true);
  }

  // Creates html based on 'sortButtons' array
  const buttons = sortButtons.map((b) => (
    <button
      key={`sort${b.name}`}
      className="sortButtonsClass"
      onClick={() => b.sortFunction()}
    >
      {b.name}
    </button>
  ));

  // Displays number of questions currently on display
  const questionCount = () =>
    displayedQ.length == 0 ? "No results found" : displayedQ.length + " questions";

  return (
    <div id="topcontent">
      {inputValue != "" ? (
        <h1 id="contentTitle">Search results</h1>
      ) : (
        <h1 id="contentTitle">All Questions</h1>
      )}

      <h2 id="countQ">{questionCount()}</h2>
      <div id="sortButtons">{buttons}</div>
    </div>
  );
}
