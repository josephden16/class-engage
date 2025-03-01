import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock } from "lucide-react";

interface Question {
  text: string;
  type: "multiple-choice" | "true-false" | "open-ended";
  options?: string[];
  timeLimit?: number;
}

const QuestionAnswer = ({ question }: { question: Question }) => {
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(question?.timeLimit || 60);

  // Handle Answer Submission
  const handleSubmit = () => {
    console.log("Answer Submitted:", answer || selectedOption);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Answer Question</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Question Text */}
            <p className="text-lg font-semibold">{question?.text}</p>

            {/* Timer */}
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Time Left: {timeLeft}s</span>
            </div>

            {/* Multiple Choice */}
            {question?.type === "multiple-choice" && (
              <RadioGroup
                value={selectedOption}
                onValueChange={(value) => setSelectedOption(value)}
                className="space-y-2"
              >
                {question.options?.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <RadioGroupItem value={option} />
                    <span>{option}</span>
                  </label>
                ))}
              </RadioGroup>
            )}

            {/* True/False */}
            {question?.type === "true-false" && (
              <Select value={answer} onValueChange={setAnswer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Open-Ended */}
            {question?.type === "open-ended" && (
              <Textarea
                placeholder="Write your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[100px]"
              />
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Skip</Button>
              <Button onClick={handleSubmit}>Submit Answer</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionAnswer;
