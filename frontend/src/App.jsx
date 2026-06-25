import { useState } from "react";
import Header from "./components/Header.jsx";
import PromptInput from "./components/PromptInput.jsx";
import OutputCard from "./components/OutputCard.jsx";

const dummyResponse = {
  sqlQuery: "SELECT * FROM Students WHERE CGPA > 8;",
  explanation:
    "This query returns all student records where CGPA is greater than 8.",
  queryType: "SELECT",
  tablesUsed: "Students",
};

function App() {
  const [prompt, setPrompt] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState(null);
  const [error, setError] = useState("");

  const handlePromptChange = (value) => {
    setPrompt(value);

    // Remove the validation message when the user starts typing again.
    if (error) {
      setError("");
    }
  };

  const handleGenerateSql = () => {
    if (!prompt.trim()) {
      setGeneratedOutput(null);
      setError("Please enter a query request first.");
      return;
    }

    setError("");
    setGeneratedOutput(dummyResponse);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <Header />

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <PromptInput
            prompt={prompt}
            error={error}
            onPromptChange={handlePromptChange}
            onGenerateSql={handleGenerateSql}
          />

          <OutputCard output={generatedOutput} />
        </section>
      </div>
    </main>
  );
}

export default App;
