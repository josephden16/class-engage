"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Save,
  PlusCircle,
  Trash2,
  GripVertical,
  AlertCircle,
  Clock,
} from "lucide-react";
import { APP_ROUTES } from "@/lib/routes";
import { useCreateSession } from "@/hooks/sessions";
import { useCourses } from "@/hooks/courses";
import { EditableMathField } from "react-mathquill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

type Question = {
  id: string;
  text: string;
  type: "MCQ" | "TRUE_FALSE" | "OPEN_ENDED" | "FORMULA";
  options: { id: string; text: string }[];
  timeLimit: number;
};

export default function CreateSessionPage() {
  const router = useRouter();
  const { data: courses = [], isLoading: isCoursesLoading } = useCourses();
  const [sessionDetails, setSessionDetails] = useState({
    title: "",
    courseId: "",
    date: "",
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionType, setQuestionType] = useState<Question["type"]>("MCQ");
  const [options, setOptions] = useState([""]);
  const [questionText, setQuestionText] = useState("");
  const [mathFormula, setMathFormula] = useState("");
  const [timeLimit, setTimeLimit] = useState("60");
  const [activeTab, setActiveTab] = useState("details");
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const { toast } = useToast();

  const handleAddQuestion = () => {
    if (questionText.trim()) {
      const newQ: Question = {
        id: Date.now().toString(),
        text:
          questionType === "FORMULA"
            ? `${questionText}\n${mathFormula}`
            : questionText,
        type: questionType,
        options:
          questionType === "MCQ"
            ? options
                .filter((opt) => opt.trim() !== "")
                .map((option, index) => ({
                  id: index.toString(),
                  text: option,
                }))
            : [],
        timeLimit: Number.parseInt(timeLimit) || 60,
      };
      setQuestions([...questions, newQ]);
      resetQuestionForm();
    }
  };

  const resetQuestionForm = () => {
    setQuestionText("");
    setOptions([""]);
    setTimeLimit("60");
    setMathFormula("");
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSessionDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSessionDetails({ ...sessionDetails, [e.target.name]: e.target.value });
  };

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) =>
    setOptions(options.filter((_, i) => i !== index));

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const createSessionMutation = useCreateSession();

  const handleCreateSession = () => {
    if (
      !sessionDetails.title ||
      !sessionDetails.courseId ||
      questions.length === 0
    ) {
      toast({
        title: "Error",
        description:
          "Please fill in all required fields and add at least one question.",
        variant: "destructive",
      });
      return;
    }

    createSessionMutation.mutate(
      {
        title: sessionDetails.title,
        courseId: sessionDetails.courseId,
        questions: questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.options.map((o) => o.text),
          timeLimit: q.timeLimit,
        })),
      },
      {
        onSuccess: (data: any) => {
          toast({
            title: "Success",
            description: "Session created successfully!",
          });
          router.push(`${APP_ROUTES.LECTURER_LIVE_SESSION}/${data.id}`);
        },
        onError: (error: any) => {
          console.error("Failed to create session:", error);
          toast({
            title: "Error",
            description: "Failed to create session. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const isFormValid = () => {
    return (
      sessionDetails.title.trim() !== "" &&
      sessionDetails.courseId !== "" &&
      questions.length > 0
    );
  };

  return (
    <div className="p-4 space-y-6 lg:max-w-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Session</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="items-center space-x-2 hidden">
                <Switch
                  id="advanced-mode"
                  checked={isAdvancedMode}
                  onCheckedChange={setIsAdvancedMode}
                />
                <Label htmlFor="advanced-mode">Advanced Mode</Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enable advanced features for session creation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Session Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>
                Provide basic information about your session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={sessionDetails.title}
                    onChange={handleSessionDetailsChange}
                    placeholder="Enter session title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select
                    name="course"
                    value={sessionDetails.courseId}
                    onValueChange={(value) => {
                      setSessionDetails({ ...sessionDetails, courseId: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isAdvancedMode && (
                  <div className="space-y-2">
                    <Label htmlFor="date">Session Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={sessionDetails.date}
                      onChange={handleSessionDetailsChange}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Create Questions</CardTitle>
              <CardDescription>Add questions for your session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      Question Type
                    </Label>
                    <Select
                      value={questionType}
                      onValueChange={(value) =>
                        setQuestionType(value as Question["type"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MCQ">Multiple Choice</SelectItem>
                        <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                        <SelectItem value="OPEN_ENDED">Open Ended</SelectItem>
                        <SelectItem value="FORMULA">Formula-Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="timeLimit"
                      className="block text-sm font-medium mb-2"
                    >
                      Time Limit
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="timeLimit"
                        type="number"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                        placeholder="Time in seconds"
                        className="w-full"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">
                        seconds
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-2">
                    Question Text
                  </Label>
                  <Textarea
                    name="question-text"
                    placeholder="Enter your question here..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {questionType === "FORMULA" && (
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      Math Formula
                    </Label>
                    <EditableMathField
                      latex={mathFormula}
                      onChange={(mathField) =>
                        setMathFormula(mathField.latex())
                      }
                      className="w-full border p-2 rounded-md"
                    />
                  </div>
                )}

                {questionType === "MCQ" && (
                  <div className="space-y-2">
                    <Label className="block text-sm font-medium mb-2">
                      Answer Options
                    </Label>
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                        />
                        {options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {options.length < 4 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="mt-2"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>
                )}

                <Button onClick={handleAddQuestion} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Question
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Question List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Question List</CardTitle>
              <CardDescription>
                Review and manage your questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="mb-4 p-4 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Question {index + 1}</h3>
                        <Badge>{question.type}</Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {question.timeLimit}s
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap">{question.text}</p>
                    {question.type === "MCQ" && (
                      <ul className="mt-2 list-disc list-inside">
                        {question.options.map((option) => (
                          <li key={option.id}>{option.text}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {questions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No questions added yet. Start by adding a question above.
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Session Button */}
      <Alert variant={isFormValid() ? "default" : "destructive"}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Session Creation</AlertTitle>
        <AlertDescription>
          {isFormValid()
            ? "Your session is ready to be created. Click the button below to proceed."
            : "Please fill in all required fields and add at least one question before creating the session."}
        </AlertDescription>
      </Alert>

      <Button
        onClick={handleCreateSession}
        disabled={createSessionMutation.isPending || !isFormValid()}
        className="w-full"
      >
        <Save className="h-4 w-4 mr-2" />
        {createSessionMutation.isPending
          ? "Creating Session..."
          : "Create Session"}
      </Button>
    </div>
  );
}
