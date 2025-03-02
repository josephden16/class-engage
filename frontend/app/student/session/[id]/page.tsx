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
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Users,
  MessageSquare,
  BarChart3,
  User,
  Timer,
  Loader2,
} from "lucide-react";
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
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

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

// Create a client
const queryClient = new QueryClient();

// Wrapper component to provide React Query context
export default function StudentSessionScreenWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <StudentSessionScreen />
    </QueryClientProvider>
  );
}

function StudentSessionScreen() {
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
  const [showKickedDialog, setShowKickedDialog] = useState(false);
  const [showEndedDialog, setShowEndedDialog] = useState(false);
  const [helpfulnessRating, setHelpfulnessRating] = useState<string>("");
  const [tempStudentSessionId, setTempStudentSessionId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState("question");

  const studentSessionId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("studentSessionId")
      : null;

  // Fetch session data with React Query
  const { isLoading: isSessionLoading } = useQuery({
    queryKey: ["sessionData", params.id],
    queryFn: async () => {
      if (!studentSessionId) {
        toast.error("Please join the session first.");
        router.push(APP_ROUTES.STUDENT_JOIN_SESSION);
        return null;
      }

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
          setTempStudentSessionId(studentSessionId);
          sessionStorage.removeItem("studentSessionId");
          return null;
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
        return sessionData;
      } catch (error) {
        toast.error("Failed to load session");
        router.push(APP_ROUTES.STUDENT_JOIN_SESSION);
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      if (!studentAnswer || !currentQuestion || !studentSessionId) return;

      return axios.post(
        `/sessions/${params.id}/responses`,
        {
          questionId: currentQuestion.id,
          answer: studentAnswer,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Student-Session-Id": studentSessionId,
          },
        }
      );
    },
    onSuccess: () => {
      setCurrentQuestion((prev) => (prev ? { ...prev, answered: true } : prev));
      setStats((prev) => ({ ...prev, answered: prev.answered + 1 }));
      toast.success("Your answer has been recorded.");
    },
    onError: () => {
      toast.error("Failed to submit answer");
    },
  });

  // Submit question mutation
  const submitQuestionMutation = useMutation({
    mutationFn: async () => {
      if (!newQuestionText.trim() || !studentSessionId) return;

      return axios.post(
        `/sessions/${params.id}/student-questions`,
        { text: newQuestionText },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Student-Session-Id": studentSessionId,
          },
        }
      );
    },
    onSuccess: () => {
      setNewQuestionText("");
      toast.success("Your question has been added.");
    },
    onError: () => {
      toast.error("Failed to submit question");
    },
  });

  // Upvote question mutation
  const upvoteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      if (!studentSessionId) return;

      return axios.post(
        `/sessions/${params.id}/student-questions/${questionId}/upvote`,
        {},
        {
          headers: { "X-Student-Session-Id": studentSessionId },
        }
      );
    },
    onError: () => {
      toast.error("Failed to upvote question");
    },
  });

  // Submit poll mutation
  const submitPollMutation = useMutation({
    mutationFn: async () => {
      if (!helpfulnessRating || !tempStudentSessionId) {
        toast.error("Please select a rating before submitting.");
        return;
      }

      return axios.post(
        `/sessions/${params.id}/poll`,
        { answer: helpfulnessRating },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Student-Session-Id": tempStudentSessionId,
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Thank you for your feedback");
      router.push(APP_ROUTES.STUDENT_JOIN_SESSION);
    },
    onError: () => {
      toast.error("Failed to submit feedback");
      router.push(APP_ROUTES.STUDENT_JOIN_SESSION); // Redirect anyway
    },
  });

  // Fetch initial data and set up WebSocket
  useEffect(() => {
    if (!studentSessionId) {
      toast.error("Please join the session first.");
      router.push(APP_ROUTES.STUDENT_JOIN_SESSION);
      return;
    }

    // WebSocket setup
    const newSocket = io(
      process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000"
    );
    newSocket.emit("joinSession", params.id);
    newSocket.on("studentKicked", ({ studentId }) => {
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
      setActiveTab("question"); // Switch to question tab when new question is launched
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
      setTempStudentSessionId(studentSessionId);
      sessionStorage.removeItem("studentSessionId");
      newSocket.disconnect();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [params.id, router, studentSessionId]);

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

  const handleSubmitAnswer = () => {
    submitAnswerMutation.mutate();
  };

  const handleSubmitQuestion = () => {
    submitQuestionMutation.mutate();
  };

  const handleUpvoteQuestion = (id: string) => {
    upvoteQuestionMutation.mutate(id);
  };

  const handleSubmitPoll = () => {
    submitPollMutation.mutate();
  };

  if (isSessionLoading) {
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

  const renderQuestionInput = () => {
    if (!currentQuestion) return <p>No active question.</p>;
    switch (currentQuestion.type) {
      case "MCQ":
        return (
          <RadioGroup
            value={studentAnswer}
            onValueChange={setStudentAnswer}
            disabled={
              currentQuestion.answered || submitAnswerMutation.isPending
            }
            className="space-y-3"
          >
            {currentQuestion.options.map((option, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-3 rounded-md border bg-card hover:bg-accent/5 transition-colors"
              >
                <RadioGroupItem
                  value={String.fromCharCode(65 + idx)}
                  id={`opt-${idx}`}
                />
                <Label
                  htmlFor={`opt-${idx}`}
                  className="flex-grow cursor-pointer"
                >
                  {option}
                </Label>
                <Badge variant="outline" className="font-mono">
                  {String.fromCharCode(65 + idx)}
                </Badge>
              </div>
            ))}
          </RadioGroup>
        );
      case "TRUE_FALSE":
        return (
          <RadioGroup
            value={studentAnswer}
            onValueChange={setStudentAnswer}
            disabled={
              currentQuestion.answered || submitAnswerMutation.isPending
            }
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 rounded-md border bg-card hover:bg-accent/5 transition-colors">
              <RadioGroupItem value="True" id="true" />
              <Label htmlFor="true" className="flex-grow cursor-pointer">
                True
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-md border bg-card hover:bg-accent/5 transition-colors">
              <RadioGroupItem value="False" id="false" />
              <Label htmlFor="false" className="flex-grow cursor-pointer">
                False
              </Label>
            </div>
          </RadioGroup>
        );
      case "OPEN_ENDED":
        return (
          <Textarea
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={
              currentQuestion.answered || submitAnswerMutation.isPending
            }
            className="min-h-[150px] resize-none"
          />
        );
      case "FORMULA":
        return (
          <div className="space-y-2">
            <Badge variant="outline">Formula Question</Badge>
            <Textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Type your formula answer here..."
              disabled={
                currentQuestion.answered || submitAnswerMutation.isPending
              }
              className="min-h-[150px] resize-none font-mono"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Session Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto py-3 px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold ">{sessionState.title}</h1>
              <p className="text-sm text-black">{sessionState.course}</p>
            </div>

            <div className="flex items-center gap-3">
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <Tabs
          defaultValue="question"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="question" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Question</span>
                {currentQuestion && !currentQuestion.answered && (
                  <Badge variant="destructive" className="ml-1">
                    Live
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="qa" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Q&A</span>
                {studentQuestions.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {studentQuestions.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>My Progress</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Question Tab */}
          <TabsContent value="question">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Current Question</CardTitle>
                    {currentQuestion?.type && (
                      <CardDescription>
                        <Badge variant="outline" className="mt-1">
                          {currentQuestion.type.replace("_", " ")}
                        </Badge>
                      </CardDescription>
                    )}
                  </div>
                  {currentQuestion &&
                    !currentQuestion.answered &&
                    currentQuestion.timeRemaining > 0 && (
                      <div className="flex items-center gap-2 text-destructive">
                        <Timer className="h-5 w-5" />
                        <span className="font-medium">
                          {formatTime(currentQuestion.timeRemaining)}
                        </span>
                      </div>
                    )}
                </div>
              </CardHeader>
              <CardContent>
                {currentQuestion ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-lg font-medium">
                        {currentQuestion.text}
                      </p>
                    </div>

                    <div className="space-y-4">{renderQuestionInput()}</div>

                    {currentQuestion.answered && currentQuestion.results && (
                      <div className="mt-6 pt-6 border-t">
                        <h3 className="font-semibold mb-4">Class Results</h3>
                        <div className="w-full h-64">
                          <BarChart data={chartData} />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Timer className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium">
                      Waiting for the lecturer to launch a question...
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You'll be notified when a new question is available
                    </p>
                  </div>
                )}
              </CardContent>
              {currentQuestion &&
                !currentQuestion.answered &&
                currentQuestion.timeRemaining > 0 && (
                  <CardFooter className="pt-0">
                    <Button
                      onClick={handleSubmitAnswer}
                      className="w-full"
                      size="lg"
                      disabled={
                        !studentAnswer || submitAnswerMutation.isPending
                      }
                    >
                      {submitAnswerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Answer"
                      )}
                    </Button>
                  </CardFooter>
                )}
            </Card>
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qa">
            <Card>
              <CardHeader>
                <CardTitle>Questions & Answers</CardTitle>
                <CardDescription>
                  Ask questions or upvote existing ones to get the lecturer's
                  attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask a question..."
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    disabled={submitQuestionMutation.isPending}
                  />
                  <Button
                    onClick={handleSubmitQuestion}
                    disabled={
                      !newQuestionText.trim() ||
                      submitQuestionMutation.isPending
                    }
                  >
                    {submitQuestionMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    <span>
                      {submitQuestionMutation.isPending ? "Asking..." : "Ask"}
                    </span>
                  </Button>
                </div>

                <ScrollArea className="h-[400px] pr-4">
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpvoteQuestion(question.id)}
                            className="gap-1"
                            disabled={
                              upvoteQuestionMutation.isPending &&
                              upvoteQuestionMutation.variables === question.id
                            }
                          >
                            {upvoteQuestionMutation.isPending &&
                            upvoteQuestionMutation.variables === question.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ThumbsUp className="h-3.5 w-3.5" />
                            )}
                            <span>{question.upvotes}</span>
                          </Button>

                          {question.isAnswered && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              <span>Answered</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}

                    {studentQuestions.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No questions yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Be the first to ask a question!
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Your Participation</CardTitle>
                <CardDescription>
                  Track your engagement in this session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="https://api.dicebear.com/6.x/initials/svg?seed=Student" />
                      <AvatarFallback>ST</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">Active Student</p>
                      <p className="text-sm text-muted-foreground">
                        Connected for {formatTime(sessionState.elapsedTime)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg w-full md:w-auto">
                    <div className="text-center md:text-right">
                      <p className="text-sm text-muted-foreground">
                        Questions Answered
                      </p>
                      <div className="flex items-center justify-center md:justify-end gap-2">
                        <span className="text-3xl font-bold text-primary">
                          {stats.answered}
                        </span>
                        <span className="text-lg text-muted-foreground">
                          / {stats.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate</span>
                    <span className="font-medium">
                      {stats.total > 0
                        ? Math.round((stats.answered / stats.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      stats.total > 0 ? (stats.answered / stats.total) * 100 : 0
                    }
                    className="h-2"
                  />
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium mb-2">Session Activity</p>
                    <p className="text-sm text-muted-foreground">
                      You've been active in this session for{" "}
                      {formatTime(sessionState.elapsedTime)}. Keep participating
                      to improve your learning experience!
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium mb-2">Engagement Tips</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Answer questions promptly</li>
                      <li>Ask questions when you're unsure</li>
                      <li>Upvote questions that you also have</li>
                      <li>Review results to understand concepts better</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Kicked Dialog */}
      <AlertDialog open={showKickedDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>You've Been Removed</AlertDialogTitle>
          <AlertDialogDescription>
            The lecturer has removed you from the session. You'll be redirected
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
            className="space-y-3 mt-6"
          >
            <div className="flex items-center space-x-3 p-3 rounded-md border bg-card hover:bg-accent/5 transition-colors">
              <RadioGroupItem value="Very Helpful" id="very-helpful" />
              <Label htmlFor="very-helpful" className="cursor-pointer">
                Very Helpful
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-md border bg-card hover:bg-accent/5 transition-colors">
              <RadioGroupItem value="Somewhat Helpful" id="somewhat-helpful" />
              <Label htmlFor="somewhat-helpful" className="cursor-pointer">
                Somewhat Helpful
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-md border bg-card hover:bg-accent/5 transition-colors">
              <RadioGroupItem value="Neutral" id="neutral" />
              <Label htmlFor="neutral" className="cursor-pointer">
                Neutral
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-md border bg-card hover:bg-accent/5 transition-colors">
              <RadioGroupItem value="Not Helpful" id="not-helpful" />
              <Label htmlFor="not-helpful" className="cursor-pointer">
                Not Helpful
              </Label>
            </div>
          </RadioGroup>
          <div className="mt-6">
            <Button
              onClick={handleSubmitPoll}
              className="w-full"
              disabled={submitPollMutation.isPending}
            >
              {submitPollMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

