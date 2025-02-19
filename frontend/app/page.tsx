"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserCircle, Users, BookOpen, BarChart2 } from "lucide-react";

const InteractiveClassroomApp = () => {
  const [activeSession, setActiveSession] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[45rem] mx-auto mt-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Interactive Classroom
          </h1>
          <p className="text-gray-600">
            Enhance classroom engagement and collaborative learning
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-4 ">
          <TabsList className="grid grid-cols-4 gap-4 bg-white p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Quick Stats */}
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-700">
                        Active Students
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">24</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-700">
                        Active Courses
                      </h3>
                      <p className="text-2xl font-bold text-green-600">3</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-700">
                        Engagement Rate
                      </h3>
                      <p className="text-2xl font-bold text-purple-600">87%</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Session Controls */}
                <div className="mt-6">
                  <Button
                    onClick={() => setActiveSession(!activeSession)}
                    className={
                      activeSession
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }
                  >
                    {activeSession ? "End Session" : "Start New Session"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Session content will be implemented */}
                <p className="text-gray-600">No active sessions</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Course management content will be implemented */}
                <p className="text-gray-600">No courses available</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Analytics content will be implemented */}
                <p className="text-gray-600">No analytics data available</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InteractiveClassroomApp;
