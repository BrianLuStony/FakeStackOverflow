

import React, { useContext, useEffect } from "react";
export default function FsoLeft({
  top,
  set,
  refresh,
}) {
  function linkClick(e) {
    const t = e.target.textContent.trim();

    if (t === "Questions") {
      console.log("hi");
      const lq = document.getElementById("link-q");
      lq.style.backgroundColor = "lightgrey";
      lq.style.borderRight = "3px solid orange";
      const lt = document.getElementById("link-t");
      lt.style.backgroundColor = "";
      lt.style.borderRight = "";
      top.setNewest(true);
      top.setActive(false);
      top.setUnans(false);
      set.setQflag(true);
      set.setTflag(false);
      set.setTagValue("");
      set.setInputValue("");
      set.setInMain(true);
      set.setQClick(false);
      set.setAnsQuestionClick(false);
      set.setAskClick(false);
      set.setInProfile(false);
      set.setViewingQuestions([]);
      refresh();
    }
    if (t === "Tags") {
      const lt = document.getElementById("link-t");
      lt.style.backgroundColor = "lightgrey";
      lt.style.borderRight = "3px solid orange";
      const lq = document.getElementById("link-q");
      lq.style.backgroundColor = "";
      lq.style.borderRight = "";
      top.setNewest(false);
      top.setActive(false);
      top.setUnans(false);
      set.setQflag(false);
      set.setTflag(true);
      set.setTagValue("");
      set.setInMain(false);
      set.setQClick(false);
      set.setAnsQuestionClick(false);
      set.setAskClick(false);
      set.setInProfile(false);
      set.setViewingQuestions([]);
      refresh();
    }
  }
  return (
    <div id="left-side" className="left-side">
      <div className="left-side-container">
        <nav role="navigation">
          <ol className="nav-link">
            <li>
              <ol className="nav-link">
                <li
                  style={{
                    marginLeft: "5px",
                    marginBottom: "10px",
                    color: "grey",
                    fontSize: "20px",
                  }}
                >
                  MENU
                </li>
                <li className=".userelative" aria-current="true">
                  <a
                    id="link-q"
                    className="link-nav-links"
                    href="#"
                    aria-current="true"
                    onClick={linkClick}
                  >
                    <span className="link-name"> Questions</span>
                  </a>
                </li>
                <li className=".userelative" aria-current="false">
                  <a
                    id="link-t"
                    className="link-nav-links"
                    href="#"
                    aria-current="false"
                    onClick={linkClick}
                  >
                    <span className="link-name"> Tags</span>
                  </a>
                </li>
              </ol>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
