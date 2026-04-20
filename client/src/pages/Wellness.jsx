// Gives users a calmer page with a breathing excercise, supportive messages, crisis help, and gentle music

import { useEffect, useRef, useState } from "react";

const comfortMessages = [
  "You are loved.",
  "Your existence makes people's days better.",
  "It is not too late for things to start going your way.",
  "You do not need to carry everything at once.",
  "A bad day is not the same as a bad life.",
  "You are allowed to pause.",
  "Being overwhelmed does not mean you are weak.",
  "Someone would rather hear from you than lose you.",
];

const calmingTracks = [
  {
    title: "relaxing Clair de Lune Piece with Rain Sounds",
    url: "https://www.youtube.com/watch?v=zpQY6KEk4RU",
  },
  {
    title: "Gymnopédie No. 1 ~ Erik Satie Ten Hours Looped",
    url: "https://www.youtube.com/watch?v=hmjAoI6qRM0&list=RDhmjAoI6qRM0&start_radio=1",
  },
  {
    title: "Peaceful Classical Music : Bach, Mozart, Vivaldi...",
    url: "https://youtu.be/ElWSdcg67RY?si=9qW16Zx86RD0u4dw",
  },
  {
    title: "Relaxing music Ghibli Studio Ghibli Concert",
    url: "https://www.youtube.com/watch?v=Njt1io9jakQ&list=RDNjt1io9jakQ&start_radio=1",
  },
  {
    title:
      "Relaxing Music to Relieve Stress, Anxiety and Depression; Heals the Mind, body and Soul - Deep Sleep",
    url: "https://www.youtube.com/watch?v=I3OJUwILelU",
  },
];

export default function Wellness() {
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const flipTimerRef = useRef(null);

  // Breathing exercise state
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Breathe in");
  const [cloudScale, setCloudScale] = useState(1);
  const breathingTimerRef = useRef(null);

  const showRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * comfortMessages.length);
    const randomMessage = comfortMessages[randomIndex];

    setCurrentMessage(randomMessage);
    setIsCardFlipped(true);

    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current);
    }

    flipTimerRef.current = setTimeout(() => {
      setIsCardFlipped(false);
    }, 8000);
  };

  const stopBreathingExercise = () => {
    setIsBreathing(false);
    setBreathPhase("Breathe in");
    setCloudScale(1);

    if (breathingTimerRef.current) {
      clearTimeout(breathingTimerRef.current);
    }
  };

  const startBreathingExercise = () => {
    if (breathingTimerRef.current) {
      clearTimeout(breathingTimerRef.current);
    }

    setIsBreathing(true);
    setBreathPhase("Breathe in");
    setCloudScale(1.35);

    breathingTimerRef.current = setTimeout(() => {
      setBreathPhase("Hold");

      breathingTimerRef.current = setTimeout(() => {
        setBreathPhase("Breathe out");
        setCloudScale(1);

        breathingTimerRef.current = setTimeout(() => {
          startBreathingExercise();
        }, 4500);
      }, 2000);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) {
        clearTimeout(flipTimerRef.current);
      }

      if (breathingTimerRef.current) {
        clearTimeout(breathingTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="page-shell"
      style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
    >
      <h1 className="page-title">Wellness</h1>

      <p className="page-intro">
        This page is here for moments when the site feels heavy. Take what
        helps and leave the rest.
      </p>

      <div className="page-card">
        <h2 style={{ textAlign: "center" }}>Breathe with me</h2>
        <p className="helper-text" style={{ textAlign: "center" }}>
          Let the shape guide your breathing for a few quieter moments.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "18px",
            paddingTop: "10px",
          }}
        >
          <div
            style={{
              width: "260px",
              height: "190px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "170px",
                height: "95px",
                transform: `scale(${cloudScale})`,
                transition: isBreathing
                  ? "transform 4s ease-in-out"
                  : "transform 0.6s ease-in-out",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "170px",
                  height: "95px",
                  backgroundColor: "#dbe5ef",
                  borderRadius: "999px",
                  position: "absolute",
                  inset: 0,
                  boxShadow: "0 0 0 10px rgba(219, 229, 239, 0.18)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "82px",
                  height: "82px",
                  backgroundColor: "#dbe5ef",
                  borderRadius: "50%",
                  top: "-26px",
                  left: "20px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "95px",
                  height: "95px",
                  backgroundColor: "#dbe5ef",
                  borderRadius: "50%",
                  top: "-34px",
                  left: "63px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "78px",
                  height: "78px",
                  backgroundColor: "#dbe5ef",
                  borderRadius: "50%",
                  top: "-22px",
                  right: "18px",
                }}
              />
            </div>

            {/* Smiley face stays fixed while cloud scales */}
            <div
              style={{
                position: "absolute",
                width: "170px",
                height: "95px",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#5f6f7d",
                  borderRadius: "50%",
                  top: "46px",
                  left: "58px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#5f6f7d",
                  borderRadius: "50%",
                  top: "46px",
                  right: "58px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "34px",
                  height: "16px",
                  borderBottom: "3px solid #5f6f7d",
                  borderRadius: "0 0 24px 24px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: "58px",
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "1.2rem" }}>
              <strong>{isBreathing ? breathPhase : "Ready when you are"}</strong>
            </p>
            <p className="helper-text" style={{ marginTop: "8px", marginBottom: 0 }}>
              {isBreathing
                ? "In for 4, hold for 2, out for 4."
                : "Press start and follow the movement."}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {!isBreathing ? (
              <button
                type="button"
                onClick={startBreathingExercise}
                className="primary-button"
              >
                Start breathing
              </button>
            ) : (
              <button
                type="button"
                onClick={stopBreathingExercise}
                className="secondary-button"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-card">
        <h2 style={{ textAlign: "center" }}>You may want to hear this</h2>
        <p className="helper-text" style={{ textAlign: "center" }}>
          Tap the card whenever you want to see something gentler.
        </p>

        <button
          type="button"
          onClick={showRandomMessage}
          className="sub-card"
          style={{
            width: "70%",
            margin: "0 auto",
            display: "block",
            textAlign: "center",
            cursor: "pointer",
            border: "none",
          }}
        >
          <p style={{ margin: 0 }}>
            {isCardFlipped ? currentMessage : <strong>You may want to hear this</strong>}
          </p>
        </button>
      </div>

      <div className="page-card">
        <h2 style={{ textAlign: "center" }}>Calming music</h2>
        <p className="helper-text" style={{ textAlign: "center" }}>
          Play something gentle if you want the page to feel quieter for a few
          minutes.
        </p>

        <div className="stack-list">
          {calmingTracks.map((track) => (
            <div
              key={track.title}
              className="sub-card"
              style={{ textAlign: "center" }}
            >
              <a href={track.url} target="_blank" rel="noreferrer">
                {track.title}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="page-card">
        <h3 style={{ marginBottom: "10px" }}>Need urgent support?</h3>
        <p className="helper-text" style={{ marginBottom: "14px" }}>
          If things feel too heavy right now, please reach out.
        </p>

        <p>
          <strong>Are you or anyone around you in immediate danger?</strong>{" "}
          Call <a href="tel:999">999</a> or go to A&amp;E now.
        </p>
        <p>
          <strong>
            Do you need urgent mental health help, but it is not an emergency?
          </strong>{" "}
          Call <a href="tel:111">111</a> and choose the mental health option.
        </p>
        <p>
          <strong>Do you want to talk to someone right now?</strong> Call
          Samaritans on <a href="tel:116123">116 123</a>.
        </p>
        <p>
          <strong>Would texting feel easier than calling?</strong> Text SHOUT to
          <a href="sms:85258" style={{ marginLeft: "4px" }}>
            85258
          </a>.
        </p>
        <p>
          <strong>Are you under 19 and need someone to talk to?</strong> Call
          Childline on <a href="tel:08001111">0800 1111</a>.
        </p>
      </div>
    </div>
  );
}