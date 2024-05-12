import React from "react";
import Content from "./content.js";
import Welcome from "./welcome.js"
import { getQuestions } from "./api.js";

/// data = axios()
// const [data, setData] = useState(data);
//button => data = axios(); setData(data);
//component data={data}

// (async () => {
//   try {
//     const { questions } = await getQuestions();
//     console.log("Questions:", questions);
//     // Continue with further processing of data
//     // ...
//   } catch (error) {
//     console.error(error);
//   }
// })();
export default class FakeStackOverflow extends React.Component {
  render() {
    return (
      <section className="fakeso">
        <Welcome />
      </section>
    );
  }
}
