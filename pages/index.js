import React, { useRef, useState, useEffect, useCallback } from "react";
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
const DETECTION_INTERVAL_MS = 100;
const HAND_LANDMARKER_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const MEDIAPIPE_WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

export default function Home() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [gameRunning, setGameRunning] = useState(false);
  const [targetLetter, setTargetLetter] = useState("-");
  const [currentWord, setCurrentWord] = useState("");
  const [letterIndex, setLetterIndex] = useState(0);
  const [detected, setDetected] = useState("-");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [lettersDone, setLettersDone] = useState(0);
  const [banner, setBanner] = useState("");

  const handLandmarkerRef = useRef(null);
  const estimatorRef = useRef(null);
  const latestLandmarksRef = useRef(null);
  const lastInferenceAtRef = useRef(0);
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
    setCurrentWord(wordRef.current);
    setLetterIndex(0);
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
    setCurrentWord("");
    setLetterIndex(0);
    setDetected("-");
  }, []);

  // Initialize models
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: HAND_LANDMARKER_URL },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      if (cancelled) return;

      const gestures = [Gestures.ThumbsUpGesture, aSign, bSign, cSign, dSign, eSign, fSign, gSign, iSign, lSign, oSign, uSign, vSign, wSign, ySign];
      const estimator = new GestureEstimator(gestures);

      handLandmarkerRef.current = handLandmarker;
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
    let cancelled = false;

    function processPrediction(landmarks) {
      if (!gameRunning || !estimatorRef.current) return;

      const now = performance.now();
      estimatorRef.current.estimate(landmarks, 7).then((estimate) => {
        const matches = estimate.gestures || [];
        matches.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        const label = matches[0]?.name || "-";
        const conf = matches[0]?.confidence || 0;
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
            setLetterIndex(indexRef.current);
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
      }).catch((error) => {
        console.error("Gesture estimation failed:", error);
      });
    }

    function runDetection(videoElement) {
      if (!handLandmarkerRef.current) return;
      try {
        const now = performance.now();
        const result = handLandmarkerRef.current.detectForVideo(videoElement, now);
        const normalizedHand = result.landmarks?.[0];
        if (!normalizedHand) {
          latestLandmarksRef.current = null;
          if (gameRunning) setDetected("No hand");
          return;
        }

        const landmarks = normalizedHand.map(({ x, y, z }) => [
          x * videoElement.videoWidth,
          y * videoElement.videoHeight,
          z * videoElement.videoWidth,
        ]);
        latestLandmarksRef.current = landmarks;
        processPrediction(landmarks);
      } catch (error) {
        console.error("Hand detection failed:", error);
        if (gameRunning) setDetected("Tracking unavailable");
      }
    }

    function drawFrame() {
      if (cancelled) return;
      const videoElement = webcamRef.current?.video;
      const canvas = canvasRef.current;
      if (!videoElement || !canvas || !handLandmarkerRef.current) {
        rafRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      if (videoElement.readyState < 2 || !videoElement.videoWidth || !videoElement.videoHeight) {
        rafRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (canvas.width !== videoElement.videoWidth || canvas.height !== videoElement.videoHeight) {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
      }

      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const landmarks = latestLandmarksRef.current;
      if (landmarks) {
        drawHand(landmarks, ctx);
      }

      const box = Math.min(canvas.width, canvas.height) * 0.55;
      ctx.strokeStyle = "rgba(144,238,144,0.9)";
      ctx.lineWidth = 4;
      ctx.strokeRect((canvas.width - box) / 2, (canvas.height - box) / 2, box, box);

      const now = performance.now();
      if (now - lastInferenceAtRef.current >= DETECTION_INTERVAL_MS) {
        lastInferenceAtRef.current = now;
        runDetection(videoElement);
      }
      rafRef.current = requestAnimationFrame(drawFrame);
    }

    rafRef.current = requestAnimationFrame(drawFrame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
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
    <div className="game-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">ASL</div>
          <div className="brand-copy">
            <h1>ASL Letter Challenge</h1>
            <p>Copy the handshape shown, one letter at a time</p>
          </div>
        </div>
        <div className="scoreboard" aria-label="Game statistics">
          <div className="stat"><span className="stat-label">Score</span><span className="stat-value">{score}</span></div>
          <div className="stat"><span className="stat-label">Time</span><span className="stat-value">{timeLeft}s</span></div>
          <div className="stat"><span className="stat-label">Letters</span><span className="stat-value">{lettersDone}</span></div>
        </div>
      </header>

      <main className="game-layout">
        <section className="play-column" aria-label="ASL signing game">
          <div className="word-panel">
            <div>
              <span className="word-label">Spell this word</span>
              <div className="word-letters" aria-label={currentWord || "No word selected"}>
                {(currentWord || "---").split("").map((letter, index) => (
                  <span
                    className={`word-letter${currentWord && index < letterIndex ? " complete" : ""}${currentWord && index === letterIndex ? " current" : ""}`}
                    key={`${letter}-${index}`}
                  >{letter}</span>
                ))}
              </div>
            </div>
            <div className="detected-note">{gameRunning ? "Show the matching handshape" : "Press Start when you're ready"}</div>
          </div>

          <div className="camera-stage">
            <Webcam
              ref={webcamRef}
              className="camera-video-source"
              style={{ display: "none" }}
              mirrored={false}
              audio={false}
              videoConstraints={{ width: 640, height: 480 }}
            />
            <canvas ref={canvasRef} className="camera-canvas" aria-label="Live camera with hand tracking" />
            <div className="camera-label">CAMERA</div>
            <div className="target-card">
              <div className="target-label">Sign this letter</div>
              <div className="target-letter">{targetLetter}</div>
              {targetLetter !== "-" && (
                <img className="target-image" src={`/handimage/${targetLetter}hand.svg`} alt={`ASL handshape for ${targetLetter}`} />
              )}
            </div>

            {banner && <div className="feedback-banner" role="status">{banner}</div>}
            {loading && <div className="camera-loading" role="status">Loading hand detector…</div>}
          </div>
        </section>

        <aside className="side-panel">
          <section className="side-section">
            <h2 className="side-title">Live prediction</h2>
            <div className="detected-value">{detected}</div>
            <div className="detected-note">Keep your full hand in the light-green guide.</div>
          </section>
          <div className="control-row">
            <button onClick={startGame} disabled={loading} className="control-button">
              {gameRunning ? "Restart game" : "Start game"}
            </button>
            <button onClick={resetGame} className="control-button secondary">Reset</button>
          </div>
        </aside>
      </main>
    </div>
  );
}
