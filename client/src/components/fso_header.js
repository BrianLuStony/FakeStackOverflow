import React, { useRef } from "react";

export default function FsoHeader({ setInputValue ,top}) {
  const formRef = useRef(null);
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("inputvalue: ", event.target.value);
    setInputValue(event.target.value);
    top.setNewest(false);
      top.setActive(false);
      top.setUnans(false);
    formRef.current.reset();
  };
  const handleChange = (e) => {
    if (e.key === "Enter") {

      handleSubmit(e);
    }
  };
  return (
    <header className="topbar">
      <div className="topbarcontainer">
        <a href="welcome.js" className="toplogo">
          <span>
            <img
              id="logo"
              src="https://www.zdnet.com/a/img/resize/fc7b8d4b1f4b34862881ebf41dec855600480098/2022/08/01/71433421-11f6-4ee9-97d5-3249e8457842/stack-overflow-logo-crop-for-twitter.jpg?auto=webp&width=1280"
              alt="Fake Stack Overflow"
            />
          </span>
        </a>
        <form
          ref={formRef}
          id="topsearch"
          role="search"
          className="topbarsearch"
          autoComplete="off"
          method="get"
          onSubmit={handleSubmit}
        >
          {
            <div className=".topinput">
              <input
                name="question"
                type="text"
                role="combobox"
                className="tinput"
                aria-label="search"
                aria-controls="top-search"
                data-controller="s-popover"
                data-action="focus->s-popover#show"
                data-s-popover-placement="bottom-start"
                aria-expanded="false"
                placeholder="What are you looking for?"
                autoComplete="off"
                maxLength="240"
                onKeyDown={handleChange}
              />
            </div>
          }
        </form>
      </div>
    </header>
  );
}
