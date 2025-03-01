"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PieChart } from "@/components/ui/chart";
import {
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Eye,
  EyeOff,
  MicOff,
  UserMinus,
  Share2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "@/lib/axios";
import { APP_ROUTES } from "@/lib/routes";

type Question = {
  results: any;
  id: string;
  text: string;
  type: "MCQ" | "TRUE_FALSE" | "OPEN_ENDED" | "FORMULA";
  options: { id: string; text: string; votes: number }[];
  timeLimit: number;
  timeRemaining: number;
  isLaunched: boolean;
  responseRate: number;
};

type Student = {
  id: string;
  name: string;
  matricNo: string;
  status: "active" | "inactive";
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
  isSessionActive: boolean;
};

export default function LiveSessionScreen() {
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
    isSessionActive: false,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentQuestions, setStudentQuestions] = useState<StudentQuestion[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const currentQuestion = questions[currentQuestionIndex];

  // Initialize session data and WebSocket
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get(`/sessions/${params.id}`);

        const data = response.data?.data;

        if (!data.isActive) {
          router.replace(APP_ROUTES.DASHBOARD);
          return;
        }

        setSessionState({
          id: data.id,
          title: data.title,
          course: data.course.title,
          invitationCode: data.invitationCode,
          elapsedTime: Math.floor(
            (Date.now() - new Date(data.startTime).getTime()) / 1000
          ),
          studentCount: data.students.length,
          isSessionActive: data.isActive,
        });
        setQuestions(
          data.questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: q.options.map((opt: string, idx: number) => ({
              id: String.fromCharCode(65 + idx), // A, B, C, D
              text: opt,
              votes: 0,
            })),
            timeLimit: q.timeLimit,
            timeRemaining: q.timeLimit,
            isLaunched: false,
            responseRate: 0,
          }))
        );
        setStudents(
          data.students.map((s: any) => ({ ...s, status: "active" }))
        );
        setStudentQuestions(
          data.studentQuestions.map((sq: any) => ({
            id: sq.id,
            text: sq.text,
            upvotes: sq.upvotes,
            answeredBy: sq.answeredBy,
          }))
        );
      } catch (error) {
        toast.error("Failed to load session");
        // router.push(APP_ROUTES.DASHBOARD);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();

    // WebSocket setup
    const newSocket = io(
      process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000"
    );
    newSocket.emit("joinSession", params.id);
    newSocket.on(
      "questionResponse",
      (response: { questionId: string; optionId: string }) => {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === response.questionId
              ? {
                  ...q,
                  options: q.options.map((opt) =>
                    opt.id === response.optionId
                      ? { ...opt, votes: opt.votes + 1 }
                      : opt
                  ),
                  responseRate: Math.min(
                    ((q.options.reduce((sum, opt) => sum + opt.votes, 0) + 1) /
                      sessionState.studentCount) *
                      100,
                    100
                  ),
                }
              : q
          )
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
    newSocket.on("studentUpdate", (student: Student) => {
      setStudents((prev) =>
        prev.some((s) => s.id === student.id)
          ? prev.map((s) => (s.id === student.id ? student : s))
          : [...prev, student]
      );
      setSessionState((prev) => ({
        ...prev,
        studentCount: prev.studentCount + 1,
      }));
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [params.id, router]);

  // Session timer and question countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionState.isSessionActive) {
      timer = setInterval(() => {
        setSessionState((prev) => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
        }));
        setQuestions((prev) =>
          prev.map((q) =>
            q.isLaunched && q.timeRemaining > 0
              ? { ...q, timeRemaining: q.timeRemaining - 1 }
              : q
          )
        );
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionState.isSessionActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartSession = async () => {
    try {
      await axios.post(`/sessions/${params.id}/start`);
      setSessionState((prev) => ({ ...prev, isSessionActive: true }));
      toast.success("Session started");
    } catch (error) {
      toast.error("Failed to start session");
    }
  };

  const handleEndSession = async () => {
    try {
      await axios.post(`/sessions/${params.id}/end`);
      toast.success("Session ended");
      window.location.href = APP_ROUTES.DASHBOARD;
    } catch (error) {
      toast.error("Failed to end session");
    }
  };

  const handleLaunchQuestion = async () => {
    const question = currentQuestion;
    try {
      await axios.post(
        `/sessions/${params.id}/questions/${question.id}/launch`
      );
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? { ...q, isLaunched: true } : q))
      );
      socket?.emit("questionLaunched", { sessionId: params.id, question });
      toast.success("Question launched");
    } catch (error) {
      toast.error("Failed to launch question");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleUpvoteStudentQuestion = async (id: string) => {
    try {
      await axios.post(`/sessions/${params.id}/student-questions/${id}/upvote`);
    } catch (error) {
      toast.error("Failed to upvote question");
    }
  };

  const handleToggleAnswered = async (id: string) => {
    try {
      await axios.post(
        `/sessions/${params.id}/student-questions/${id}/toggle-answered`
      );
      setStudentQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, answeredBy: !q.isAnswered } : q))
      );
      toast.success("Question updated");
    } catch (error) {
      toast.error("Failed to toggle answered status");
    }
  };

  const handleKickStudent = async (studentId: string) => {
    try {
      await axios.post(`/sessions/${params.id}/students/${studentId}/action`, {
        action: "kick",
      });
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setSessionState((prev) => ({
        ...prev,
        studentCount: prev.studentCount - 1,
      }));
      toast.success("Student removed");
    } catch (error) {
      toast.error("Failed to kick student");
    }
  };

  const handleShareSession = () => {
    navigator.clipboard.writeText(sessionState.invitationCode);
    toast.success("Session code copied to clipboard");
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
            {/* <div className="text-center">
              <p className="text-xs text-gray-500">Session Code</p>
              <p className="font-semibold">{sessionState.invitationCode}</p>
            </div> */}
            <Button variant="outline" size="sm" onClick={handleShareSession}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
            {sessionState.isSessionActive ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndSession}
              >
                End Session
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={handleStartSession}>
                Start Session
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 space-y-6">
        {/* Question Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-semibold">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleLaunchQuestion}
                disabled={
                  !sessionState.isSessionActive || currentQuestion?.isLaunched
                }
              >
                Launch Question
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Question Display */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Current Question</CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion ? (
                currentQuestion.isLaunched ? (
                  <>
                    <p className="text-lg font-semibold mb-2">
                      {currentQuestion.text}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Type: {currentQuestion.type}
                    </p>
                    <p className="text-sm font-semibold mb-4">
                      Time Remaining:{" "}
                      {formatTime(currentQuestion.timeRemaining)}
                    </p>
                    <div className="space-y-2 mb-4">
                      {currentQuestion.options.map((option) => (
                        <div key={option.id} className="flex items-center">
                          <span className="w-8 text-center font-semibold">
                            {option.id}.
                          </span>
                          <Progress
                            value={
                              (option.votes / sessionState.studentCount) * 100
                            }
                            className="flex-grow"
                          />
                          <span className="ml-2 w-16 text-right">
                            {option.votes} votes
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        Response Rate: {currentQuestion.responseRate.toFixed(1)}
                        %
                      </p>
                      <div className="w-1/2 h-40">
                        <PieChart data={chartData} />
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-lg font-semibold">
                    {currentQuestion.text}
                  </p>
                )
              ) : (
                <p className="text-lg font-semibold">No questions available.</p>
              )}
            </CardContent>
          </Card>

          {/* Next Question Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Next Question</CardTitle>
            </CardHeader>
            <CardContent>
              {questions[currentQuestionIndex + 1] ? (
                <div className="space-y-4">
                  <p className="text-lg font-semibold">
                    {questions[currentQuestionIndex + 1].text}
                  </p>
                  {questions[currentQuestionIndex + 1].type !== "OPEN_ENDED" &&
                    questions[currentQuestionIndex + 1].type !== "FORMULA" && (
                      <div className="space-y-2">
                        {questions[currentQuestionIndex + 1].options.map(
                          (option) => (
                            <div key={option.id} className="flex items-center">
                              <span className="w-8 text-center font-semibold">
                                {option.id}.
                              </span>
                              <span>{option.text}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              ) : (
                <p>No next question available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Interaction and Q&A */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Interaction Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Students</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage
                            src={`https:/.dicebear.com/6.x/initials/svg?seed=${student.name}`}
                          />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            {student.matricNo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* <div
                          className={`w-3 h-3 rounded-full ${
                            student.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        /> */}
                        {/* <Button variant="ghost" size="icon">
                          <MicOff className="h-4 w-4" />
                        </Button> */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleKickStudent(student.id)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Q&A Section */}
          <Card>
            <CardHeader>
              <CardTitle>Student Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {studentQuestions.map((question) => (
                    <div
                      key={question.id}
                      className={`flex items-start justify-between p-2 rounded ${
                        question.isAnswered
                          ? "bg-green-100 dark:bg-green-900"
                          : ""
                      }`}
                    >
                      <div>
                        <p
                          className={`font-semibold ${
                            question.isAnswered
                              ? "text-green-700 dark:text-green-300"
                              : ""
                          }`}
                        >
                          {question.text}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Button variant="outline" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />{" "}
                            {question.upvotes}
                          </Button>
                          <Button
                            variant={
                              question.isAnswered ? "secondary" : "outline"
                            }
                            size="sm"
                            onClick={() => handleToggleAnswered(question.id)}
                          >
                            {question.isAnswered ? (
                              <Eye className="h-4 w-4 mr-1" />
                            ) : (
                              <EyeOff className="h-4 w-4 mr-1" />
                            )}
                            {question.isAnswered ? "Answered" : "Mark Answered"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

