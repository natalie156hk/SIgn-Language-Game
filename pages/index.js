import React, { useRef, useState, useEffect, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { GestureEstimator, Gestures } from "fingerpose";
import {
  aSign, bSign, cSign, dSign, eSign, fSign, gSign,
  iSign, lSign, oSign, uSign, vSign, wSign, ySign,
} from "../lib/handsigns";

const TARGET_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "I", "L", "O", "U", "V", "W", "Y"];
const WORDS = [
  "BAY", "COW", "BOY", "OWL", "CAB", "FLY", "KEY", "WAX", "DOG",
  "CUP", "MAP", "LIP", "FOX", "YAM", "DAD", "BED", "VAN", "WIG"
];

const GAME_SECONDS = 90;
const CONF_THRESHOLD = 6.5;
const STABLE_MS = 600;
const COOLDOWN_MS = 500;

export default function Home() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [gameRunning, setGameRunning] = useState(false);
  const [targetLetter, setTargetLetter] = useState("-");
  const [detected, setDetected] = useState("-");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [lettersDone, setLettersDone] = useState(0);
  const [banner, setBanner] = useState("");

  const netRef = useRef(null);
  const estimatorRef = useRef(null);
  const wordRef = useRef("");
  const indexRef = useRef(0);
  const lastLabelRef = useRef(null);
  const stableStartRef = useRef(0);
  const cooldownRef = useRef(0);
  const scoreRef = useRef(0);
  const timerIntRef = useRef(null);
  const rafRef = useRef(null);

  const showBanner = useCallback((text) => {
    setBanner(text);
    setTimeout(() => setBanner(""), 1400);
  }, []);

  const pickWord = useCallback(() => {
    wordRef.current = WORDS[Math.floor(Math.random() * WORDS.length)];
    indexRef.current = 0;
    setTargetLetter(wordRef.current[0]);
  }, []);

  const startGame = useCallback(() => {
    if (loading) return;
    setScore(0);
    scoreRef.current = 0;
    setLettersDone(0);
    setTimeLeft(GAME_SECONDS);
    lastLabelRef.current = null;
    stableStartRef.current = 0;
    cooldownRef.current = 0;
    pickWord();
    setGameRunning(true);

    clearInterval(timerIntRef.current);
    timerIntRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerIntRef.current);
          setGameRunning(false);
          showBanner(`Game Over! Score: ${scoreRef.current}`);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [loading, pickWord, showBanner]);

  const resetGame = useCallback(() => {
    setGameRunning(false);
    clearInterval(timerIntRef.current);
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(GAME_SECONDS);
    setLettersDone(0);
    setTargetLetter("-");
    setDetected("-");
  }, []);

  // Initialize models
  useEffect(() => {
    let cancelled = false;

    async function init() {
      await tf.setBackend("cpu");
      await tf.ready();
      const net = await handpose.load();
      if (cancelled) return;

      const gestures = [Gestures.ThumbsUpGesture, aSign, bSign, cSign, dSign, eSign, fSign, gSign, iSign, lSign, oSign, uSign, vSign, wSign, ySign];
      const estimator = new GestureEstimator(gestures);

      netRef.current = net;
      estimatorRef.current = estimator;
      setLoading(false);
    }

    init();
    return () => {
      cancelled = true;
      clearInterval(timerIntRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Detection loop
  useEffect(() => {
    async function detect() {
      const videoElement = webcamRef.current?.video;
      const canvas = canvasRef.current;
      if (!videoElement || !canvas || !netRef.current) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      const ctx = canvas.getContext("2d");
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;

      // Draw camera onto single canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      const hands = await netRef.current.estimateHands(videoElement);
      if (hands.length > 0) {
        drawHand(hands[0].landmarks, ctx);

        if (gameRunning && estimatorRef.current) {
          const now = performance.now();
          const estimate = await estimatorRef.current.estimate(hands[0].landmarks, 7);
          const matches = estimate.gestures;
          let label = "-";
          let conf = 0;
          if (matches && matches.length > 0) {
            matches.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
            label = matches[0].name || "-";
            conf = matches[0].confidence || 0;
          }
          setDetected(`${label} (${conf.toFixed(1)})`);

          const expected = wordRef.current[indexRef.current];
          if (label === expected && conf >= CONF_THRESHOLD) {
            if (label !== lastLabelRef.current) {
              lastLabelRef.current = label;
              stableStartRef.current = now;
            } else if (now - stableStartRef.current >= STABLE_MS && now >= cooldownRef.current) {
              const newScore = scoreRef.current + 10;
              scoreRef.current = newScore;
              setScore(newScore);
              setLettersDone((d) => d + 1);
              showBanner("🎉 Great job!");
              indexRef.current += 1;
              cooldownRef.current = now + COOLDOWN_MS;
              lastLabelRef.current = null;
              stableStartRef.current = 0;

              if (indexRef.current >= wordRef.current.length) {
                showBanner(`🌟 Word "${wordRef.current}" complete!`);
                const bonus = scoreRef.current + 20;
                scoreRef.current = bonus;
                setScore(bonus);
                setTimeout(() => pickWord(), 800);
              } else {
                setTargetLetter(wordRef.current[indexRef.current]);
              }
            }
          } else {
            lastLabelRef.current = null;
            stableStartRef.current = 0;
          }
        }
      }

      // Draw light green guide box in center
      const box = Math.min(canvas.width, canvas.height) * 0.55;
      ctx.strokeStyle = "rgba(144,238,144,0.9)";
      ctx.lineWidth = 4;
      ctx.strokeRect((canvas.width - box) / 2, (canvas.height - box) / 2, box, box);

      rafRef.current = requestAnimationFrame(detect);
    }

    rafRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameRunning, pickWord, showBanner]);

  function drawHand(landmarks, ctx) {
    const fingers = [
      [0, 1, 2, 3, 4],
      [0, 5, 6, 7, 8],
      [0, 9, 10, 11, 12],
      [0, 13, 14, 15, 16],
      [0, 17, 18, 19, 20],
    ];
    ctx.fillStyle = "#90EE90";
    for (const p of landmarks) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 5, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.strokeStyle = "#00c853";
    ctx.lineWidth = 3;
    for (const finger of fingers) {
      ctx.beginPath();
      ctx.moveTo(landmarks[finger[0]][0], landmarks[finger[0]][1]);
      for (let i = 1; i < finger.length; i++) {
        ctx.lineTo(landmarks[finger[i]][0], landmarks[finger[i]][1]);
      }
      ctx.stroke();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-orange-100 text-gray-800 flex flex-col items-center">
      <header className="w-full text-center p-4 bg-white/60 backdrop-blur">
        <h1 className="text-2xl font-extrabold text-teal-700">ASL Letter Challenge</h1>
        <p className="text-sm text-gray-600 mt-1">Copy the letter with your hand!</p>
        <div className="flex gap-3 justify-center mt-3 flex-wrap">
          <span className="bg-white rounded-full px-4 py-1 font-bold shadow">Score: {score}</span>
          <span className="bg-white rounded-full px-4 py-1 font-bold shadow">Time: {timeLeft}s</span>
          <span className="bg-white rounded-full px-4 py-1 font-bold shadow">Letters: {lettersDone}</span>
        </div>
      </header>

      <main className="relative w-[640px] max-w-[96vw] aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-black my-3">
        <Webcam ref={webcamRef} className="hidden" mirrored={false} audio={false} videoConstraints={{ width: 640, height: 480 }} />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="absolute top-3 right-3 bg-white/95 rounded-2xl p-4 text-center shadow-lg min-w-[110px]">
          <div className="text-xs text-gray-500">Show this letter</div>
          <div className="text-6xl font-black text-teal-700 leading-none">{targetLetter}</div>
          {targetLetter !== "-" && (
            <img src={`/handimage/${targetLetter}hand.svg`} alt={targetLetter} className="h-16 mx-auto mt-1" />
          )}
        </div>

        {banner && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-600 text-white px-7 py-3 rounded-full text-xl font-extrabold shadow-xl pointer-events-none">
            {banner}
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/95 flex items-center justify-center text-teal-700 text-lg font-bold z-50">
            Loading hand magic... please wait 🙌
          </div>
        )}
      </main>

      <div className="text-lg font-bold text-gray-700">Detected: {detected}</div>

      <div className="flex gap-3 mt-3 mb-6">
        <button onClick={startGame} disabled={loading} className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-teal-700 disabled:opacity-50">
          Start Game
        </button>
        <button onClick={resetGame} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-orange-600">
          Reset
        </button>
      </div>
    </div>
  );
}
