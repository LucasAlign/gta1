import { useMemo, useState } from "react";
import { Leaf, Sprout, Star, Tractor, UserRound } from "lucide-react";

type CropState = "empty" | "planted" | "growing" | "ready";
type PlayerSpot = "yard" | "tractor" | "garden" | "npc";

const cropLabels: Record<CropState, string> = {
  empty: "Soft soil",
  planted: "Tiny seedling",
  growing: "Growing carrot",
  ready: "Ready carrot",
};

export default function GrandTractorAutoPhase1() {
  const [cropState, setCropState] = useState<CropState>("empty");
  const [stars, setStars] = useState(0);
  const [spot, setSpot] = useState<PlayerSpot>("yard");
  const [jobDone, setJobDone] = useState(false);
  const [message, setMessage] = useState("Let's help the garden grow.");

  const action = useMemo(() => {
    if (spot === "yard") return "Walk to the tractor";
    if (spot === "tractor") return "Drive to the garden";
    if (spot === "npc") return jobDone ? "Wave hello" : "Ask how to help";
    if (cropState === "empty") return "Plant carrot seed";
    if (cropState === "planted") return "Water the seedling";
    if (cropState === "growing") return "Water once more";
    return "Pick the carrot";
  }, [cropState, jobDone, spot]);

  function doAction() {
    if (spot === "yard") {
      setSpot("tractor");
      setMessage("Climb into the starter tractor.");
      return;
    }

    if (spot === "tractor") {
      setSpot("garden");
      setMessage("The tractor rolls gently to the garden.");
      return;
    }

    if (spot === "npc") {
      setMessage(jobDone ? "Thanks again, helper." : "Could you grow one carrot for me?");
      return;
    }

    if (cropState === "empty") {
      setCropState("planted");
      setMessage("A little seed is tucked into the soil.");
      return;
    }

    if (cropState === "planted") {
      setCropState("growing");
      setMessage("Water makes the carrot leaves pop up.");
      return;
    }

    if (cropState === "growing") {
      setCropState("ready");
      setMessage("The carrot is big and ready to pick.");
      return;
    }

    setCropState("empty");
    setStars((value) => value + 2);
    setJobDone(true);
    setSpot("npc");
    setMessage("Thank you for helping the garden grow.");
  }

  function resetLoop() {
    setCropState("empty");
    setStars(0);
    setSpot("yard");
    setJobDone(false);
    setMessage("Let's help the garden grow.");
  }

  return (
    <main className="min-h-screen bg-[#dff3ff] text-[#17324a]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#9fd49f] bg-[#f7fff2] px-4 py-3 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-[#235b31]">Grand Tractor Auto</h1>
            <p className="text-sm text-[#4d6f5a]">Phase 1 browser preview: tractor, garden, helper, stars.</p>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-[#fff3a8] px-3 py-2 font-semibold text-[#6a5200]">
            <Star className="h-5 w-5 fill-[#ffd642] text-[#9b7500]" />
            Helping Stars: {stars}
          </div>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_300px]">
          <section className="relative min-h-[560px] overflow-hidden rounded-lg border border-[#8bc78b] bg-[#9be36f] shadow-sm">
            <div className="absolute inset-x-0 top-0 h-28 bg-[#8fd7ff]" />
            <div className="absolute left-[8%] top-[15%] h-28 w-36 rounded-md bg-[#f9db9a] shadow-sm" />
            <div className="absolute left-[10%] top-[18%] h-20 w-28 rounded bg-[#d94f34]" />
            <div className="absolute left-[14%] top-[10%] h-16 w-16 rotate-45 bg-[#b73d2c]" />
            <div className="absolute bottom-[10%] left-[8%] h-24 w-32 rounded-lg bg-[#c78b47]" />
            <div className="absolute bottom-[12%] left-[10%] h-20 w-28 rounded-md border-4 border-[#8c5d2f] bg-[#7b4b28]" />
            <div className="absolute bottom-[12%] left-[26%] h-20 w-36 rounded-lg bg-[#c58a4a]" />
            <div className="absolute bottom-[15%] left-[28%] grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-6 w-8 rounded bg-[#7c4b2b]" />
              ))}
            </div>

            <div className="absolute bottom-[22%] left-[42%] flex h-24 w-32 items-center justify-center rounded-lg border-4 border-[#6d4726] bg-[#8b5a35]">
              {cropState === "empty" ? (
                <Leaf className="h-10 w-10 text-[#5f3d23]" />
              ) : (
                <Sprout className={`h-14 w-14 ${cropState === "ready" ? "text-[#f47b2f]" : "text-[#2f8d3a]"}`} />
              )}
            </div>

            <div className="absolute bottom-[27%] left-[70%] flex flex-col items-center gap-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffe0bd] shadow">
                <UserRound className="h-9 w-9 text-[#6c4b35]" />
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#31543a] shadow-sm">Neighbor</div>
            </div>

            <div className="absolute bottom-[20%] left-[17%] flex h-24 w-32 items-center justify-center rounded-lg bg-[#eecb36] shadow-lg">
              <Tractor className="h-16 w-16 text-[#356833]" />
            </div>

            <div
              className={`absolute flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#3478f6] text-white shadow-lg transition-all ${
                spot === "yard"
                  ? "bottom-[36%] left-[18%]"
                  : spot === "tractor"
                    ? "bottom-[31%] left-[23%]"
                    : spot === "garden"
                      ? "bottom-[40%] left-[50%]"
                      : "bottom-[44%] left-[73%]"
              }`}
              aria-label="Player position"
            >
              <UserRound className="h-7 w-7" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-center justify-between gap-3 bg-white/85 px-4 py-3 backdrop-blur">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#5d7b68]">Narration</div>
                <p className="text-lg font-semibold text-[#23412d]">{message}</p>
              </div>
              <button
                onClick={doAction}
                className="rounded-md bg-[#2f7d32] px-5 py-3 text-base font-bold text-white shadow hover:bg-[#276b2a] focus:outline-none focus:ring-4 focus:ring-[#bde8a9]"
              >
                {action}
              </button>
            </div>
          </section>

          <aside className="rounded-lg border border-[#bddcb7] bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#24462d]">Loop State</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3 border-b border-[#edf2e8] pb-2">
                <dt className="text-[#607061]">Player</dt>
                <dd className="font-semibold capitalize text-[#253d29]">{spot}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[#edf2e8] pb-2">
                <dt className="text-[#607061]">Crop</dt>
                <dd className="font-semibold text-[#253d29]">{cropLabels[cropState]}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[#edf2e8] pb-2">
                <dt className="text-[#607061]">Job</dt>
                <dd className="font-semibold text-[#253d29]">{jobDone ? "Complete" : "First harvest"}</dd>
              </div>
            </dl>

            <div className="mt-5 rounded-md bg-[#f1f8ec] p-3 text-sm text-[#466048]">
              Click the green action button to run the Phase 1 one-button interaction flow.
            </div>

            <button
              onClick={resetLoop}
              className="mt-4 w-full rounded-md border border-[#aac9a6] bg-white px-4 py-2 font-semibold text-[#2f6931] hover:bg-[#f4fbef]"
            >
              Reset Preview
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}
