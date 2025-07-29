import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  FiUpload,
  FiFile,
  FiX,
  FiZap,
  FiCheck,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const QuizGenerator = () => {
  // State declarations
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [quizSettings, setQuizSettings] = useState({
    questionCount: 10,
    difficulty: "medium",
    questionTypes: ["multiple-choice", "true-false"],
    model: "mistralai/mixtral-8x7b-instruct",
  });

  // Helper function to read file content
  const readFileContent = async (file) => {
    if (file.type === "application/pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(" ");
          text += pageText + "\n";
        }

        return text;
      } catch (e) {
        console.error("Error reading PDF:", e);
        return "[PDF content could not be extracted]";
      }
    } else {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    }
  };

  // Helper function to extract JSON from AI response
  const extractJsonFromResponse = (responseText) => {
    try {
      const jsonStart = responseText.indexOf("{");
      const jsonEnd = responseText.lastIndexOf("}") + 1;
      const jsonString = responseText.slice(jsonStart, jsonEnd);
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      throw new Error("AI response did not contain valid JSON");
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const generateQuiz = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one document.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const fileContents = await Promise.all(
        uploadedFiles.map(async (file) => {
          try {
            const text = await readFileContent(file.file);
            return `### Document: ${file.name}\n${text.substring(0, 10000)}`;
          } catch (e) {
            console.error(`Error reading file ${file.name}:`, e);
            return `### Document: ${file.name}\n[Content could not be read]`;
          }
        })
      );

      const combinedContent = fileContents.join("\n\n");

      const prompt = `
        TASK: Generate a quiz from the provided documents in STRICT JSON FORMAT.
        
        REQUIREMENTS:
        - Create exactly ${quizSettings.questionCount} questions
        - Difficulty level: ${quizSettings.difficulty}
        - Question types: ${quizSettings.questionTypes.join(", ")}
        - For multiple-choice: Always provide 4 options
        - Include clear explanations for correct answers
        
        DOCUMENTS:
        ${combinedContent}
        
        OUTPUT FORMAT (MUST FOLLOW EXACTLY):
        {
          "title": "Quiz title summarizing the content",
          "questions": [
            {
              "id": 1,
              "type": "multiple-choice" or "true-false",
              "question": "Clear question text",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "correctAnswer": 0,
              "explanation": "Detailed explanation of why this is correct"
            }
          ]
        }
      `;

      // Fix 2: Get API key from environment variables properly
      const apiKey =
        process.env.REACT_APP_OPENROUTER_KEY ||
        window.REACT_APP_OPENROUTER_API_KEY ||
        localStorage.getItem("openrouter_api_key");

      if (!apiKey) {
        throw new Error(
          "OpenRouter API key not found. Please set REACT_APP_OPENROUTER_KEY in your .env file or add it to localStorage."
        );
      }

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.href,
            "X-Title": "AI Quiz Generator",
          },
          body: JSON.stringify({
            model: quizSettings.model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
            max_tokens: 4000,
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API request failed");
      }

      const data = await response.json();

      let quizJson;
      try {
        const responseText = data.choices[0]?.message?.content;
        if (!responseText) throw new Error("No content in response");

        try {
          quizJson = JSON.parse(responseText);
        } catch {
          quizJson = extractJsonFromResponse(responseText);
        }

        if (
          !quizJson ||
          !quizJson.questions ||
          !Array.isArray(quizJson.questions)
        ) {
          throw new Error("Invalid quiz structure received");
        }
      } catch (e) {
        console.error("Response parsing error:", e, "Response:", data);
        throw new Error("Failed to parse quiz data from AI");
      }

      const validatedQuestions = quizJson.questions
        .slice(0, quizSettings.questionCount)
        .map((q, i) => {
          const options =
            q.type === "multiple-choice"
              ? [...(q.options || []), ...Array(4).fill("Option")].slice(0, 4)
              : ["True", "False"];

          return {
            id: q.id || i + 1,
            type: q.type === "true-false" ? "true-false" : "multiple-choice",
            question: q.question || `Question ${i + 1}`,
            options: options.map((opt, idx) =>
              opt.replace("Option", `Option ${idx + 1}`)
            ),
            correctAnswer:
              typeof q.correctAnswer === "number"
                ? Math.max(0, Math.min(q.correctAnswer, options.length - 1))
                : 0,
            explanation: q.explanation || "Explanation not provided",
          };
        });

      setGeneratedQuiz({
        title: quizJson.title || "Generated Quiz",
        questions: validatedQuestions,
      });
    } catch (error) {
      console.error("Quiz generation error:", error);
      setError(error.message || "Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < generatedQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!generatedQuiz) return 0;
    let correct = 0;
    generatedQuiz.questions.forEach((question) => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / generatedQuiz.questions.length) * 100);
  };

  const resetQuiz = () => {
    setGeneratedQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setError(null);
  };

  // Results Screen
  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex">
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                    score >= 80
                      ? "bg-green-100 dark:bg-green-900"
                      : score >= 60
                      ? "bg-yellow-100 dark:bg-yellow-900"
                      : "bg-red-100 dark:bg-red-900"
                  }`}
                >
                  <span className="text-3xl">
                    {score >= 80 ? "🎉" : score >= 60 ? "👏" : "🌟"}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  Quiz Complete!
                </h2>
                <div className="text-6xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                  {score}%
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  You got{" "}
                  {
                    generatedQuiz.questions.filter(
                      (q) => userAnswers[q.id] === q.correctAnswer
                    ).length
                  }{" "}
                  out of {generatedQuiz.questions.length} questions correct
                </p>
              </div>

              <div className="space-y-6">
                {generatedQuiz.questions.map((question, index) => {
                  const userAnswer = userAnswers[question.id];
                  const isCorrect = userAnswer === question.correctAnswer;

                  return (
                    <div
                      key={question.id}
                      className={`p-6 rounded-xl border-2 ${
                        isCorrect
                          ? "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                          : "border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-full ${
                            isCorrect ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {isCorrect ? (
                            <FiCheck className="text-white" />
                          ) : (
                            <FiX className="text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                            Question {index + 1}: {question.question}
                          </h3>
                          <div className="space-y-2 mb-4">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border ${
                                  optionIndex === question.correctAnswer
                                    ? "bg-green-200 border-green-400 dark:bg-green-800 dark:border-green-600"
                                    : optionIndex === userAnswer
                                    ? "bg-red-200 border-red-400 dark:bg-red-800 dark:border-red-600"
                                    : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                <span className="font-medium text-gray-800 dark:text-gray-100">
                                  {String.fromCharCode(65 + optionIndex)}.{" "}
                                  {option}
                                </span>
                                {optionIndex === question.correctAnswer && (
                                  <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                                    ✓ Correct
                                  </span>
                                )}
                                {optionIndex === userAnswer &&
                                  optionIndex !== question.correctAnswer && (
                                    <span className="ml-2 text-red-600 dark:text-red-400 font-semibold">
                                      ✗ Your answer
                                    </span>
                                  )}
                              </div>
                            ))}
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>Explanation:</strong>{" "}
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-8 justify-center">
                <button
                  onClick={resetQuiz}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
                >
                  <FiRefreshCw />
                  Generate New Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (generatedQuiz) {
    const currentQuestion = generatedQuiz.questions[currentQuestionIndex];
    const progress =
      ((currentQuestionIndex + 1) / generatedQuiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 flex">
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {generatedQuiz.title}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiClock />
                    <span>
                      Question {currentQuestionIndex + 1} of{" "}
                      {generatedQuiz.questions.length}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-teal-600 dark:bg-teal-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleAnswerSelect(currentQuestion.id, index)
                      }
                      className={`w-full p-4 text-left rounded-xl border-2 transition ${
                        userAnswers[currentQuestion.id] === index
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                          : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                      }`}
                    >
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {Object.keys(userAnswers).length} of{" "}
                  {generatedQuiz.questions.length} answered
                </div>

                {currentQuestionIndex === generatedQuiz.questions.length - 1 ? (
                  <button
                    onClick={submitQuiz}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
                <img
                  src="/SBmascot.png"
                  alt="StudyBuddy Mascot"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-black dark:text-teal-400 mb-2">
                StudyBuddy Quiz Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Upload your study materials and get personalized quiz questions
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiX className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Quiz Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Questions
                  </label>
                  <select
                    value={quizSettings.questionCount}
                    onChange={(e) =>
                      setQuizSettings((prev) => ({
                        ...prev,
                        questionCount: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={quizSettings.difficulty}
                    onChange={(e) =>
                      setQuizSettings((prev) => ({
                        ...prev,
                        difficulty: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Types
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <option>Multiple Choice & True/False</option>
                    <option>Multiple Choice Only</option>
                    <option>True/False Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI Model
                  </label>
                  <select
                    value={quizSettings.model}
                    onChange={(e) =>
                      setQuizSettings((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="mistralai/mixtral-8x7b-instruct">
                      Mixtral 8x7B
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center mb-6 hover:border-blue-400 dark:hover:border-blue-500 transition">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FiUpload className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Upload Study Materials
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <div className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-500 transition">
                  Choose Files
                </div>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Uploaded Files
                </h3>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FiFile className="text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={generateQuiz}
                disabled={uploadedFiles.length === 0 || isGenerating}
                className="inline-flex items-center gap-3 px-8 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <FiZap />
                    Generate AI Quiz
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supported formats: PDF, DOC, DOCX, TXT, PPT, PPTX
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;
