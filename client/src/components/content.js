
import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Welcome from "./welcome";
import HomePage from "./HomePage";
import TagPage from "./TagPage";
import AskPage from "./AskPage";
import Sidebar from "./sidebar/Sidebar";
import QuestionPage from "./QuestionPage";
import AnswerQuestion from "./AnswerQuestion";

function AppContent() {
  const location = useLocation();
  const showSidebar = location.pathname !== "/";

  return (
    <div id="App" className="flex w-screen h-screen">
      {showSidebar && <Sidebar />}
      <main className="flex-1 flex flex-col h-full">
        <Routes className="flex-1">
          <Route path="/" element={<Welcome />} />
          <Route path="/questions" element={<HomePage />} />
          <Route path="/tags" element={<TagPage />} />
          <Route path="/askQ" element={<AskPage />} />
          <Route path="/question" element={<QuestionPage />} />
          <Route path="/question/:questionId/answerquestion" element={<AnswerQuestion />} />
        </Routes>
      </main>
    </div>

  );
}

export default function Content() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}



//Checks if parameter 'date' is within one day of current date and returns date accordingly
export function getDateString(isostring) {
  if (!isostring || !isostring.seconds) {
    return "Just now";
  }
  const timestamp = isostring;
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
 // Converts the date stored in ISO format to Date object

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
