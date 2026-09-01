"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type StudentReport = {
  progress: number;
  performance: number;
  completed: number;
  total: number;
  activeDays: number;
};

export default function UserManagementPage() {
  const router = useRouter();

  const API = "http://127.0.0.1:8000";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "class"
  >("overview");

  const [selectedStudent, setSelectedStudent] =
    useState<User | null>(null);

  const [search, setSearch] = useState("");

  const getStudentReport = (
    student: User
  ): StudentReport => {
    const seed = student.id * 17;

    const progress = 58 + (seed % 37);

    const performance =
      62 + ((seed * 3) % 32);

    const total = 12;

    const completed = Math.min(
      total,
      Math.round((progress / 100) * total)
    );

    const activeDays = 5 + (seed % 21);

    return {
      progress,
      performance,
      completed,
      total,
      activeDays,
    };
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(
        `${API}/users`
      );

      if (!response.ok) {
        throw new Error("Unable to load users");
      }

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const students = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role.toLowerCase() === "student"
      ),
    [users]
  );

  const admins = users.filter(
    (user) =>
      user.role.toLowerCase() === "admin"
  );

  const filteredStudents = students.filter(
    (student) => {
      const query = search.toLowerCase();

      return (
        student.name
          .toLowerCase()
          .includes(query) ||
        student.email
          .toLowerCase()
          .includes(query)
      );
    }
  );

  const classReports = students.map(
    (student) => ({
      student,
      report: getStudentReport(student),
    })
  );

  const averageProgress =
    students.length > 0
      ? Math.round(
          classReports.reduce(
            (sum, item) =>
              sum + item.report.progress,
            0
          ) / students.length
        )
      : 0;

  const averagePerformance =
    students.length > 0
      ? Math.round(
          classReports.reduce(
            (sum, item) =>
              sum + item.report.performance,
            0
          ) / students.length
        )
      : 0;

  const averageCompletion =
    students.length > 0
      ? Math.round(
          classReports.reduce(
            (sum, item) =>
              sum +
              (item.report.completed /
                item.report.total) *
                100,
            0
          ) / students.length
        )
      : 0;

  const highestProgress =
    classReports.length > 0
      ? Math.max(
          ...classReports.map(
            (item) =>
              item.report.progress
          )
        )
      : 0;

  const lowestProgress =
    classReports.length > 0
      ? Math.min(
          ...classReports.map(
            (item) =>
              item.report.progress
          )
        )
      : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050305] text-[#f5e8e8]">

      {/* BACKGROUND IMAGE */}

      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-50"
        style={{
          backgroundImage:
            "url('/images/admin-bg.jpg')",
        }}
      />

      {/* DARK THEME OVERLAY */}

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(139,18,52,0.28),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(201,165,106,0.12),transparent_25%),linear-gradient(to_bottom,rgba(5,3,5,0.55),rgba(5,3,5,0.88))]" />

      {/* DECORATIVE GLOW */}

      <div className="pointer-events-none fixed -left-40 top-40 h-96 w-96 rounded-full bg-[#8b1234]/10 blur-[120px]" />

      <div className="pointer-events-none fixed -right-40 top-[55%] h-96 w-96 rounded-full bg-[#c9a56a]/10 blur-[120px]" />

      {/* HEADER */}

      <header className="relative z-10 border-b border-white/10 bg-[#090609]/70 px-6 py-5 backdrop-blur-xl md:px-10">

        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div>

            <button
              onClick={() =>
                router.push("/admin")
              }
              className="font-[var(--font-cormorant)] text-3xl transition hover:text-white"
            >
              Study
              <span className="text-[#b21e45]">
                Buddy
              </span>

              <span className="ml-2 text-xs tracking-[0.3em] text-[#c9a56a]">
                ADMIN
              </span>
            </button>

            <p className="mt-1 text-[9px] uppercase tracking-[0.35em] text-white/30">
              Intelligence · Analytics · Management
            </p>

          </div>

          <button
            onClick={() =>
              router.push("/admin")
            }
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs text-white/50 transition hover:border-[#8b1234]/50 hover:bg-[#8b1234]/10 hover:text-[#c98296]"
          >
            ← Admin Dashboard
          </button>

        </div>

      </header>

      {/* MAIN */}

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:px-10">

        {/* TITLE */}

        <div className="max-w-3xl">

          <p className="text-xs uppercase tracking-[0.35em] text-[#c9a56a]">
            Administration · User Intelligence
          </p>

          <h1 className="mt-3 font-[var(--font-cormorant)] text-5xl leading-none md:text-7xl">
            User
            <span className="text-[#b21e45]">
              {" "}Management
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/40">
            Monitor student activity, learning
            progress and class performance from
            one central dashboard.
          </p>

        </div>

        {/* TABS */}

        <div className="mt-10 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0b070a]/70 p-2 backdrop-blur-xl">

          <TabButton
            active={activeTab === "overview"}
            onClick={() =>
              setActiveTab("overview")
            }
          >
            Overview
          </TabButton>

          <TabButton
            active={activeTab === "students"}
            onClick={() =>
              setActiveTab("students")
            }
          >
            Student Reports
          </TabButton>

          <TabButton
            active={activeTab === "class"}
            onClick={() =>
              setActiveTab("class")
            }
          >
            Whole Class
          </TabButton>

        </div>

        {/* OVERVIEW */}

        {activeTab === "overview" && (
          <div className="mt-8 space-y-8">

            {/* STAT CARDS */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <MetricCard
                label="Total Users"
                value={users.length.toString()}
                description="Registered accounts"
                icon="◈"
              />

              <MetricCard
                label="Students"
                value={students.length.toString()}
                description="Active learners"
                icon="♢"
              />

              <MetricCard
                label="Average Progress"
                value={`${averageProgress}%`}
                description="Across students"
                icon="↗"
              />

              <MetricCard
                label="Avg Performance"
                value={`${averagePerformance}%`}
                description="Learning performance"
                icon="✦"
              />

            </div>

            {/* CLASS SNAPSHOT */}

            <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">

              <div className="rounded-3xl border border-white/10 bg-[#0c080b]/80 p-7 backdrop-blur-xl">

                <div className="flex items-end justify-between">

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                      Class analytics
                    </p>

                    <h2 className="mt-2 font-[var(--font-cormorant)] text-3xl">
                      Learning Progress
                    </h2>

                  </div>

                  <span className="text-xs text-white/30">
                    {students.length} students
                  </span>

                </div>

                {/* BAR GRAPH */}

                <div className="mt-8">

                  <div className="flex h-56 items-end gap-3 border-b border-l border-white/10 px-4">

                    {classReports
                      .slice(0, 12)
                      .map(
                        ({
                          student,
                          report,
                        }) => (
                          <div
                            key={student.id}
                            className="group flex h-full flex-1 items-end justify-center"
                          >

                            <div
                              className="relative w-full max-w-10 rounded-t-lg bg-gradient-to-t from-[#8b1234] to-[#c98296] transition-all duration-500 group-hover:from-[#b21e45] group-hover:to-[#e5c98d]"
                              style={{
                                height: `${report.progress}%`,
                              }}
                            >

                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-white/40 opacity-0 transition group-hover:opacity-100">
                                {report.progress}%
                              </span>

                            </div>

                          </div>
                        )
                      )}

                  </div>

                  <div className="mt-3 flex gap-3 px-4">

                    {classReports
                      .slice(0, 12)
                      .map(
                        ({
                          student,
                        }) => (
                          <div
                            key={student.id}
                            className="flex-1 truncate text-center text-[8px] uppercase tracking-wider text-white/25"
                          >
                            {
                              student.name.split(
                                " "
                              )[0]
                            }
                          </div>
                        )
                      )}

                  </div>

                </div>

              </div>

              {/* PERFORMANCE SUMMARY */}

              <div className="rounded-3xl border border-[#8b1234]/20 bg-gradient-to-br from-[#180a10]/90 to-[#0b070a]/90 p-7 backdrop-blur-xl">

                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                  Class snapshot
                </p>

                <h2 className="mt-2 font-[var(--font-cormorant)] text-3xl">
                  At a glance
                </h2>

                <div className="mt-8 space-y-6">

                  <ProgressMetric
                    label="Average progress"
                    value={averageProgress}
                  />

                  <ProgressMetric
                    label="Average performance"
                    value={averagePerformance}
                  />

                  <ProgressMetric
                    label="Chapter completion"
                    value={averageCompletion}
                  />

                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">

                  <MiniMetric
                    label="Highest"
                    value={`${highestProgress}%`}
                  />

                  <MiniMetric
                    label="Lowest"
                    value={`${lowestProgress}%`}
                  />

                </div>

              </div>

            </section>

            {/* STUDENT DIRECTORY */}

            <section className="rounded-3xl border border-white/10 bg-[#0c080b]/80 p-7 backdrop-blur-xl">

              <div className="flex flex-wrap items-end justify-between gap-4">

                <div>

                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                    Students
                  </p>

                  <h2 className="mt-2 font-[var(--font-cormorant)] text-3xl">
                    Student Directory
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setActiveTab("students")
                  }
                  className="text-xs text-[#c98296] hover:text-[#e5c98d]"
                >
                  View all reports →
                </button>

              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">

                {students
                  .slice(0, 6)
                  .map((student) => (
                    <button
                      key={student.id}
                      onClick={() => {
                        setSelectedStudent(
                          student
                        );
                        setActiveTab(
                          "students"
                        );
                      }}
                      className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-left transition hover:border-[#8b1234]/40 hover:bg-[#8b1234]/5"
                    >

                      <Avatar
                        name={student.name}
                      />

                      <div className="min-w-0">

                        <p className="truncate text-sm">
                          {student.name}
                        </p>

                        <p className="truncate text-xs text-white/30">
                          {student.email}
                        </p>

                      </div>

                      <span className="ml-auto text-[#c98296] opacity-0 transition group-hover:opacity-100">
                        →
                      </span>

                    </button>
                  ))}

              </div>

            </section>

          </div>
        )}

        {/* STUDENT REPORTS */}

        {activeTab === "students" && (
          <div className="mt-8 space-y-8">

            <section className="rounded-3xl border border-white/10 bg-[#0c080b]/80 p-7 backdrop-blur-xl">

              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                <div>

                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                    Individual reports
                  </p>

                  <h2 className="mt-2 font-[var(--font-cormorant)] text-3xl">
                    Student Performance
                  </h2>

                </div>

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search student..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]/60 md:w-72"
                />

              </div>

              {loading ? (
                <p className="mt-8 text-white/40">
                  Loading users...
                </p>
              ) : filteredStudents.length === 0 ? (
                <p className="mt-8 text-white/40">
                  No students found.
                </p>
              ) : (
                <div className="mt-7 overflow-x-auto">

                  <table className="w-full min-w-[700px] text-left">

                    <thead className="border-b border-white/10 text-[9px] uppercase tracking-[0.2em] text-white/30">

                      <tr>

                        <th className="pb-4">
                          Student
                        </th>

                        <th className="pb-4">
                          Progress
                        </th>

                        <th className="pb-4">
                          Performance
                        </th>

                        <th className="pb-4">
                          Chapters
                        </th>

                        <th className="pb-4">
                          Activity
                        </th>

                        <th className="pb-4 text-right">
                          Report
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredStudents.map(
                        (student) => {

                          const report =
                            getStudentReport(
                              student
                            );

                          return (
                            <tr
                              key={student.id}
                              className="border-b border-white/[0.05] transition hover:bg-white/[0.025]"
                            >

                              <td className="py-5">

                                <div className="flex items-center gap-3">

                                  <Avatar
                                    name={
                                      student.name
                                    }
                                  />

                                  <div>

                                    <p className="text-sm">
                                      {student.name}
                                    </p>

                                    <p className="text-xs text-white/30">
                                      {student.email}
                                    </p>

                                  </div>

                                </div>

                              </td>

                              <td className="py-5">

                                <div className="w-28">

                                  <div className="mb-1 flex justify-between text-[9px]">

                                    <span className="text-white/30">
                                      Progress
                                    </span>

                                    <span className="text-[#c98296]">
                                      {report.progress}%
                                    </span>

                                  </div>

                                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">

                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-[#8b1234] to-[#c98296]"
                                      style={{
                                        width: `${report.progress}%`,
                                      }}
                                    />

                                  </div>

                                </div>

                              </td>

                              <td className="py-5 text-sm text-[#e5c98d]">
                                {report.performance}%
                              </td>

                              <td className="py-5 text-sm text-white/50">
                                {report.completed}/
                                {report.total}
                              </td>

                              <td className="py-5 text-sm text-white/50">
                                {report.activeDays} days
                              </td>

                              <td className="py-5 text-right">

                                <button
                                  onClick={() =>
                                    setSelectedStudent(
                                      student
                                    )
                                  }
                                  className="rounded-full border border-[#8b1234]/40 px-4 py-2 text-xs text-[#c98296] transition hover:bg-[#8b1234]/10"
                                >
                                  View Report
                                </button>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>
              )}

            </section>

            {selectedStudent && (
              <StudentReport
                student={selectedStudent}
                report={getStudentReport(
                  selectedStudent
                )}
              />
            )}

          </div>
        )}

        {/* WHOLE CLASS */}

        {activeTab === "class" && (
          <div className="mt-8 space-y-8">

            <section className="rounded-3xl border border-white/10 bg-[#0c080b]/80 p-7 backdrop-blur-xl">

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                    Class analytics
                  </p>

                  <h2 className="mt-2 font-[var(--font-cormorant)] text-4xl">
                    Whole Class Report
                  </h2>

                  <p className="mt-2 text-sm text-white/30">
                    A high-level view of learning
                    progress across the class.
                  </p>

                </div>

                <span className="rounded-full border border-[#8b1234]/30 bg-[#8b1234]/10 px-4 py-2 text-xs text-[#c98296]">
                  {students.length} Students
                </span>

              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">

                <LargeMetric
                  label="Average Progress"
                  value={`${averageProgress}%`}
                />

                <LargeMetric
                  label="Average Performance"
                  value={`${averagePerformance}%`}
                />

                <LargeMetric
                  label="Average Completion"
                  value={`${averageCompletion}%`}
                />

              </div>

            </section>

            <section className="rounded-3xl border border-white/10 bg-[#0c080b]/80 p-7 backdrop-blur-xl">

              <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                Performance distribution
              </p>

              <h2 className="mt-2 font-[var(--font-cormorant)] text-3xl">
                Student Progress Comparison
              </h2>

              {classReports.length === 0 ? (
                <p className="mt-8 text-sm text-white/30">
                  No student data available yet.
                </p>
              ) : (
                <div className="mt-8 space-y-5">

                  {classReports.map(
                    ({
                      student,
                      report,
                    }) => (
                      <div
                        key={student.id}
                      >

                        <div className="mb-2 flex items-center justify-between">

                          <div className="flex items-center gap-3">

                            <Avatar
                              name={
                                student.name
                              }
                              small
                            />

                            <span className="text-sm">
                              {student.name}
                            </span>

                          </div>

                          <span className="text-xs text-[#c98296]">
                            {report.progress}%
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/10">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#8b1234] via-[#b21e45] to-[#c9a56a]"
                            style={{
                              width: `${report.progress}%`,
                            }}
                          />

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>

          </div>
        )}

      </div>

    </main>
  );
}


/* ========================================================= */
/* COMPONENTS */
/* ========================================================= */

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-5 py-3 text-xs transition ${
        active
          ? "bg-[#8b1234] text-white shadow-lg shadow-[#8b1234]/20"
          : "text-white/35 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}


function MetricCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-[#0c080b]/80 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#8b1234]/30">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
            {label}
          </p>

          <p className="mt-3 font-[var(--font-cormorant)] text-4xl">
            {value}
          </p>

          <p className="mt-2 text-xs text-white/25">
            {description}
          </p>

        </div>

        <span className="text-xl text-[#c9a56a]/60 transition group-hover:text-[#c9a56a]">
          {icon}
        </span>

      </div>

    </div>
  );
}


function ProgressMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>

      <div className="mb-2 flex justify-between">

        <span className="text-xs text-white/40">
          {label}
        </span>

        <span className="text-xs text-[#c98296]">
          {value}%
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">

        <div
          className="h-full rounded-full bg-gradient-to-r from-[#8b1234] to-[#c9a56a]"
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
}


function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

      <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p className="mt-2 font-[var(--font-cormorant)] text-2xl">
        {value}
      </p>

    </div>
  );
}


function LargeMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
        {label}
      </p>

      <p className="mt-3 font-[var(--font-cormorant)] text-4xl">
        {value}
      </p>

    </div>
  );
}


function Avatar({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border border-[#8b1234]/40 bg-gradient-to-br from-[#8b1234]/30 to-[#c9a56a]/10 text-[#e5c98d] ${
        small
          ? "h-8 w-8 text-[9px]"
          : "h-10 w-10 text-xs"
      }`}
    >
      {initials}
    </div>
  );
}


function StudentReport({
  student,
  report,
}: {
  student: User;
  report: StudentReport;
}) {
  const chapters = [
    "Introduction & Fundamentals",
    "Core Concepts",
    "Practical Applications",
    "Advanced Concepts",
    "Assessment & Revision",
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-[#8b1234]/25 bg-[#0c080b]/90 backdrop-blur-xl">

      <div className="border-b border-white/10 bg-gradient-to-r from-[#180a10] to-transparent p-7">

        <div className="flex flex-wrap items-center justify-between gap-5">

          <div className="flex items-center gap-4">

            <Avatar
              name={student.name}
            />

            <div>

              <p className="text-[9px] uppercase tracking-[0.3em] text-[#c9a56a]">
                Individual Report
              </p>

              <h2 className="mt-1 font-[var(--font-cormorant)] text-3xl">
                {student.name}
              </h2>

              <p className="text-xs text-white/30">
                {student.email}
              </p>

            </div>

          </div>

          <div className="text-right">

            <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
              Overall progress
            </p>

            <p className="font-[var(--font-cormorant)] text-4xl text-[#c98296]">
              {report.progress}%
            </p>

          </div>

        </div>

      </div>

      <div className="grid gap-8 p-7 lg:grid-cols-2">

        {/* PERFORMANCE */}

        <div>

          <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a56a]">
            Performance
          </p>

          <h3 className="mt-2 font-[var(--font-cormorant)] text-2xl">
            Learning indicators
          </h3>

          <div className="mt-7 space-y-6">

            <ProgressMetric
              label="Overall progress"
              value={report.progress}
            />

            <ProgressMetric
              label="Performance"
              value={report.performance}
            />

            <ProgressMetric
              label="Chapter completion"
              value={Math.round(
                (report.completed /
                  report.total) *
                  100
              )}
            />

          </div>

        </div>

        {/* CHAPTER STATUS */}

        <div>

          <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a56a]">
            Learning journey
          </p>

          <h3 className="mt-2 font-[var(--font-cormorant)] text-2xl">
            Chapter status
          </h3>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">

            {chapters.map(
              (chapter, index) => {

                const completed =
                  index <
                  report.completed;

                return (
                  <div
                    key={chapter}
                    className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 last:border-0"
                  >

                    <div className="flex items-center gap-3">

                      <span className="text-[9px] text-[#b21e45]">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <span className="text-xs text-white/50">
                        {chapter}
                      </span>

                    </div>

                    <span
                      className={`text-[9px] ${
                        completed
                          ? "text-[#c9a56a]"
                          : "text-white/25"
                      }`}
                    >
                      {completed
                        ? "COMPLETE"
                        : "PENDING"}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </div>

    </section>
  );
}