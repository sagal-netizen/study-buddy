"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Club = {
  name: string;
  members: number;
  description: string;
};

const initialClubs: Club[] = [
  {
    name: "Python Learners",
    members: 24,
    description:
      "Practice Python, solve problems and help each other understand concepts.",
  },
  {
    name: "AI Explorers",
    members: 18,
    description:
      "Discuss AI, machine learning and interesting things happening in technology.",
  },
  {
    name: "Exam Warriors",
    members: 31,
    description:
      "Stay accountable, share study plans and prepare together.",
  },
];

export default function StudyClubsPage() {
  const router = useRouter();

  const [joinedClubs, setJoinedClubs] = useState<string[]>([]);
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [message, setMessage] = useState("");

  // =====================================================
  // LOAD JOINED CLUBS
  // =====================================================

  useEffect(() => {
    const saved = localStorage.getItem(
      "studybuddy_joined_clubs"
    );

    if (saved) {
      try {
        setJoinedClubs(JSON.parse(saved));
      } catch {
        setJoinedClubs([]);
      }
    }
  }, []);

  // =====================================================
  // JOIN CLUB
  // =====================================================

  const joinClub = (clubName: string) => {
    if (joinedClubs.includes(clubName)) {
      return;
    }

    const updatedJoinedClubs = [
      ...joinedClubs,
      clubName,
    ];

    setJoinedClubs(updatedJoinedClubs);

    localStorage.setItem(
      "studybuddy_joined_clubs",
      JSON.stringify(updatedJoinedClubs)
    );

    setClubs((previous) =>
      previous.map((club) =>
        club.name === clubName
          ? {
              ...club,
              members: club.members + 1,
            }
          : club
      )
    );

    setMessage(
      `You've joined ${clubName}! Welcome to the club. ✦`
    );

    setTimeout(() => {
      setMessage("");
    }, 3500);
  };

  return (
    <main className="min-h-screen bg-[#070507] text-[#f5e8e8]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-white/[0.06] bg-[#0b070a] px-6 py-5">

        <div className="mx-auto flex max-w-5xl items-center justify-between">

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="font-[var(--font-cormorant)] text-2xl"
          >
            Study
            <span className="text-[#b21e45]">
              Buddy
            </span>

            <span className="ml-2 text-xs tracking-[0.3em] text-[#c9a56a]">
              AI
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="text-xs text-white/35 transition hover:text-white"
          >
            ← Dashboard
          </button>

        </div>

      </header>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-5xl px-6 py-14">

        {/* =================================================
            INTRO
        ================================================= */}

        <div>

          <p className="text-xs uppercase tracking-[0.35em] text-[#c9a56a]">
            learn together
          </p>

          <h1 className="mt-3 font-[var(--font-cormorant)] text-6xl">
            Study Clubs
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/30">
            Find people learning similar things,
            share ideas and keep each other
            motivated.
          </p>

        </div>


        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (

          <div className="mt-8 rounded-2xl border border-[#c9a56a]/20 bg-[#c9a56a]/5 px-5 py-4 text-sm text-[#c9a56a]">
            {message}
          </div>

        )}


        {/* =================================================
            CLUBS
        ================================================= */}

        <div className="mt-10 grid gap-5 md:grid-cols-3">

          {clubs.map((club) => {

            const joined =
              joinedClubs.includes(
                club.name
              );

            return (

              <div
                key={club.name}
                className={`rounded-3xl border bg-[#100b0e] p-7 transition duration-300 ${
                  joined
                    ? "border-[#c9a56a]/30"
                    : "border-white/[0.07] hover:-translate-y-1 hover:border-[#8b1234]/40"
                }`}
              >

                {/* ICON */}

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${
                    joined
                      ? "bg-[#c9a56a]/10 text-[#c9a56a]"
                      : "bg-[#8b1234]/15 text-[#b21e45]"
                  }`}
                >
                  {joined ? "✓" : "♡"}
                </div>


                {/* TITLE */}

                <h2 className="mt-6 font-[var(--font-cormorant)] text-2xl">
                  {club.name}
                </h2>


                {/* DESCRIPTION */}

                <p className="mt-3 text-sm leading-6 text-white/30">
                  {club.description}
                </p>


                {/* MEMBERS */}

                <p className="mt-5 text-xs text-[#c98296]">
                  {club.members} learners
                </p>


                {/* JOIN BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    joinClub(club.name)
                  }
                  disabled={joined}
                  className={`mt-5 w-full rounded-xl py-3 text-sm transition ${
                    joined
                      ? "cursor-default border border-[#c9a56a]/30 bg-[#c9a56a]/10 text-[#c9a56a]"
                      : "border border-[#8b1234]/30 bg-[#8b1234]/10 text-[#c98296] hover:bg-[#8b1234]/20"
                  }`}
                >
                  {joined
                    ? "Joined ✓"
                    : "Join Club"}
                </button>

              </div>

            );
          })}

        </div>


        {/* =================================================
            YOUR CLUBS
        ================================================= */}

        {joinedClubs.length > 0 && (

          <section className="mt-12 rounded-3xl border border-white/[0.07] bg-[#100b0e] p-7">

            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
              your community
            </p>

            <h2 className="mt-2 font-[var(--font-cormorant)] text-3xl">
              Your Joined Clubs
            </h2>

            <div className="mt-5 flex flex-wrap gap-3">

              {joinedClubs.map((club) => (

                <div
                  key={club}
                  className="rounded-full border border-[#8b1234]/30 bg-[#8b1234]/10 px-5 py-2.5 text-xs text-[#c98296]"
                >
                  ♡ {club}
                </div>

              ))}

            </div>

          </section>

        )}

      </div>

    </main>
  );
}