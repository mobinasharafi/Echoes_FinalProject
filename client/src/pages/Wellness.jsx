// Gives users a calmer page with supportive messages, crisis help, and gentle music

import { useEffect, useRef, useState } from "react";

const comfortMessages = [
  "You are loved.",
  "Your existence makes people's days better.",
  "It is not too late for things to get softer.",
  "You do not need to carry everything at once.",
  "A bad night is not the same as a bad life.",
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

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) {
        clearTimeout(flipTimerRef.current);
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
        <h3 style={{ marginBottom: "10px" }}>Need urgent support?</h3>
        <p className="helper-text" style={{ marginBottom: "14px" }}>
          If things feel too heavy right now, please reach out.
        </p>

        <p>
          <strong>Are you or anyone around you in immediate danger?</strong>{" "}
          Call 999 or go to A&amp;E now.
        </p>
        <p>
          <strong>
            Do you need urgent mental health help, but it is not an emergency?
          </strong>{" "}
          Call 111 and choose the mental health option.
        </p>
        <p>
          <strong>Do you want to talk to someone right now?</strong> Call
          Samaritans on 116 123.
        </p>
        <p>
          <strong>Would texting feel easier than calling?</strong> Text SHOUT to
          85258.
        </p>
        <p>
          <strong>Are you under 19 and need someone to talk to?</strong> Call
          Childline on 0800 1111.
        </p>
      </div>

      <div className="page-card">
        <h2>You may want to hear this</h2>
        <p className="helper-text">
          Tap the card whenever you want to see something gentler.
        </p>

        <button
          type="button"
          onClick={showRandomMessage}
          className="sub-card"
          style={{
            width: "100%",
            textAlign: "left",
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
        <h2>Calming music</h2>
        <p className="helper-text">
          Play something gentle if you want the page to feel quieter for a few
          minutes.
        </p>

        <div className="stack-list">
          {calmingTracks.map((track) => (
            <div key={track.title} className="sub-card">
              <a href={track.url} target="_blank" rel="noreferrer">
                {track.title}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}