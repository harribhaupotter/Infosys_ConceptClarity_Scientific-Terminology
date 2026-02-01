import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { explainTerm, getSearchHistory } from "../services/searchService";
import { isAdmin } from "../utils/jwt";
import { getStoredLanguage, setStoredLanguage, LANGUAGES, type Language } from "../utils/language";
import { submitFeedback } from "../services/feedbackService";
import { saveExplanation, getSavedExplanations, deleteSavedExplanation, type SavedExplanation } from "../services/saveService";


const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [history, setHistory] = useState<string[]>([]);
  const [guestQueryCount, setGuestQueryCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [level, setLevel] = useState("student");
  const [fullResponse, setFullResponse] = useState<any>(null);
  const [showJson, setShowJson] = useState(false);
  const [language, setLanguage] = useState<Language>(getStoredLanguage());
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedExplanation[]>([]);
  const token = localStorage.getItem("token");
  useEffect(() => {
    const loadHistory = async () => {
      if (!token) return;

      try {
        const data = await getSearchHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load history");
      }
    };

    const loadSavedItems = async () => {
      if (!token) return;

      try {
        const data = await getSavedExplanations();
        setSavedItems(data);
      } catch (err) {
        console.error("Failed to load saved items");
      }
    };

    loadHistory();
    loadSavedItems();
  }, [token]);

  // Check if current term is saved whenever searchTerm or savedItems change
  useEffect(() => {
    if (!token || !searchTerm) {
      setIsSaved(false);
      return;
    }
    const saved = savedItems.some(item => item.term === searchTerm);
    setIsSaved(saved);
  }, [searchTerm, savedItems, token]);
 
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Check if guest is trying to query for the second time
    if (!token && guestQueryCount >= 1) {
      alert("Please login or signup to continue using the service.");
      return;
    }

    setIsLoading(true);
    setExplanation("");
    setFullResponse(null);
    setShowJson(false);
    setFeedbackSubmitted(false);
    setFeedbackReason("");
    setIsSaved(false);

    try {
      let response;

      // Logged-in user
      if (token) {
        response = await explainTerm(searchTerm, false, level, language);
        setFullResponse(response);
        setExplanation(response?.explanation || "");

        // Refresh history from backend after search
        const updated = await getSearchHistory();
        setHistory(updated);
      } else {
        // Guest user – allow first query, then increment count after successful response
        response = await explainTerm(searchTerm, true, level, language);
        console.log("Guest response:", response); // Debug log
        
        // Check if response has an error field
        if (response?.error) {
          setExplanation(`Error: ${response.error}`);
          setFullResponse(response);
        } else {
          setFullResponse(response);
          const explanationText = response?.explanation || "";
          console.log("Explanation text:", explanationText); // Debug log
          setExplanation(explanationText);
        }
        // Increment guest query count after successful query completion
        setGuestQueryCount(1);
      }
    } catch (error) {
      console.error("Error in handleSearch:", error); // Debug log
      setExplanation("Sorry, an error occurred. Please try again.");
      setFullResponse(null);
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleRelatedTermClick = async (term: string) => {
    setSearchTerm(term);
    setIsLoading(true);
    setExplanation("");
    setFullResponse(null);
    setShowJson(false);
    setFeedbackSubmitted(false);
    setFeedbackReason("");
    setIsSaved(false);

    try {
      let response;

      // Logged-in user
      if (token) {
        response = await explainTerm(term, false, level, language);
        setFullResponse(response);
        setExplanation(response?.explanation || "");

        // Refresh history from backend after search
        const updated = await getSearchHistory();
        setHistory(updated);
      } else {
        // Guest user – allow first query, then increment count after successful response
        response = await explainTerm(term, true, level, language);
        console.log("Guest response (related term):", response); // Debug log
        
        // Check if response has an error field
        if (response?.error) {
          setExplanation(`Error: ${response.error}`);
          setFullResponse(response);
        } else {
          setFullResponse(response);
          const explanationText = response?.explanation || "";
          console.log("Explanation text (related term):", explanationText); // Debug log
          setExplanation(explanationText);
        }
        // Increment guest query count after successful query completion
        setGuestQueryCount(1);
      }
    } catch (error) {
      console.error("Error in handleRelatedTermClick:", error); // Debug log
      setExplanation("Sorry, an error occurred. Please try again.");
      setFullResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSearch = () => {
    // Feature-detect the Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      setIsListening(false);
      alert("Unable to start voice recognition. Please try again.");
    }
  };

  const handleThumbsUp = async () => {
    if (feedbackSubmitted || !explanation || !searchTerm) return;

    try {
      await submitFeedback(
        {
          term: searchTerm,
          rating: "positive",
          reason: "",
          explanation: explanation,
        },
        !token
      );
      setFeedbackSubmitted(true);
    } catch (error: any) {
      console.error("Failed to submit feedback:", error);
      alert(`Failed to submit feedback: ${error.message || "Please try again."}`);
    }
  };

  const handleThumbsDown = () => {
    if (feedbackSubmitted || !explanation || !searchTerm) return;
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackReason.trim()) {
      alert("Please provide a reason for your feedback.");
      return;
    }

    try {
      await submitFeedback(
        {
          term: searchTerm,
          rating: "negative",
          reason: feedbackReason,
          explanation: explanation,
        },
        !token
      );
      setFeedbackSubmitted(true);
      setShowFeedbackModal(false);
      setFeedbackReason("");
    } catch (error: any) {
      console.error("Failed to submit feedback:", error);
      alert(`Failed to submit feedback: ${error.message || "Please try again."}`);
    }
  };

  const handleSave = async () => {
    if (!token) {
      alert("Please login to save explanations.");
      return;
    }

    if (!explanation || !searchTerm) {
      return;
    }

    try {
      if (isSaved) {
        // Unsave: delete the saved explanation
        await deleteSavedExplanation(searchTerm);
        setIsSaved(false);
      } else {
        // Save the explanation
        await saveExplanation({
          term: searchTerm,
          explanation: explanation,
        });
        setIsSaved(true);
      }
      // Refresh saved items
      const data = await getSavedExplanations();
      setSavedItems(data);
    } catch (error: any) {
      console.error("Failed to save/unsave explanation:", error);
      alert(`Failed to ${isSaved ? "unsave" : "save"} explanation: ${error.message || "Please try again."}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-8 border-b border-gray-800/50">
        <div></div>
        <div className="flex items-center gap-8">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value as Language;
                setLanguage(newLang);
                setStoredLanguage(newLang);
              }}
              className="px-5 py-3 text-base bg-gray-900 text-gray-100 border border-gray-700 rounded-xl hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 cursor-pointer appearance-none pr-10 shadow-soft transition-all"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          {token ? (
            <>
              {isAdmin() && (
                <button
                  onClick={() => navigate("/admin")}
                  className="text-base text-gray-300 hover:text-gray-100 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all"
                >
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={() => navigate("/profile")}
                className="text-base text-gray-300 hover:text-gray-100 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="text-base text-gray-300 hover:text-gray-100 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-base text-gray-300 hover:text-gray-100 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="text-base text-gray-300 hover:text-gray-100 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all"
              >
                Signup
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main
        className="flex flex-col items-center justify-center px-4"
        style={{ minHeight: "calc(100vh - 140px)" }}
      >
        <div className="w-full max-w-3xl">
          {/* App Title */}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-100 mb-4 leading-tight tracking-tight">
              Scientific Terminologies Simplified
            </h1>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-12">
            <div className="mb-6 flex justify-center">
              <div className="flex gap-2 bg-gray-900 border border-gray-700 rounded-full p-1.5 shadow-soft">
                <button
                  type="button"
                  onClick={() => setLevel("student")}
                  className={`px-7 py-3 rounded-full text-base font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    level === "student"
                      ? "bg-blue-600 text-white shadow-medium"
                      : "text-gray-300 hover:text-gray-100 hover:bg-gray-800/50"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setLevel("enthusiast")}
                  className={`px-7 py-3 rounded-full text-base font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    level === "enthusiast"
                      ? "bg-blue-600 text-white shadow-medium"
                      : "text-gray-300 hover:text-gray-100 hover:bg-gray-800/50"
                  }`}
                >
                  Enthusiast
                </button>
                <button
                  type="button"
                  onClick={() => setLevel("expert")}
                  className={`px-7 py-3 rounded-full text-base font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    level === "expert"
                      ? "bg-blue-600 text-white shadow-medium"
                      : "text-gray-300 hover:text-gray-100 hover:bg-gray-800/50"
                  }`}
                >
                  Expert
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-20 pl-6 py-5 text-lg bg-gray-900 text-gray-100 border border-gray-700 rounded-full shadow-large focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-600 transition-all placeholder-gray-500"
                placeholder="Enter a scientific term to explain..."
                autoFocus
              />
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  isListening
                    ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/40 animate-pulse"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-gray-100 hover:border-gray-600"
                }`}
                aria-label={isListening ? "Listening for voice search" : "Start voice search"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill={isListening ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 1.5a3 3 0 00-3 3v7.5a3 3 0 106 0V4.5a3 3 0 00-3-3z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 10.5A6.75 6.75 0 0012 17.25m0 0A6.75 6.75 0 0018.75 10.5M12 17.25V21"
                  />
                </svg>
              </button>
            </div>
            {isListening && (
              <p className="mt-3 text-base text-red-400 text-center font-medium">
                Listening…
              </p>
            )}
            {history.length > 0 && (
              <div className="mt-4 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-soft">
                <p className="text-base text-gray-400 mb-3 font-medium">Recent searches</p>
                <div className="flex flex-wrap gap-2.5">
                  {history.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSearchTerm(term)}
                      className="px-4 py-2 text-base bg-gray-800 text-gray-200 rounded-full hover:bg-gray-700 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-center mt-10">
              <button
                type="submit"
                disabled={isLoading}
                className="px-14 py-4 text-lg font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-medium hover:shadow-large"
              >
                {isLoading ? "Explaining..." : "Explain"}
              </button>
            </div>
          </form>

          {/* Explanation Output */}
          {(explanation || fullResponse) && (
            <>
              <div className="mt-12 p-10 bg-gray-900 rounded-2xl border border-gray-800 shadow-large">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-semibold text-gray-100">
                    Explanation
                  </h2>
                  <div className="flex items-center gap-4">
                    {/* Save Button */}
                    {token && (
                      <button
                        onClick={handleSave}
                        className={`p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                          isSaved
                            ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                            : "text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50"
                        }`}
                        aria-label={isSaved ? "Unsave explanation" : "Save explanation"}
                        title={isSaved ? "Click to unsave" : "Click to save"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill={isSaved ? "currentColor" : "none"}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>
                    )}
                    {/* Feedback Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleThumbsUp}
                        disabled={feedbackSubmitted}
                        className={`p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                          feedbackSubmitted
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-800/50 text-gray-400 hover:text-green-400"
                        }`}
                        aria-label="Thumbs up"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={handleThumbsDown}
                        disabled={feedbackSubmitted}
                        className={`p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                          feedbackSubmitted
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-800/50 text-gray-400 hover:text-red-400"
                        }`}
                        aria-label="Thumbs down"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                          />
                        </svg>
                      </button>
                    </div>
                    {fullResponse && (
                      <button
                        onClick={() => setShowJson(!showJson)}
                        className="px-5 py-2.5 text-base font-medium bg-gray-800 text-gray-200 rounded-xl hover:bg-gray-700 hover:text-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                      >
                        JSON
                      </button>
                    )}
                  </div>
                </div>
                {showJson && fullResponse ? (
                  <pre className="text-base text-gray-300 leading-relaxed whitespace-pre-wrap overflow-x-auto bg-gray-950 p-5 rounded-xl border border-gray-700 shadow-soft">
                    {JSON.stringify(fullResponse, null, 2)}
                  </pre>
                ) : (
                  <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {explanation || (fullResponse ? "No explanation available. Please check the JSON view for details." : "")}
                  </p>
                )}
              </div>
              
              {/* Related Terms */}
              {fullResponse && (fullResponse.related_terms || fullResponse.relative_terms) && (
                <div className="mt-8 p-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-large">
                  <h3 className="text-2xl font-semibold text-gray-100 mb-6">
                    Related Terms
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(fullResponse.related_terms || fullResponse.relative_terms || []).map((term: string, index: number) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleRelatedTermClick(term)}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-base font-medium bg-gray-800 text-gray-200 rounded-full hover:bg-blue-600 hover:text-white active:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-medium"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Feedback Modal */}
          {showFeedbackModal && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowFeedbackModal(false);
                setFeedbackReason("");
              }}
            >
              <div 
                className="bg-gray-900 rounded-2xl border border-gray-800 shadow-large p-10 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-semibold text-gray-100 mb-2">
                  Help Us Improve
                </h3>
                <p className="text-base text-gray-300 mb-6 leading-relaxed">
                  Please let us know why this explanation wasn't helpful:
                </p>
                <textarea
                  value={feedbackReason}
                  onChange={(e) => setFeedbackReason(e.target.value)}
                  placeholder="Enter your feedback here..."
                  className="w-full px-5 py-4 text-base bg-gray-800 text-gray-100 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder-gray-500 leading-relaxed"
                  rows={5}
                />
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleFeedbackSubmit}
                    className="flex-1 px-6 py-3.5 text-base font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-medium hover:shadow-large"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => {
                      setShowFeedbackModal(false);
                      setFeedbackReason("");
                    }}
                    className="flex-1 px-6 py-3.5 text-base font-semibold bg-gray-800 text-gray-200 rounded-xl hover:bg-gray-700 active:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
