"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Plus, Edit, Trash2, Play, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getInitials } from "@/lib/utils";
import {
  useCourses,
  useCreateCourse,
  useDeleteCourse,
  useUpdateCourse,
} from "@/hooks/courses";
import toast from "react-hot-toast";
import { useCreateSession, useSessions } from "@/hooks/sessions";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/routes";

const CourseSkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const SessionCardSkeleton = () => {
  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex justify-between items-center py-4">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-24 rounded-md" />
      </CardContent>
    </Card>
  );
};

export default function LecturerDashboard() {
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<{
    id: string;
    title: string;
    courseCode: string;
  } | null>(null);

  const router = useRouter();
  const { data: courses = [], isLoading: isCoursesLoading } = useCourses();
  const { data: sessions = [], isLoading: isSessionsLoading } = useSessions();

  const createCourseMutation = useCreateCourse();

  const handleCreateCourse = () => {
    const title = (document.getElementById("courseName") as HTMLInputElement)
      .value;
    const courseCode = (
      document.getElementById("courseCode") as HTMLInputElement
    ).value;

    createCourseMutation.mutate(
      { title, courseCode },
      {
        onSuccess: () => {
          setIsNewCourseModalOpen(false);
        },
      }
    );
  };

  const updateCourseMutation = useUpdateCourse();

  const handleUpdateCourse = () => {
    const updatedCourse = {
      id: currentCourse?.id ?? "",
      title: (document.getElementById("editCourseName") as HTMLInputElement)
        ?.value,
      courseCode: (
        document.getElementById("editCourseCode") as HTMLInputElement
      )?.value,
    };

    updateCourseMutation.mutate(updatedCourse, {
      onSuccess: () => {
        setIsEditCourseModalOpen(false);
      },
    });
  };

  const deleteCourseMutation = useDeleteCourse();

  const handleDeleteCourse = () => {
    if (!currentCourse) return;

    deleteCourseMutation.mutate(currentCourse.id, {
      onSuccess: () => {
        setIsDeleteCourseModalOpen(false);
      },
    });
  };

  const handleCreateNewSession = () => {
    if (courses?.length === 0) {
      toast.error("You'll need a course start a live session");
      return;
    }
    router.push(APP_ROUTES.CREATE_SESSION);
  };

  const { logout, user } = useAuth();

  const handleEditCourse = (course: any) => {
    setCurrentCourse(course);
    setIsEditCourseModalOpen(true);
  };

  const openDeleteCourseModal = (course: any) => {
    setCurrentCourse(course);
    setIsDeleteCourseModalOpen(true);
  };

  const NewCourseModal = () => (
    <Dialog open={isNewCourseModalOpen} onOpenChange={setIsNewCourseModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Enter the details for your new course.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courseName" className="text-right">
              Course Name
            </Label>
            <Input id="courseName" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courseCode" className="text-right">
              Course Code
            </Label>
            <Input id="courseCode" className="col-span-3" />
          </div>
        </div>
        <Button
          onClick={handleCreateCourse}
          disabled={createCourseMutation.isPending}
        >
          {createCourseMutation.isPending ? "Creating..." : "Create Course"}
        </Button>{" "}
      </DialogContent>
    </Dialog>
  );

  const EditCourseModal = () => (
    <Dialog
      open={isEditCourseModalOpen}
      onOpenChange={setIsEditCourseModalOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update the details of your course.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="editCourseName" className="text-right">
              Course Name
            </Label>
            <Input
              id="editCourseName"
              className="col-span-3"
              defaultValue={currentCourse?.title}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="editCourseCode" className="text-right">
              Course Code
            </Label>
            <Input
              id="editCourseCode"
              className="col-span-3"
              defaultValue={currentCourse?.courseCode}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => setIsEditCourseModalOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateCourse}
            disabled={updateCourseMutation.isPending}
          >
            {updateCourseMutation.isPending ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const DeleteCourseModal = () => (
    <Dialog
      open={isDeleteCourseModalOpen}
      onOpenChange={setIsDeleteCourseModalOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Course</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this course? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => setIsDeleteCourseModalOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteCourse}
            disabled={deleteCourseMutation.isPending}
            variant="destructive"
          >
            {deleteCourseMutation.isPending ? "Deleting..." : "Delete Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="" alt="Lecturer" />
            <AvatarFallback>{getInitials(user?.name ?? "")}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        </div>
        <Button
          onClick={logout}
          variant="ghost"
          className="text-muted-foreground hover:text-primary"
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </header>

      {/* Manage Courses Panel */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Courses</h2>
          <Button onClick={() => setIsNewCourseModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create New Course
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isCoursesLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="px-4 py-12 border rounded-lg shadow">
                <CourseSkeleton className="h-6 w-3/4 mb-2" />
                <CourseSkeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : courses.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center text-center py-10">
              <p className="text-black text-lg mt-2">No courses available</p>
              <p className="text-gray-600 text-sm mt-2">
                Try adding a new course.
              </p>
            </div>
          ) : (
            courses.map((course: any) => (
              <Card
                key={course.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">
                    {course.title}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit course</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-error hover:text-error"
                      onClick={() => openDeleteCourseModal(course)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete course</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Course Code: {course.courseCode}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Live Session Management Panel */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sessions</h2>
          <Button onClick={handleCreateNewSession}>
            <Play className="mr-2 h-4 w-4" /> Create Session
          </Button>
        </div>
        <div className="space-y-4">
          {isSessionsLoading ? (
            [...Array(3)].map((_, i) => <SessionCardSkeleton key={i} />)
          ) : sessions?.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center text-center py-10">
              <p className="text-black text-lg mt-2">No sessions available</p>
              <p className="text-gray-600 text-sm mt-2">
                Try conducting a new session.
              </p>
            </div>
          ) : (
            sessions?.map((session: any) => (
              <Card
                key={session.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="flex justify-between items-center py-4">
                  <div>
                    <h3 className="font-semibold">{session.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {session.course.courseCode} -{" "}
                      {new Date(session.startTime).toDateString()}
                    </p>
                    <p className="text-sm">
                      Participants: {session.participants}
                    </p>
                  </div>
                  <Button
                    variant={session.isActive ? "default" : "secondary"}
                    className="w-40"
                    onClick={() =>
                      router.push(
                        session.isActive
                          ? `${APP_ROUTES.LECTURER_LIVE_SESSION}/${session.id}`
                          : `${APP_ROUTES.LECTURER_POST_SESSION_SUMMARY}/${session.id}`
                      )
                    }
                  >
                    {session.isActive ? (
                      <>
                        <Play className="mr-2 h-4 w-4" /> Resume
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" /> View Summary
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Modals */}
      <NewCourseModal />
      <EditCourseModal />
      <DeleteCourseModal />
    </>
  );
}

