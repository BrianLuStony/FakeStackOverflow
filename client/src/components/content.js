
import Sidebar from "./sidebar/Sidebar.js"
import HomePage from "./HomePage.js";
import TagPage from "./TagPage.js";
// Content.js
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

export default function Content() {
  
  return(
  <>
    <Router>
      <div id="App" className="flex overflow-hidden w-screen h-screen">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/questions" element={<HomePage />} />
            <Route path="/tags" element={<TagPage />} />
            <Route path="/askQ" element={<TagPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  </>);
}


//Checks if parameter 'date' is within one day of current date and returns date accordingly
export function getDateString(isostring) {
  const timestamp = isostring;
  const date = new Date(timestamp.$date.seconds * 1000 + timestamp.$date.nanoseconds / 1000000);
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
