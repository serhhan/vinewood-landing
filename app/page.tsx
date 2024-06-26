"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import TypewriterComponent from "typewriter-effect";
import Draggable from "react-draggable";
import { Solitaire } from "@/components/solitaire/solitaire";

const App = () => {
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [showSolitaire, setShowSolitaire] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [lineFinished, setLineFinished] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [lastTap, setLastTap] = useState(0);

  const lines = [
    "Merhaba Vinewood Topluluğu!",
    "Uzun bir aradan sonra tekrar sizlerle buluşmanın mutluluğunu yaşıyoruz.",
    "2018'den bu yana hem topluluk hem de yöneticiler olarak bir süre ara vermiştik ve SAMP platformu ile birlikte Vinewood'un kapılarını kapatmıştık.",
    "Bugün, içinde bulunduğumuz şartlar ve GTA:V platformunda oynayan arkadaşlarımızın söylemleri ve deneyimleri, bizi tekrar bu platformda aktif olmaya teşvik etti.",
    "Vinewood topluluk yöneticileri olarak, sizlere sadece bir oyuncu kitlesi olmanın ötesinde, gerçek bir topluluk olma fırsatı sunuyoruz.",
    "Açık sözlülük, samimiyet ve anlayış mottosuyla ilerleyen yöneticiler olarak, tekrar aktif olmayı ve sokakları doldurmayı sabırsızlıkla bekliyoruz.",
    "Bu süreçte temel amacımız, sizin fikir ve düşüncelerinizle birlikte, Vinewood'u ve topluluğumuzu sürekli geliştirerek ve yenilikler ekleyerek yükselen bir değer haline getirmektir.",
    "Hep birlikte çalışarak, topluluğumuzu daha da ileriye taşıyacağız.",
    "Sevgilerle.",
  ];

  const handleSingleClick = (buttonId) => {
    setSelectedButton(buttonId === selectedButton ? null : buttonId);
  };

  const handleDoubleClick = (buttonId) => {
    if (buttonId === 1) {
      setShowTypewriter(true);
    } else if (buttonId === 2) {
      window.open("https://discord.gg/vinewood-v", "_blank");
    } else if (buttonId === 3) {
      setShowSolitaire(true);
    }
  };

  const handleInput = useCallback(
    (event) => {
      if (waitingForInput && lineFinished) {
        setWaitingForInput(false);
        setLineFinished(false);
        setCurrentStep((prevStep) => prevStep + 1);
      }
    },
    [waitingForInput, lineFinished]
  );

  useEffect(() => {
    if (showTypewriter && currentStep < lines.length) {
      window.addEventListener("keydown", handleInput);
      window.addEventListener("click", handleInput);
    } else {
      window.removeEventListener("keydown", handleInput);
      window.removeEventListener("click", handleInput);
    }
  }, [showTypewriter, currentStep, handleInput]);

  const waitForInput = () => {
    return new Promise((resolve) => {
      const handler = () => {
        window.removeEventListener("keydown", handler);
        window.removeEventListener("click", handler);
        resolve("");
      };
      window.addEventListener("keydown", handler);
      window.addEventListener("click", handler);
      setWaitingForInput(true);
    });
  };

  const handleTyping = (typewriter, line, startTime) => {
    return new Promise((resolve) => {
      typewriter
        .changeDelay(20)
        .typeString(line + "\n\n")
        .callFunction(() => {
          setLineFinished(true);
          resolve("");
        })
        .start();
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const buttons = document.querySelectorAll(".draggable-button");
      let clickedInside = false;
      buttons.forEach((button) => {
        if (button.contains(event.target)) {
          clickedInside = true;
        }
      });
      if (!clickedInside) {
        setSelectedButton(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleTouch = (buttonId, event) => {
    console.log(event);
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
      handleDoubleClick(buttonId);
    } else {
      handleSingleClick(buttonId);
    }
    setLastTap(currentTime);
    event.preventDefault();
  };

  const d = new Date();
  const hours = d.getHours();
  const minutes = d.getMinutes();

  return (
    <div className="relative overflow-hidden whitespace-pre-wrap flex justify-center font-sans-serif">
      <div className="fixed bottom-[2%] right-[1%]">
        <svg
          width="338"
          height="75"
          viewBox="0 0 338 75"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[80px]"
        >
          <path
            d="M43.3687 9.55908L31.2896 74.541H12.7168L0.683105 9.55908H14.5332L21.9805 52.9712L29.4277 9.55908H43.3687ZM59.7163 66.2764H45.7754V1.1582H59.7163V66.2764ZM104.4 71.771H90.459L81.1499 45.8418V71.771H67.209V6.74365H81.1499L90.459 32.8091V6.74365H104.4V71.771ZM144.452 72.6792H111.893V7.69727H144.452V21.6382H125.833V33.2632H144.452V47.2041H125.833V58.8291H144.452V72.6792ZM208.208 8.60547L196.128 73.6328H181.234L177.51 52.063L173.787 73.6328H158.938L146.904 8.60547H160.754L168.201 44.6157L173.787 8.60547H181.234L186.819 44.6157L194.267 8.60547H208.208ZM233.773 51.3818V14.1909H224.464V51.3818H233.773ZM247.714 56.0591L238.405 65.3682H219.833L210.523 56.0591V9.55908L219.833 0.25H238.405L247.714 9.55908V56.0591ZM278.457 51.3818V14.1909H269.148V51.3818H278.457ZM292.398 56.0591L283.089 65.3682H264.516L255.207 56.0591V9.55908L264.516 0.25H283.089L292.398 9.55908V56.0591ZM323.141 56.9673V19.7764H313.832V56.9673H323.141ZM337.082 61.6445L327.772 70.8174H299.891V5.83545H327.772L337.082 15.1445V61.6445Z"
            fill="white"
          />
        </svg>
      </div>
      <div className="w-full h-screen overflow-hidden p-8 flex flex-col items-start gap-4">
        <Draggable>
          <button
            onClick={() => handleSingleClick(1)}
            onDoubleClick={() => handleDoubleClick(1)}
            onTouchEnd={(e) => handleTouch(1, e)}
            className={`cursor-pointer text-white w-[70px] h-[80px] flex flex-col items-center justify-center font-sans-serif text-[12px] gap-2 draggable-button ${
              selectedButton === 1 ? "bg-blue-500 text-white" : ""
            }`}
          >
            <Image
              src={"/notepad.png"}
              width={100}
              height={100}
              alt="notepad"
              className="h-[40px] w-[40px]"
              onMouseDown={(e) => e.preventDefault()}
            />
            <span>Vinewood</span>
          </button>
        </Draggable>
        <Draggable>
          <button
            onClick={() => handleSingleClick(2)}
            onDoubleClick={() => handleDoubleClick(2)}
            onTouchEnd={(e) => handleTouch(2, e)}
            className={`text-white w-[70px] h-[80px] flex flex-col items-center justify-center font-sans-serif text-[12px] gap-2 cursor-pointer draggable-button ${
              selectedButton === 2 ? "bg-blue-500 text-white" : ""
            }`}
          >
            <Image
              src={"/discord.png"}
              width={100}
              height={100}
              alt="notepad"
              className="h-[40px] w-[40px]"
              onMouseDown={(e) => e.preventDefault()}
            />
            <span>Discord</span>
          </button>
        </Draggable>
        <Draggable>
          <button
            onClick={() => handleSingleClick(3)}
            onDoubleClick={() => handleDoubleClick(3)}
            onTouchEnd={(e) => handleTouch(3, e)}
            className={` flex cursor-pointer text-white w-[70px] h-[80px] flex-col items-center justify-center font-sans-serif text-[12px] gap-2 draggable-button ${
              selectedButton === 3 ? "bg-blue-500 text-white" : ""
            }`}
          >
            <Image
              src={"/solitaireIcon.png"}
              width={100}
              height={100}
              alt="notepad"
              className="h-[34px] w-[40px]"
              onMouseDown={(e) => e.preventDefault()}
            />
            <span>Solitaire</span>
          </button>
        </Draggable>
      </div>
      {showTypewriter && (
        <Draggable>
          <div className="absolute top-0 left-0 h-full p-8 max-w-[1280px] w-full">
            <div className="window active">
              <div className="window-toolbar flex items-center gap-1">
                <Image
                  src={"/notepad.png"}
                  width={100}
                  height={100}
                  alt="notepad"
                  className="h-[18px] w-[18px]"
                />
                <div className="window-title">Vinewood GTA5 - Notepad</div>
                <div className="window-buttons">
                  <div
                    className="window-button close cursor-pointer"
                    onClick={() => setShowTypewriter(false)}
                  />
                  <div className="window-button help"></div>
                </div>
              </div>
              <div className="window-wrapper h-full">
                <div className="flex gap-3 text-black">
                  <span>
                    <u>F</u>ile
                  </span>
                  <span>
                    <u>E</u>dit
                  </span>
                  <span>
                    <u>S</u>earch
                  </span>
                  <span>
                    <u>H</u>elp
                  </span>
                </div>

                <div className="window-content bg-white text-black font-sans-serif mb-2">
                  <TypewriterComponent
                    onInit={async (typewriter) => {
                      for (let i = 0; i < lines.length; i++) {
                        setLineFinished(false);
                        await handleTyping(typewriter, lines[i], i);
                        await waitForInput();
                        typewriter.stop();
                      }
                    }}
                  />
                  {waitingForInput && (
                    <div className="animate-pulse">
                      Devamını görmek için bir tuşa basın.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Draggable>
      )}
      {showSolitaire && (
        <Draggable>
          <div className="absolute top-0 left-0 h-full p-8 max-w-[1280px] w-full">
            <Solitaire close={() => setShowSolitaire(false)} />
          </div>
        </Draggable>
      )}

      <div id="toolbar">
        <div className="toolbar-start-menu">
          <button className="start-button text-black">Başla</button>
        </div>
        <div className="toolbar-separator"></div>

        <div className="toolbar-left">
          <button className="toolbar-icon ie"></button>
          <button className="toolbar-icon outlook"></button>
          <button className="toolbar-icon desktop"></button>
          <button className="toolbar-icon channels"></button>
        </div>
        <div className="toolbar-right">
          <div className="time text-black">
            <span className="hour"> {hours <= 9 ? "0" + hours : hours}</span>:
            <span className="minutes">
              {minutes <= 9 ? "0" + minutes : minutes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
