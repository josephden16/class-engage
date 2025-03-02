"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PieChart } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Eye,
  EyeOff,
  UserMinus,
  Share2,
  Clock,
  Users,
  Timer,
  ArrowLeft,
  BarChart3,
  MessageSquare,
  Copy,
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
  const [activeTab, setActiveTab] = useState("questions");

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
  }, [params.id, router, sessionState.studentCount]);

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
    const fullUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      `/student/join-session?invitationCode=${sessionState.invitationCode}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Session invitation copied to clipboard");
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(sessionState.invitationCode);
    toast.success("Invitation code copied to clipboard");
  };

  const handleBackToDashboard = () => {
    router.push(APP_ROUTES.DASHBOARD);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Session Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto py-3 px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToDashboard}
                className="hidden md:flex"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{sessionState.title}</h1>
                  <Badge
                    variant={
                      sessionState.isSessionActive ? "default" : "secondary"
                    }
                  >
                    {sessionState.isSessionActive ? "Active" : "Not Started"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {sessionState.course}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
              <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-md">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {formatTime(sessionState.elapsedTime)}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-md">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{sessionState.studentCount}</span>
              </div>

              <div
                className="flex items-center gap-1 bg-muted px-3 py-1 rounded-md cursor-pointer"
                onClick={handleCopyInviteCode}
              >
                <span className="font-medium">
                  {sessionState.invitationCode}
                </span>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShareSession}
                className="ml-auto md:ml-0"
              >
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
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleStartSession}
                >
                  Start Session
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <Tabs
          defaultValue="questions"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger
                value="questions"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Questions</span>
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Students</span>
              </TabsTrigger>
              <TabsTrigger value="qa" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Q&A</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="questions" className="space-y-4">
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
                      !sessionState.isSessionActive ||
                      currentQuestion?.isLaunched
                    }
                  >
                    {currentQuestion?.isLaunched ? (
                      <span>Question Launched</span>
                    ) : (
                      <span>Launch Question</span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Question Management */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Current Question Display */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>Current Question</span>
                    {currentQuestion?.isLaunched && (
                      <div className="flex items-center gap-2 text-sm font-normal">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatTime(currentQuestion.timeRemaining)}
                        </span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {currentQuestion?.type && (
                      <Badge variant="outline" className="mt-1">
                        {currentQuestion.type.replace("_", " ")}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentQuestion ? (
                    <>
                      <p className="text-lg font-medium mb-4">
                        {currentQuestion.text}
                      </p>

                      {currentQuestion.isLaunched ? (
                        <>
                          <div className="space-y-3 mb-6">
                            {currentQuestion.options.map((option) => (
                              <div key={option.id} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                      {option.id}
                                    </span>
                                    <span className="font-medium">
                                      {option.text}
                                    </span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {option.votes}{" "}
                                    {option.votes === 1
                                      ? "response"
                                      : "responses"}
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    sessionState.studentCount > 0
                                      ? (option.votes /
                                          sessionState.studentCount) *
                                        100
                                      : 0
                                  }
                                  className="h-2"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                Response Rate
                              </span>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={currentQuestion.responseRate}
                                  className="w-32 h-2"
                                />
                                <span className="text-sm text-muted-foreground">
                                  {currentQuestion.responseRate.toFixed(1)}%
                                </span>
                              </div>
                            </div>

                            <div className="w-full md:w-40 h-40">
                              <PieChart data={chartData} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3 mt-4">
                          {currentQuestion.options.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center gap-2"
                            >
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                {option.id}
                              </span>
                              <span>{option.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-lg font-medium text-muted-foreground">
                        No questions available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Next Question Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Next Question</CardTitle>
                  {questions[currentQuestionIndex + 1]?.type && (
                    <CardDescription>
                      <Badge variant="outline" className="mt-1">
                        {questions[currentQuestionIndex + 1].type.replace(
                          "_",
                          " "
                        )}
                      </Badge>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {questions[currentQuestionIndex + 1] ? (
                    <div className="space-y-4">
                      <p className="text-base font-medium">
                        {questions[currentQuestionIndex + 1].text}
                      </p>
                      {questions[currentQuestionIndex + 1].type !==
                        "OPEN_ENDED" &&
                        questions[currentQuestionIndex + 1].type !==
                          "FORMULA" && (
                          <div className="space-y-2">
                            {questions[currentQuestionIndex + 1].options.map(
                              (option) => (
                                <div
                                  key={option.id}
                                  className="flex items-center gap-2"
                                >
                                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                    {option.id}
                                  </span>
                                  <span>{option.text}</span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-muted-foreground">No more questions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Connected Students</span>
                  <Badge variant="outline">{students.length} Students</Badge>
                </CardTitle>
                <CardDescription>
                  Manage students participating in this session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={`https://api.dicebear.com/6.x/initials/svg?seed=${student.name}`}
                              alt={student.name}
                            />
                            <AvatarFallback>
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.matricNo}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-3 ${
                              student.status === "active"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleKickStudent(student.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <UserMinus className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Remove</span>
                          </Button>
                        </div>
                      </div>
                    ))}

                    {students.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-muted-foreground">
                          No students connected
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qa">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Student Questions</span>
                  <Badge variant="outline">
                    {studentQuestions.length} Questions
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Questions asked by students during the session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {studentQuestions.map((question) => (
                      <div
                        key={question.id}
                        className={`p-4 rounded-md border ${
                          question.isAnswered
                            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                            : "bg-card"
                        }`}
                      >
                        <p
                          className={`font-medium mb-2 ${
                            question.isAnswered
                              ? "text-green-700 dark:text-green-300"
                              : ""
                          }`}
                        >
                          {question.text}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                            {question.upvotes}
                          </Button>
                          <Button
                            variant={
                              question.isAnswered ? "outline" : "secondary"
                            }
                            size="sm"
                            onClick={() => handleToggleAnswered(question.id)}
                          >
                            {question.isAnswered ? (
                              <>
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                <span>Answered</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3.5 w-3.5 mr-1" />
                                <span>Mark Answered</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}

                    {studentQuestions.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-muted-foreground">
                          No questions from students yet
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

