"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart } from "@/components/ui/chart";
import {
  Send,
  ThumbsUp,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function StudentSessionScreen() {
  const [sessionState, setSessionState] = useState({
    title: "Introduction to React Hooks",
    course: "Web Development Fundamentals",
    elapsedTime: 0,
    studentCount: 42,
    sessionCode: "WD101-HOOKS",
    isPaused: false,
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    text: "What is the primary purpose of the useEffect hook in React?",
    type: "multiple-choice",
    options: [
      { id: "A", text: "Handling side effects", votes: 15 },
      { id: "B", text: "State management", votes: 10 },
      { id: "C", text: "Routing", votes: 5 },
      { id: "D", text: "Data fetching", votes: 12 },
    ],
    timeRemaining: 30,
    answered: false,
  });

  const [studentAnswer, setStudentAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [studentQuestions, setStudentQuestions] = useState([
    {
      id: 1,
      text: "Can you explain the difference between useEffect and useLayoutEffect?",
      votes: 5,
      answered: false,
    },
    {
      id: 2,
      text: "How do you handle multiple effects in a single component?",
      votes: 3,
      answered: false,
    },
  ]);

  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionState((prev) => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1,
      }));
      if (currentQuestion.timeRemaining > 0 && !currentQuestion.answered) {
        setCurrentQuestion((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion.answered, currentQuestion.timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmitAnswer = () => {
    if (studentAnswer) {
      setCurrentQuestion((prev) => ({ ...prev, answered: true }));
      // Here you would typically send the answer to your backend
      console.log("Submitted answer:", studentAnswer);
    }
  };

  const handleSubmitQuestion = () => {
    if (newQuestion.trim()) {
      setStudentQuestions((prev) =>
        [
          ...prev,
          { id: Date.now(), text: newQuestion, votes: 0, answered: false },
        ].sort(
          (prevQuestion, nextQuestion) =>
            nextQuestion.votes - prevQuestion.votes
        )
      );
      setNewQuestion("");
    }
  };

  const handleUpvoteQuestion = (id: number) => {
    setStudentQuestions((prev) =>
      prev
        .map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q))
        .sort(
          (prevQuestion, nextQuestion) =>
            nextQuestion.votes - prevQuestion.votes
        )
    );
  };

  const chartData = {
    labels: currentQuestion.options.map((opt) => opt.id),
    datasets: [
      {
        label: "Votes",
        data: currentQuestion.options.map((opt) => opt.votes),
        backgroundColor: ["#4299E1", "#48BB78", "#ECC94B", "#F56565"],
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Session Header */}
      <header className="sticky top-0 z-10 bg-white shadow-md p-4">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {sessionState.title}
            </h1>
            <p className="text-sm text-gray-600">{sessionState.course}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Time</p>
              <p className="font-semibold">
                {formatTime(sessionState.elapsedTime)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Students</p>
              <p className="font-semibold">{sessionState.studentCount}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Session Code</p>
              <p className="font-semibold">{sessionState.sessionCode}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 space-y-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Current Question */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Current Question</span>
                {currentQuestion.timeRemaining > 0 &&
                  !currentQuestion.answered && (
                    <span className="text-lg font-bold text-primary">
                      Time left: {formatTime(currentQuestion.timeRemaining)}
                    </span>
                  )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold mb-4">
                {currentQuestion.text}
              </p>
              {currentQuestion.type === "multiple-choice" && (
                <RadioGroup
                  value={studentAnswer}
                  onValueChange={setStudentAnswer}
                  className="space-y-2"
                  disabled={currentQuestion.answered}
                >
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id}>{option.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {!currentQuestion.answered && (
                <Button onClick={handleSubmitAnswer} className="mt-4 w-full">
                  Submit Answer
                </Button>
              )}
              {(currentQuestion.answered || showResults) && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Results</h3>
                  <div className="w-full h-64">
                    <BarChart data={chartData} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Q&A Section */}
          <Card>
            <CardHeader>
              <CardTitle>Q&A</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask a question..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                  <Button onClick={handleSubmitQuestion}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {studentQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="flex items-start space-x-2"
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpvoteQuestion(question.id)}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <div className="flex-grow">
                          <p className="font-semibold">{question.text}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{question.votes} votes</span>
                            {question.answered && (
                              <span className="flex items-center text-green-500">
                                <CheckCircle2 className="h-4 w-4 mr-1" />{" "}
                                Answered
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participation Status */}
        <Card>
          <CardHeader>
            <CardTitle>Your Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Connected</p>
                  <p className="text-sm text-gray-500">
                    Active for {formatTime(sessionState.elapsedTime)}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-semibold">Questions Answered</p>
                <p className="text-2xl font-bold text-primary">5/10</p>
              </div>
            </div>
            <Progress value={50} className="mt-4" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

