"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Mail,
} from "lucide-react";

type Question = {
  id: number;
  text: string;
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
};

type SessionSummary = {
  title: string;
  course: string;
  date: string;
  duration: string;
  questionsAnswered: number;
  totalQuestions: number;
  correctAnswers: number;
  participationRate: number;
  questions: Question[];
};

export default function StudentPostSessionSummary() {
  const [sessionSummary] = useState<SessionSummary>({
    title: "Introduction to React Hooks",
    course: "Web Development Fundamentals",
    date: "2024-03-15",
    duration: "1h 30m",
    questionsAnswered: 8,
    totalQuestions: 10,
    correctAnswers: 6,
    participationRate: 85,
    questions: [
      {
        id: 1,
        text: "What is the primary purpose of the useState hook?",
        correctAnswer: "State management",
        studentAnswer: "State management",
        isCorrect: true,
      },
      {
        id: 2,
        text: "Which hook is used for side effects in React?",
        correctAnswer: "useEffect",
        studentAnswer: "useEffect",
        isCorrect: true,
      },
      {
        id: 3,
        text: "What does the useMemo hook do?",
        correctAnswer: "Memoize expensive computations",
        studentAnswer: "Manage component lifecycle",
        isCorrect: false,
      },
      // ... more questions
    ],
  });

  const performanceData = {
    labels: ["Correct", "Incorrect"],
    datasets: [
      {
        data: [
          sessionSummary.correctAnswers,
          sessionSummary.questionsAnswered - sessionSummary.correctAnswers,
        ],
        backgroundColor: ["#10B981", "#EF4444"],
      },
    ],
  };

  const participationData = {
    labels: ["Participated", "Missed"],
    datasets: [
      {
        data: [
          sessionSummary.participationRate,
          100 - sessionSummary.participationRate,
        ],
        backgroundColor: ["#3B82F6", "#9CA3AF"],
      },
    ],
  };

  const handleDownloadSummary = () => {
    // Implement download functionality
    console.log("Downloading summary...");
  };

  const handleEmailSummary = () => {
    // Implement email functionality
    console.log("Emailing summary...");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Session Summary</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 space-y-6">
        {/* Session Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Session Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {sessionSummary.title}
                </h2>
                <p className="text-muted-foreground">
                  Course: {sessionSummary.course}
                </p>
                <p className="text-muted-foreground">
                  Date: {sessionSummary.date}
                </p>
                <p className="text-muted-foreground">
                  Duration: {sessionSummary.duration}
                </p>
              </div>
              <div className="flex flex-col items-end justify-center">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Your Performance</p>
                    <p className="text-muted-foreground">
                      {sessionSummary.correctAnswers} /{" "}
                      {sessionSummary.questionsAnswered} correct
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Answer Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[300px]">
              <PieChart data={performanceData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Participation Rate</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[300px]">
              <PieChart data={participationData} />
            </CardContent>
          </Card>
        </div>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <ul className="space-y-4">
                {sessionSummary.questions.map((question) => (
                  <li key={question.id} className="border-b pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{question.text}</p>
                        <p className="text-sm text-muted-foreground">
                          Your answer: {question.studentAnswer}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Correct answer: {question.correctAnswer}
                        </p>
                      </div>
                      <Badge
                        variant={question.isCorrect ? "default" : "destructive"}
                      >
                        {question.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        {question.isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                Review the concept of useMemo and its applications
              </li>
              <li className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                Practice more with useCallback for optimizing component
                performance
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Course Completion</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={handleDownloadSummary}
            className="flex items-center justify-center"
          >
            <Download className="mr-2 h-4 w-4" /> Download Summary (PDF)
          </Button>
          <Button
            onClick={handleEmailSummary}
            variant="outline"
            className="flex items-center justify-center"
          >
            <Mail className="mr-2 h-4 w-4" /> Email Summary
          </Button>
        </div>
      </main>
    </div>
  );
}
