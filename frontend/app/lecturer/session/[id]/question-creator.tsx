import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, GripVertical, Clock, Image } from "lucide-react";

const QuestionCreator = () => {
  const [questionType, setQuestionType] = useState("multiple-choice");
  const [options, setOptions] = useState(["", ""]);
  const [timeLimit, setTimeLimit] = useState("60");

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Question</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Question Type Selection */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-2">
                  Question Type
                </label>
                <Select value={questionType} onValueChange={setQuestionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="true-false">True/False</SelectItem>
                    <SelectItem value="open-ended">Open Ended</SelectItem>
                    <SelectItem value="poll">Poll</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium mb-2">
                  Time Limit (seconds)
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    min="0"
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Question Text
              </label>
              <Textarea
                placeholder="Enter your question here..."
                className="min-h-[100px]"
              />
            </div>

            {/* Answer Options */}
            {questionType === "multiple-choice" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">
                  Answer Options
                </label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
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
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="mt-2"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}

            {/* True/False Options */}
            {questionType === "true-false" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">
                  Correct Answer
                </label>
                <Select defaultValue="true">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button>Save Question</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionCreator;
