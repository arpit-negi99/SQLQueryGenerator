import { useEffect, useState } from "react";
import DatabaseSchema from "../components/DatabaseSchema.jsx";
import Header from "../components/Header.jsx";
import PromptInput from "../components/PromptInput.jsx";
import QueryResultList from "../components/QueryResultList.jsx";
import { fetchDatabaseSchema } from "../api/schemaApi.js";
import { generateSqlQuery } from "../api/queryApi.js";

function LoadingState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      <p className="mt-4 text-sm font-medium text-slate-600">
        Loading database schema...
      </p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <h2 className="text-lg font-semibold text-red-900">
          Database disconnected
        </h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-red-700">{message}</p>
    </div>
  );
}

function EmptyState({ database }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-amber-900">No tables found</h2>
      <p className="mt-3 text-sm leading-6 text-amber-700">
        The backend connected to {database}, but this database does not contain
        any tables yet.
      </p>
    </div>
  );
}

function Home() {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [promptError, setPromptError] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadSchema() {
      try {
        setLoading(true);
        setError("");

        const response = await fetchDatabaseSchema();
        setSchema(response.data);
      } catch (apiError) {
        const message =
          apiError.response?.data?.message ||
          "Unable to reach the backend server. Make sure the backend is running.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadSchema();
  }, []);

  const connected = Boolean(schema && !error);

  const handlePromptChange = (value) => {
    setPrompt(value);

    if (promptError) {
      setPromptError("");
    }
  };

  const handleGenerateSql = async () => {
    if (!prompt.trim()) {
      setPromptError("Please enter a query request first.");
      setQueryResult(null);
      return;
    }

    try {
      setGenerating(true);
      setPromptError("");
      const result = await generateSqlQuery(prompt);
      setQueryResult(result);
    } catch (apiError) {
      const message =
        apiError.response?.data?.message ||
        "Unable to generate SQL. Check that the backend, database, and AI API key are configured.";
      setPromptError(message);
      setQueryResult(null);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Header connected={connected} />

        <PromptInput
          prompt={prompt}
          error={promptError}
          loading={generating}
          onPromptChange={handlePromptChange}
          onGenerateSql={handleGenerateSql}
        />

        {generating && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm font-semibold text-indigo-700">
            Generating SQL query...
          </div>
        )}

        <QueryResultList result={queryResult} />

        {loading && <LoadingState />}

        {!loading && error && <ErrorState message={error} />}

        {!loading && !error && schema?.tables?.length === 0 && (
          <EmptyState database={schema.database} />
        )}

        {!loading && !error && schema?.tables?.length > 0 && (
          <DatabaseSchema schema={schema} />
        )}
      </div>
    </main>
  );
}

export default Home;
