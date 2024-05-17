import React from "react";
import Welcome from "./content.js"
export default class FakeStackOverflow extends React.Component {
  
  render() {
    return (
      <section className="fakeso">
        <Welcome />
      </section>
    );
  }
}
