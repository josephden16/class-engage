"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart } from "@/components/ui/chart";
import { Send, ThumbsUp, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { APP_ROUTES } from "@/lib/routes";
import axios from "@/lib/axios";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type Question = {
  id: string;
  text: string;
  type: "MCQ" | "TRUE_FALSE" | "OPEN_ENDED" | "FORMULA";
  options: string[];
  timeLimit: number;
  timeRemaining: number;
  answered: boolean;
  results?: { [key: string]: number };
};

type StudentQuestion = {
  id: string;
  text: string;
  upvotes: number;
  isAnswered: boolean;
};

type SessionState = {
  id: string;
  title: string;
  course: string;
  invitationCode: string;
  elapsedTime: number;
  studentCount: number;
};

type Stats = {
  answered: number;
  total: number;
};

export default function StudentSessionScreen() {
  const params = useParams();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>({
    id: params.id as string,
    title: "",
    course: "",
    invitationCode: "",
    elapsedTime: 0,
    studentCount: 0,
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [studentQuestions, setStudentQuestions] = useState<StudentQuestion[]>(
    []
  );
  const [studentAnswer, setStudentAnswer] = useState<string>("");
  const [stats, setStats] = useState<Stats>({ answered: 0, total: 0 });
  const [newQuestionText, setNewQuestionText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showKickedDialog, setShowKickedDialog] = useState(false);
  const [showEndedDialog, setShowEndedDialog] = useState(false);
  const [helpfulnessRating, setHelpfulnessRating] = useState<string>("");
  const [tempStudentSessionId, setTempStudentSessionId] = useState<
    string | null
  >(null);

  // Fetch initial data and set up WebSocket
  useEffect(() => {
    const studentSessionId = sessionStorage.getItem("studentSessionId"); // Set in JoininvitationScreen
    if (!studentSessionId) {
      toast.error("Please join the session first.");
      router.push(APP_ROUTES.STUDENT_JOIN_SESSION);
      return;
    }

    const fetchSessionData = async () => {
      try {
        const [sessionResponse, statsResponse] = await Promise.all([
          axios.get(`/sessions/${params.id}/student`, {
            headers: { "X-Student-Session-Id": studentSessionId },
          }),
          axios.get(`/sessions/${params.id}/student/stats`, {
            headers: { "X-Student-Session-Id": studentSessionId },
          }),
        ]);

        const sessionData = sessionResponse.data?.data;
        const statsData = statsResponse.data?.data;

        if (!sessionData.isActive) {
          setShowEndedDialog(true);
          const studentSessionId = sessionStorage.getItem("studentSessionId");
          setTempStudentSessionId(studentSessionId);
          sessionStorage.removeItem("studentSessionId");
          return;
        }

        setSessionState({
          id: sessionData.id,
          title: sessionData.title,
          course: sessionData.course.title,
          invitationCode: sessionData.invitationCode,
          elapsedTime: Math.floor(
            (Date.now() - new Date(sessionData.startTime).getTime()) / 1000
          ),
          studentCount: sessionData.students.length,
        });
        setCurrentQuestion(
          sessionData.currentQuestion && sessionData.currentQuestion.isActive
            ? { ...sessionData.currentQuestion, answered: false }
            : null
        );
        setStudentQuestions(
          sessionData.studentQuestions.map((sq: any) => ({
            id: sq.id,
            text: sq.text,
            upvotes: sq.upvotes,
            answeredBy: sq.answeredBy,
          }))
        );
        setStats(statsData);
      } catch (error) {
        toast.error("Failed to load session");
        router.push(APP_ROUTES.STUDENT_JOIN_SESSION);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();

    // WebSocket setup
    const newSocket = io(
      process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000"
    );
    newSocket.emit("joinSession", params.id);
    newSocket.on("studentKicked", ({ studentId }) => {
      const studentSessionId = sessionStorage.getItem("studentSessionId");
      if (studentId === studentSessionId) {
        setShowKickedDialog(true);
        sessionStorage.removeItem("studentSessionId"); // Clear session
      }
    });
    newSocket.on("questionLaunched", (question: Question) => {
      setCurrentQuestion({
        ...question,
        timeRemaining: question.timeLimit,
        answered: false,
      });
      setStudentAnswer("");
    });
    newSocket.on(
      "questionResults",
      (results: { questionId: string; results: { [key: string]: number } }) => {
        setCurrentQuestion((prev) =>
          prev && prev.id === results.questionId
            ? { ...prev, answered: true, results: results.results }
            : prev
        );
      }
    );
    newSocket.on("studentQuestionUpdate", (sq: StudentQuestion) => {
      setStudentQuestions((prev) =>
        prev.some((q) => q.id === sq.id)
          ? prev.map((q) => (q.id === sq.id ? sq : q))
          : [...prev, sq].sort((a, b) => b.upvotes - a.upvotes)
      );
    });
    newSocket.on("sessionEnded", () => {
      setShowEndedDialog(true);
      const studentSessionId = sessionStorage.getItem("studentSessionId");
      setTempStudentSessionId(studentSessionId);
      sessionStorage.removeItem("studentSessionId");
      newSocket.disconnect();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [params.id, router]);

  // Session timer and question countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionState.elapsedTime >= 0) {
      timer = setInterval(() => {
        setSessionState((prev) => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
        }));
        setCurrentQuestion((prev) =>
          prev && !prev.answered && prev.timeRemaining > 0
            ? { ...prev, timeRemaining: prev.timeRemaining - 1 }
            : prev
        );
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionState.elapsedTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmitAnswer = async () => {
    if (!studentAnswer || !currentQuestion) return;
    const studentSessionId = sessionStorage.getItem("studentSessionId");
    try {
      await axios.post(
        `/sessions/${params.id}/responses`,
        {
          questionId: currentQuestion.id,
          answer: studentAnswer,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Student-Session-Id": studentSessionId || "",
          },
        }
      );

      setCurrentQuestion((prev) => (prev ? { ...prev, answered: true } : prev));
      setStats((prev) => ({ ...prev, answered: prev.answered + 1 }));
      toast.success("Your answer has been recorded.");
    } catch (error) {
      toast.error("Failed to submit answer");
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestionText.trim()) return;
    const studentSessionId = sessionStorage.getItem("studentSessionId");
    try {
      await axios.post(
        `/sessions/${params.id}/student-questions`,
        { text: newQuestionText },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Student-Session-Id": studentSessionId || "",
          },
        }
      );
      setNewQuestionText("");
      toast.success("Your question has been added.");
    } catch (error) {
      toast.error("Failed to submit question");
    }
  };

  const handleUpvoteQuestion = async (id: string) => {
    const studentSessionId = sessionStorage.getItem("studentSessionId");
    try {
      await axios.post(
        `/sessions/${params.id}/student-questions/${id}/upvote`,
        {},
        {
          headers: { "X-Student-Session-Id": studentSessionId || "" },
        }
      );
    } catch (error) {
      toast.error("Failed to upvote question");
    }
  };

  const handleSubmitPoll = async () => {
    if (!helpfulnessRating) {
      toast.error("Please select a rating before submitting.");
      return;
    }

    try {
      await axios.post(
        `/sessions/${params.id}/poll`,
        { answer: helpfulnessRating },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Student-Session-Id": tempStudentSessionId || "",
          },
        }
      );
      toast.success("Thank you for your feedback");
      router.push(APP_ROUTES.STUDENT_JOIN_SESSION);
    } catch (error) {
      toast.error("Failed to submit feedback");
      // router.push(APP_ROUTES.STUDENT_JOIN_SESSION); // Redirect anyway
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  const chartData = currentQuestion?.results
    ? {
        labels: Object.keys(currentQuestion.results),
        datasets: [
          {
            label: "Responses",
            data: Object.values(currentQuestion.results),
            backgroundColor: ["#4299E1", "#48BB78", "#ECC94B", "#F56565"],
          },
        ],
      }
    : { labels: [], datasets: [] };

  const renderQuestionInput = () => {
    if (!currentQuestion) return <p>No active question.</p>;
    switch (currentQuestion.type) {
      case "MCQ":
        return (
          <RadioGroup
            value={studentAnswer}
            onValueChange={setStudentAnswer}
            disabled={currentQuestion.answered}
            className="space-y-2"
          >
            {currentQuestion.options.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={String.fromCharCode(65 + idx)}
                  id={`opt-${idx}`}
                />
                <Label htmlFor={`opt-${idx}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "TRUE_FALSE":
        return (
          <RadioGroup
            value={studentAnswer}
            onValueChange={setStudentAnswer}
            disabled={currentQuestion.answered}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="True" id="true" />
              <Label htmlFor="true">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="False" id="false" />
              <Label htmlFor="false">False</Label>
            </div>
          </RadioGroup>
        );
      case "OPEN_ENDED":
        return (
          <Textarea
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={currentQuestion.answered}
            className="min-h-[100px]"
          />
        );
      case "FORMULA":
        return (
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Formula-based question (display only)
            </p>
            <Textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Type your formula answer here..."
              disabled={currentQuestion.answered}
            />
          </div>
        );
      default:
        return null;
    }
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Question */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Current Question</span>
                {currentQuestion && !currentQuestion.answered && (
                  <span className="text-lg font-bold text-primary">
                    Time left: {formatTime(currentQuestion.timeRemaining)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion ? (
                <>
                  <p className="text-lg font-semibold mb-4">
                    {currentQuestion.text}
                  </p>
                  {renderQuestionInput()}
                  {!currentQuestion.answered &&
                    currentQuestion.timeRemaining > 0 && (
                      <Button
                        onClick={handleSubmitAnswer}
                        className="mt-4 w-full"
                      >
                        Submit Answer
                      </Button>
                    )}
                  {currentQuestion.answered && currentQuestion.results && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Results</h3>
                      <div className="w-full h-64">
                        <BarChart data={chartData} />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-lg font-semibold">
                  Waiting for the lecturer to launch a question...
                </p>
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
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
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
                            <span>{question.upvotes} votes</span>
                            {question.isAnswered && (
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
                  <AvatarImage src="https://api.dicebear.com/6.x/initials/svg?seed=Student" />
                  <AvatarFallback>ST</AvatarFallback>
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
                <p className="text-2xl font-bold text-primary">
                  {stats.answered}/{stats.total}
                </p>
              </div>
            </div>
            <Progress
              value={(stats.answered / (stats.total || 1)) * 100}
              className="mt-4"
            />
          </CardContent>
        </Card>
      </main>

      {/* Kicked Dialog */}
      <AlertDialog open={showKickedDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>You’ve Been Kicked Out</AlertDialogTitle>
          <AlertDialogDescription>
            The lecturer has removed you from the session. You’ll be redirected
            to the join session page.
          </AlertDialogDescription>
          <AlertDialogAction
            onClick={() => router.push(APP_ROUTES.STUDENT_JOIN_SESSION)}
          >
            OK
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session Ended Dialog */}
      <AlertDialog open={showEndedDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Session Ended</AlertDialogTitle>
          <AlertDialogDescription>
            The lecturer has ended the session. Please let us know how helpful
            you found it:
          </AlertDialogDescription>
          <RadioGroup
            value={helpfulnessRating}
            onValueChange={setHelpfulnessRating}
            className="space-y-2 mt-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Very Helpful" id="very-helpful" />
              <Label htmlFor="very-helpful">Very Helpful</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Somewhat Helpful" id="somewhat-helpful" />
              <Label htmlFor="somewhat-helpful">Somewhat Helpful</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Neutral" id="neutral" />
              <Label htmlFor="neutral">Neutral</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Not Helpful" id="not-helpful" />
              <Label htmlFor="not-helpful">Not Helpful</Label>
            </div>
          </RadioGroup>
          <AlertDialogAction onClick={handleSubmitPoll} className="mt-4">
            Submit Feedback
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

