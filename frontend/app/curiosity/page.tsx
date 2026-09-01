"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const curiosities = [
  {
    title: "Your brain is an energy hog.",
    text: "Although the brain is only a small part of your body by weight, it uses a surprisingly large share of your body's energy.",
  },
  {
    title: "Octopuses have three hearts.",
    text: "Two hearts pump blood toward the gills, while another pumps blood around the rest of the body.",
  },
  {
    title: "Bananas are botanically berries.",
    text: "Botanical definitions don't always match everyday language. Bananas qualify as berries, while strawberries technically do not.",
  },
  {
    title: "Learning changes your brain.",
    text: "When you learn something new, your brain strengthens and reorganises connections between neurons.",
  },
  {
    title: "Honey can last an incredibly long time.",
    text: "Properly stored honey can remain edible for extremely long periods because of its low water content and chemistry.",
  },
  {
    title: "A day on Venus is longer than its year.",
    text: "Venus rotates so slowly that one rotation takes longer than the time Venus needs to orbit the Sun.",
  },
];

export default function CuriosityPage() {
  const router = useRouter();

  const [index, setIndex] =
    useState(
      Math.floor(
        Math.random() *
          curiosities.length
      )
    );

  const curiosity =
    curiosities[index];

  const randomise = () => {
    let next = Math.floor(
      Math.random() *
        curiosities.length
    );

    if (next === index) {
      next =
        (next + 1) %
        curiosities.length;
    }

    setIndex(next);
  };

  return (
    <main className="min-h-screen bg-[#070507] text-[#f5e8e8]">

      <header className="border-b border-white/[0.06] bg-[#0b070a] px-6 py-5">

        <div className="mx-auto flex max-w-5xl items-center justify-between">

          <button
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
            onClick={() =>
              router.push("/dashboard")
            }
            className="text-xs text-white/35 hover:text-white"
          >
            ← Dashboard
          </button>

        </div>

      </header>

      <div className="flex min-h-[calc(100vh-75px)] items-center justify-center px-6">

        <section className="w-full max-w-3xl rounded-[2rem] border border-[#c9a56a]/15 bg-gradient-to-br from-[#180b10] to-[#100b0e] p-10 text-center md:p-16">

          <p className="text-xs uppercase tracking-[0.35em] text-[#c9a56a]">
            random curiosity ✧
          </p>

          <div className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#8b1234]/15 text-3xl text-[#b21e45]">
            ✧
          </div>

          <h1 className="mt-8 font-[var(--font-cormorant)] text-5xl md:text-6xl">
            {curiosity.title}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-white/40">
            {curiosity.text}
          </p>

          <button
            onClick={randomise}
            className="mt-10 rounded-full bg-[#8b1234] px-8 py-3.5 text-sm transition hover:bg-[#b21e45]"
          >
            Give me another ✦
          </button>

        </section>

      </div>

    </main>
  );
}