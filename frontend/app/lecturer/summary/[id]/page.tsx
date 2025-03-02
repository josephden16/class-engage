"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  PieChart,
  ResponsiveContainer,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Download,
  ChevronLeft,
  Home,
  BarChart2,
  PieChartIcon,
  MessageCircle,
  Menu,
} from "lucide-react";
import jsPDF from "jspdf";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { APP_ROUTES } from "@/lib/routes";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function PostSessionAnalytics() {
  const params = useParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get(`/sessions/${params.id}/analytics`);
        const data = await response.data?.data;
        setSessionData(data);
      } catch (error: any) {
        console.error("Failed to fetch session analytics", error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to fetch session analytics");
        }
        // router.push(APP_ROUTES.DASHBOARD);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [params.id]);

  const handleDownloadReport = () => {
    if (!sessionData) return;

    const doc = new jsPDF();
    doc.text("Post-Session Analytics", 10, 10);
    doc.text(`Title: ${sessionData.title}`, 10, 20);
    doc.text(`Date: ${sessionData.date}`, 10, 30);
    doc.text(`Duration: ${sessionData.duration}`, 10, 40);
    doc.text(`Participants: ${sessionData.participants}`, 10, 50);

    let y = 60;
    doc.text("Questions:", 10, y);
    sessionData.questions.forEach((q: any, index: number) => {
      y += 10;
      doc.text(
        `${index + 1}. ${q.text} - Response Rate: ${q.responseRate}%`,
        10,
        y
      );
    });

    y += 20;
    doc.text("Poll Results:", 10, y);
    sessionData.pollResults.forEach((r: any) => {
      y += 10;
      doc.text(`${r.name}: ${r.value}%`, 10, y);
    });

    y += 20;
    doc.text("Top Student Questions:", 10, y);
    sessionData.topQuestions.forEach((q: any) => {
      y += 10;
      doc.text(`${q.text} (Upvotes: ${q.upvotes})`, 10, y);
      y += 10;
    });

    doc.save(`session_${params.id}_analytics.pdf`);
    toast.success("Report downloaded successfully");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!sessionData) {
    return null;
  }

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      id: "response-rates",
      label: "Response Rates",
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
    },
    {
      id: "poll-results",
      label: "Poll Results",
      icon: <PieChartIcon className="h-4 w-4 mr-2" />,
    },
    {
      id: "top-questions",
      label: "Top Questions",
      icon: <MessageCircle className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-white/90"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Post-Session Analytics</h1>
              <div className="text-sm breadcrumbs hidden md:block">
                <ul className="flex space-x-2">
                  <li>
                    <Link
                      href={APP_ROUTES.DASHBOARD}
                      className="hover:underline"
                    >
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="py-4">
                <h2 className="text-lg font-semibold mb-4">Navigation</h2>
                <nav>
                  <ul className="space-y-2">
                    {navigationItems.map((item) => (
                      <li key={item.id}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            activeSection === item.id ? "bg-muted" : ""
                          }`}
                          onClick={() => {
                            scrollToSection(item.id);
                          }}
                        >
                          {item.icon}
                          {item.label}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:block w-64 bg-muted/30 p-4 border-r">
          <nav className="sticky top-24">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      activeSection === item.id ? "bg-muted" : ""
                    }`}
                    onClick={() => scrollToSection(item.id)}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex-grow p-4 space-y-6 overflow-y-auto">
          <div className="container mx-auto max-w-4xl space-y-8">
            <section id="overview" className="scroll-mt-20">
              <Card>
                <CardHeader>
                  <CardTitle>Session Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {sessionData.title}
                      </h2>
                      <p>Date: {sessionData.date}</p>
                      <p>Duration: {sessionData.duration}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {sessionData.participants}
                      </p>
                      <p>Participants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="response-rates" className="scroll-mt-20">
              <Card>
                <CardHeader>
                  <CardTitle>Response Rates per Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={sessionData.questions.map((q: any, i: number) => ({
                        ...q,
                        id: `Q${i + 1}`,
                      }))}
                    >
                      <XAxis dataKey="id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="responseRate"
                        fill="#8884d8"
                        name="Response Rate (%)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </section>

            <section id="poll-results" className="scroll-mt-20">
              <Card>
                <CardHeader>
                  <CardTitle>Poll Results: Session Helpfulness</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sessionData.pollResults}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sessionData.pollResults.map(
                          (entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </section>

            <section id="top-questions" className="scroll-mt-20">
              <Card>
                <CardHeader>
                  <CardTitle>Top Student Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <ul className="space-y-4">
                      {sessionData.topQuestions.map((question: any) => (
                        <li key={question.id} className="border-b pb-4">
                          <p className="font-semibold">{question.text}</p>
                          <p className="text-sm text-muted-foreground">
                            Upvotes: {question.upvotes}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            </section>

            <div className="flex flex-col sm:flex-row justify-center gap-4 py-4">
              <Button
                onClick={handleDownloadReport}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" /> Download Report
              </Button>
              {/* <Button
                onClick={handleEmailSummary}
                variant="outline"
                className="flex items-center"
              >
                <Mail className="mr-2 h-4 w-4" /> Email Summary
              </Button> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

