"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  LayoutDashboard,
  Book,
  Users,
  BarChart,
  PlayCircle,
  MessageSquare,
  Bell,
  HelpCircle,
} from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import { TopNav } from "@/components/ui/topnav";
import { Calendar as ScheduleCalendar } from "@/components/ui/calendar";

const LecturerDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <Sidebar
        menuItems={[
          { label: "Dashboard", icon: <LayoutDashboard />, active: true },
          { label: "My Courses", icon: <Book /> },
          { label: "Live Sessions", icon: <PlayCircle /> },
          { label: "Question Bank", icon: <MessageSquare /> },
          { label: "Analytics", icon: <BarChart /> },
          { label: "Settings", icon: <Users /> },
        ]}
      />

      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <TopNav
          appName="ClassEngage"
          icons={[
            { icon: <Bell />, label: "Notifications" },
            { icon: <HelpCircle />, label: "Help" },
          ]}
        />

        {/* Main Content */}
        <main className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">Welcome, Dr. John Doe</h1>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Courses</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">5</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Students</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">120</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Questions Created</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">35</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">3</CardContent>
            </Card>
          </div>

          {/* Calendar & Activity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleCalendar />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>John Doe submitted an assignment</li>
                  <li>Jane Smith joined Live Session</li>
                  <li>New question added to CS101</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button className="w-full md:w-auto">Start New Session</Button>
            <Button variant="outline" className="w-full md:w-auto">
              Create Poll
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LecturerDashboard;
