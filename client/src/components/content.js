import Fsoheader from "./fso_header.js";
import FsoLeft from "./fso_left.js";
import ContentTop from "./contentTop.js";
import AskQuestion from "./askQuestion.js";
import QList from "./questionList.js";
import TList from "./tagList.js";
import UserProfile from "./userProfile.js";
import { useEffect, useState } from "react";
import { getUser, getQuestions, getTags, getAns } from "./api.js";

export default function Content({user, isAdmin, setUser}) {
  const [Qflag, setQflag] = useState(true);
  const [Tflag, setTflag] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [qClick, setQClick] = useState(false);
  const [ansQuestionClick, setAnsQuestionClick] = useState(false);
  const [inMain, setInMain] = useState(true);
  const [askClick, setAskClick] = useState(false);
  const [inProfile, setInProfile] = useState(false);

  const [unans,setUnans] = useState(false);
  const [newest,setNewest] = useState(true);
  const [active,setActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [displayedQ, setDisplayedQ] = useState([]);

  const[viewingQuestions, setViewingQuestions] = useState([]);

  const [refresh, setRefresh] = useState(0); // Used to refresh client data upon update

  const refreshData = () => {
    console.log("Refreshed data");
    setRefresh(refresh + 1);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [Qflag, Tflag, tagValue, qClick, inMain,askClick,ansQuestionClick]);

  useEffect(() => {
    const fetchData = async () => {
      try{
        if(user){
          const userData = (await getUser(user._id)).user;
          // console.log("userData", userData);
          setUser({...user, created_tags: userData.created_tags, reputation: userData.reputation});
        }
        
        const questionData = (await getQuestions()).questions;
        const tagData = (await getTags()).tags;
        const answerData = (await getAns()).answers;

        setQuestions(questionData);
        setTags(tagData);
        setAnswers(answerData);

        setLoading(questions == undefined);
      }
      catch (error) {
        console.log(error);
      }
    };
    // if(user){
      fetchData();
    // }
    console.log("refresh: ", refresh);
  },[refresh]);

  if(loading){
    return <h1>Loading...</h1>;
  }

  const top = {
    setUnans,
    setNewest,
    setActive,
  }
  const topa ={
    unans,
    newest,
    active,
  }
  const set = {
    setQflag,
    setTflag,
    setInputValue,
    setTagValue,
    setQClick,
    setAnsQuestionClick,
    setInMain,
    setAskClick,
    setInProfile,
    setInProfile,
    setQuestions,
    setDisplayedQ,
    setViewingQuestions,
  };
  function setIM() {
    console.log("askclick");
    setAskClick(true);
    setInMain(false);
    setQflag(false);
    setTflag(false);
    setTagValue("");
    setInputValue("");
    setInProfile(false);
  }
  function setClickProfile(){
    console.log("clicked in profile");
    setAskClick(false);
    setInMain(false);
    setQflag(false);
    setTflag(false);
    setTagValue("");
    setInputValue("");
    setInProfile(true);
  }

  return (
    <>
      <div id="header" className="header">
        <Fsoheader setInputValue={setInputValue} top={top}/>
        {user ? <button className="userProfile" onClick={setClickProfile}>Profile</button> : <></>}
      </div>
      <div id="main" className="main">
        <FsoLeft
            top={top}
            set={set}
            refresh={refreshData}
        />
        <div id="content">
          {inMain && (
            <ContentTop
              q={questions}
              top={top}
              displayedQ={displayedQ}
              setDisplayedQ={setDisplayedQ}
              inputValue={inputValue}
              setQflag={setQflag}
            />
          )}

          {(!askClick && user && !inProfile) && (
            <button id="addQ" className="addQ" onClick={setIM}>
              Ask Question
            </button>
          )}
          {askClick && <AskQuestion set={set} user={user} refresh={refreshData}/>}
          {Qflag && (
            <QList
              inputValue={inputValue}
              tagValue={tagValue}
              setTagValue={setTagValue}
              q={questions}
              setQ={setQuestions}
              displayedQ={displayedQ}
              setDisplayedQ={setDisplayedQ}
              qClick={qClick}
              ansQClick={ansQuestionClick}
              setAnsQClick={setAnsQuestionClick}
              setQClick={setQClick}
              setInMain={setInMain}
              topa={topa}
              user = {user}
              refresh={refreshData}
              tags={tags}
              answers={answers}
              viewQ={viewingQuestions}
            />
          )}
          {Tflag && (
            <TList
              set={set}
              fromProfile={false}
            />
          )}
          {inProfile && (
            <UserProfile
              set={set}
              user={user}
              isAdmin={isAdmin}
              refresh={refreshData}
              setV = {setViewingQuestions}
              setQflag={setQflag}
              setInProfile={setInProfile}
            />
          )}
        </div>
      </div>
    </>
  );
}

//Checks if parameter 'date' is within one day of current date and returns date accordingly
export function getDateString(isostring) {
  const date = new Date(isostring); // Converts the date stored in ISO format to Date object

  let currentDate = new Date();
  let diff = currentDate.getTime() - date.getTime();

  var withinDay = Math.floor(diff / (1000 * 3600 * 24)) < 1;
  var secondsDiff = Math.floor(diff / 1000);

  var dateString;
  const monthNames = [
    "Jan",
    "Feb",
    "May",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (withinDay) {
    if (secondsDiff > 60 * 60) {
      dateString = `${Math.floor(secondsDiff / 3600)} hours ago`;
    } else if (secondsDiff > 60) {
      dateString = `${Math.floor(secondsDiff / 60)} minutes ago`;
    } else {
      dateString = `${secondsDiff} seconds ago`;
    }
  } else {
    dateString =
      `${monthNames[date.getMonth()]} ${date.getDate()} at ` +
      `${date.getHours().toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}:` +
      `${date.getMinutes().toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}`;
  }

  return dateString;
}

export function checkHyper(text, errors) {
  const linkRegex = /\[.*?\]\(.*?\)/g;
  const linkMatches = text.match(linkRegex);

  if (linkMatches) {
    for (const linkMatch of linkMatches) {
      const match = linkMatch.split("](");
      const linkName = match[0].substring(1);

      if (linkName.trim().length === 0) {
        errors.qDetail = "HyperLink name cannot be empty";
      }
      const linkUrl = match[1].slice(0, -1);

      if (!linkUrl.startsWith("http://") && !linkUrl.startsWith("https://")) {
        errors.qDetail = "Link URL must start with 'http://' or 'https://'";
        break;
      }
    }
  }
}
