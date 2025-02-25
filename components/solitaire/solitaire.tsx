import React, { useState } from "react";
import { spriteImg } from "./sprite"; // Ensure spriteImg is a valid image URL or import
import Image from "next/image";

export const Solitaire = ({ close }) => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const startGame = () => {
    setIsGameStarted(true);
    const gameEl = document.getElementById("js-solitaire");
    const dealPileEl = document.getElementById("js-deck-pile");
    const dealEl = document.getElementById("js-deck-deal");
    const finishContainerEl = document.getElementById("js-finish");
    const deskContainerEl = document.getElementById("js-board");
    const deckPileEl = document.getElementById("js-deck-pile");
    const resetEl = document.getElementById("js-reset");

    const cardWidth = 71;
    const cardHeight = 96;
    const state = {
      types: ["c", "d", "h", "s"],
      colors: { c: 0, d: 1, h: 1, s: 0 },
      cards: [],
      deal: {
        pile: { el: null, cards: [] },
        deal: { el: null, cards: [] },
      },
      finish: [],
      desk: [],
      target: null,
      moving: {
        card: {},
        element: null,
        index: -1,
        capture: false,
        container: { cards: [] },
        target: null,
        origin: {},
        offset: { x: 0, y: 0 },
        destinations: [],
      },
    };

    const getCard = (index) => state.cards[index];
    const faceUp = (card) => {
      state.cards[card].facingUp = true;
      requestAnimationFrame(() => {
        state.cards[card].el.classList.add("card--front");
        state.cards[card].el.classList.remove("card--back");
      });
    };
    const faceDown = (card) => {
      state.cards[card].facingUp = false;
      state.cards[card].el.classList.remove("card--front");
      state.cards[card].el.classList.add("card--back");
    };
    const faceUpLastOnDesk = (index) => {
      const card = getLastOnDesk(index);
      if (card !== null) faceUp(card);
    };
    const appendToCard = (target, card) => {
      state.cards[target].el.appendChild(state.cards[card].el);
    };
    const appendToDesk = (desk, card) => {
      state.desk[desk].el.appendChild(state.cards[card].el);
    };
    const getLastOnDesk = (desk) => {
      const l = state.desk[desk].cards.length;
      if (l > 0) return state.desk[desk].cards[l - 1];
      return null;
    };
    const getLastOnPile = (pile, index) => {
      const l = state[pile][index].cards.length;
      if (l > 0) return state.cards[state[pile][index].cards[l - 1]];
      return {};
    };
    const getCardLocation = (card) => {
      for (let i = 0; i < 7; i++) {
        const index = state.desk[i].cards.indexOf(card);
        if (index > -1) {
          return { location: "desk", pile: i, index: index };
        }
      }
      for (let i = 0; i < 4; i++) {
        const index = state.finish[i].cards.indexOf(card);
        if (index > -1) {
          return { location: "finish", pile: i, index: index };
        }
      }
      for (let i of ["deal", "pile"]) {
        const index = state.deal[i].cards.indexOf(card);
        if (index > -1) {
          return { location: "deal", pile: i, index: index };
        }
      }
    };
    const getSubCards = (card) => {
      const { location, pile, index } = getCardLocation(card);
      return state[location][pile].cards.filter(
        (elem, i, array) => array.indexOf(elem) > index
      );
    };
    const getPile = (pile, index) => state[pile][index];
    const moveCardTo = (dest, i, card) => {
      const { location, pile, index } = getCardLocation(card);
      const moving = state[location][pile].cards.filter(
        (elem, i, array) => array.indexOf(elem) >= index
      );
      state[location][pile].cards = state[location][pile].cards.filter(
        (elem, i, array) => moving.indexOf(elem) === -1
      );
      state[dest][i].cards = state[dest][i].cards.concat(moving);
    };
    const canBePlacedOnCard = (child, parent) => {
      const { type, number } = getCard(child);
      const { type: parentType, number: parentNumber } = getCard(parent);
      return (
        parentNumber - 1 === number &&
        state.colors[parentType] !== state.colors[type]
      );
    };
    const placeCardTo = (dest, index, card) => {
      state[dest][index].cards.push(card);
      state.deal.pile.cards.splice(state.deal.pile.cards.indexOf(card), 1);
    };
    function dealCards() {
      let card = 0;
      for (let i = 0; i < 7; i++) {
        for (let j = i; j < 7; j++) {
          const last = getLastOnDesk(j);
          if (last !== null) {
            appendToCard(last, card);
          } else {
            appendToDesk(j, card);
          }
          placeCardTo("desk", j, card);
          if (j === i) faceUp(card);
          card++;
        }
      }
    }
    function resetGame() {
      for (let i = 0; i < 7; i++) state.desk[i].cards = [];
      for (let i = 0; i < 4; i++) state.finish[i].cards = [];
      state.deal.pile.cards = [];
      state.deal.deal.cards = [];
      state.cards.sort(() => (Math.random() < 0.5 ? -1 : 1));
      requestAnimationFrame(() => {
        for (let i = 0, l = state.cards.length; i < l; i++) {
          const { facingUp, el } = state.cards[i];
          state.deal.pile.cards.push(i);
          el.onmousedown = captureMove(i);
          el.onmouseup = releaseMove;
          el.onclick = handleClick(i);
          if (facingUp) faceDown(i);
          dealPileEl.appendChild(el);
        }
        dealCards();
      });
    }
    const handleClick = (index) => (event) => {
      event.stopPropagation();
      const { el, facingUp } = getCard(index);
      if (state.moving.capture) return;
      releaseMove("");
      if (facingUp) {
        const { location, pile } = getCardLocation(index);
        if (location === "deal" && pile === "deal") {
          const { el: lastEl } = getLastOnPile("deal", "deal");
          if (el !== lastEl) return;
        }
        const destinations = getAvailableDestinations(index, true);
        if (destinations.length > 0) {
          const { target, el: targetEl } = destinations[0];
          const {
            dest: destTarget,
            pile: pileTarget,
            card: cardTarget,
          } = target;
          moveCardTo(destTarget, pileTarget, cardTarget);
          if (location === "desk") faceUpLastOnDesk(pile);
          targetEl.appendChild(el);
        } else {
          return;
        }
        gameFinish();
      } else {
        const { location, pile } = getCardLocation(index);
        if (location === "deal" && pile === "pile") {
          const max = state.deal.pile.cards.length - 1;
          const min = Math.max(-1, max - 3);
          for (let i = max; i > min; i--) {
            const card = state.deal.pile.cards[i];
            const { el } = getCard(card);
            faceUp(card);
            moveCardTo("deal", "deal", card);
            dealEl.appendChild(el);
          }
        }
      }
    };
    function restartDeal() {
      state.deal.pile.cards = state.deal.deal.cards;
      state.deal.deal.cards = [];
      for (const card of state.deal.pile.cards) {
        const { el } = getCard(card);
        faceDown(card);
        deckPileEl.appendChild(el);
      }
    }
    function getMousePosition(event) {
      return { x: event.pageX, y: event.pageY };
    }
    const handleMove = (event) => {
      if (state.moving.capture) {
        const el = state.moving.element;
        const { x, y } = getMousePosition(event);
        el.style.left = `${x - state.moving.offset.x}px`;
        el.style.top = `${y - state.moving.offset.y}px`;
      }
    };
    const startMovingPosition = (event) => {
      const el = state.moving.element;
      const { x, y } = getMousePosition(event);
      const { top, left } = el.getBoundingClientRect();
      el.classList.add("card--moving");
      state.moving.offset = { x: x - left, y: y - top };
      el.style.left = `${x - state.moving.offset.x}px`;
      el.style.top = `${y - state.moving.offset.y - 5}px`;
    };
    let moving;
    const captureMove = (index) => (event) => {
      event.preventDefault();
      event.stopPropagation();
      const { el, facingUp } = getCard(index);
      if (facingUp) {
        const { location, pile } = getCardLocation(index);
        if (location === "deal" && pile === "deal") {
          const { el: lastEl } = getLastOnPile("deal", "deal");
          if (el !== lastEl) return false;
        }
        moving = setTimeout(() => {
          state.moving.element = event.target;
          state.moving.capture = true;
          state.moving.index = index;
          state.moving.card = getCard(index);
          state.moving.origin = getCardLocation(index);
          startMovingPosition(event);
          const destinations = getAvailableDestinations(index);
          state.moving.destinations = destinations;
          for (const dest of destinations) dest.el.classList.add("finish-dest");
          for (let i = 0, l = destinations.length; i < l; i++) {
            const { top, left, width, height } =
              destinations[i].el.getBoundingClientRect();
            state.moving.destinations[i].offset = {
              top: top,
              left: left,
              width: width,
              height: height,
            };
          }
        }, 200);
      }
    };
    const dropCard = (x, y) => {
      for (const destination of state.moving.destinations) {
        const { width, height, left, top } = destination.offset;
        destination.el.classList.remove("finish-dest");
        if (x > left && x < left + width && y > top && y < top + height) {
          const { dest, pile, card } = destination.target;
          moveCardTo(dest, pile, card);
          destination.el.appendChild(state.moving.element);
          gameFinish();
          const { location: originLocation, pile: originPile } =
            state.moving.origin;
          if (originLocation === "desk") faceUpLastOnDesk(originPile);
        }
      }
    };
    let release;
    const releaseMove = (event) => {
      clearTimeout(moving);
      clearTimeout(release);
      if (state.moving.capture) {
        release = setTimeout(() => {
          const { x, y } = getMousePosition(event);
          requestAnimationFrame(() => {
            dropCard(x, y);
            state.moving.element.classList.remove("card--moving");
            state.moving.element.style.left = "";
            state.moving.element.style.top = "";
            state.moving.element = null;
            state.moving.capture = false;
          });
        }, 100);
      }
    };
    const getAvailableDestinations = (index, first = false) => {
      const { type, number } = getCard(index);
      const destinations = [];
      if (number === 1) {
        for (let i = 0; i < 4; i++) {
          const { cards, el } = getPile("finish", i);
          if (cards.length === 0) {
            destinations.push({
              el: el,
              target: { dest: "finish", pile: i, card: index },
            });
            if (first) return destinations;
          }
        }
      }
      const subCards = getSubCards(index);
      if (!subCards.length > 0) {
        for (let i = 0; i < 4; i++) {
          const l = state.finish[i].cards.length;
          if (l + 1 === number) {
            const { type: lastType } = getLastOnPile("finish", i);
            if (lastType === type) {
              destinations.push({
                el: state.finish[i].el,
                target: { dest: "finish", pile: i, card: index },
              });
              if (first) return destinations;
              break;
            }
          }
        }
      }
      for (let i = 0; i < 7; i++) {
        const last = getLastOnDesk(i);
        if (last !== null) {
          if (canBePlacedOnCard(index, last)) {
            destinations.push({
              el: state.cards[last].el,
              target: { dest: "desk", pile: i, card: index },
            });
            if (first) return destinations;
          }
        } else {
          if (number === 13) {
            destinations.push({
              el: state.desk[i].el,
              target: { dest: "desk", pile: i, card: index },
            });
            if (first) return destinations;
          }
        }
      }
      return destinations;
    };
    const gameFinish = () => {
      for (let i = 3; i >= 0; i--) {
        const l = state.finish[i].cards.length;
        if (l < 13) return;
      }
      const { width, height, left, top } = gameEl.getBoundingClientRect();
      win(width, height, left, top);
    };
    window.win = () => {
      const { width, height, left, top } = gameEl.getBoundingClientRect();
      win(width, height, left, top);
    };
    const win = (canvasWidth, canvasHeight, canvasLeft, canvasTop) => {
      const image = document.createElement("img");
      image.src = spriteImg;
      const canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      gameEl.appendChild(canvas);
      const context = canvas.getContext("2d");
      let card = 52;
      const particles = [];
      const drawCard = (x, y, spriteX, spriteY) => {
        context.drawImage(
          image,
          spriteX,
          spriteY,
          cardWidth,
          cardHeight,
          x,
          y,
          cardWidth,
          cardHeight
        );
      };
      const Particle = function (id, x, y, sx, sy) {
        if (sx === 0) sx = 2;
        const spriteX = (id % 4) * cardWidth;
        const spriteY = Math.floor(id / 4) * cardHeight;
        drawCard(x, y, spriteX, spriteY);
        this.update = () => {
          x += sx;
          y += sy;
          if (x < -cardWidth || x > canvas.width + cardWidth) {
            const index = particles.indexOf(this);
            particles.splice(index, 1);
            return false;
          }
          if (y > canvas.height - cardHeight) {
            y = canvas.height - cardHeight;
            sy = -sy * 0.85;
          }
          sy += 0.98;
          drawCard(Math.floor(x), Math.floor(y), spriteX, spriteY);
          return true;
        };
      };
      const throwCard = (x, y) => {
        if (card < 1) return;
        card--;
        const particle = new Particle(
          card,
          x,
          y,
          Math.floor(Math.random() * 6 - 3) * 2,
          -Math.random() * 16
        );
        particles.push(particle);
      };
      let throwInterval = [];
      for (let i = 0; i < 4; i++) {
        const { left, top } = state.finish[i].el.getBoundingClientRect();
        throwInterval[i] = setInterval(function () {
          throwCard(left - canvasLeft, top - canvasTop);
        }, 1000);
      }
      const updateInterval = setInterval(function () {
        let i = 0,
          l = particles.length;
        while (i < l) {
          particles[i].update() ? i++ : l--;
        }
      }, 1000 / 60);
      function removeAnimation(event) {
        event.preventDefault();
        clearInterval(updateInterval);
        for (let i = 0; i < 4; i++) {
          clearInterval(throwInterval[i]);
        }
        canvas.parentNode.removeChild(canvas);
        document.removeEventListener("click", removeAnimation);
      }
      document.addEventListener("click", removeAnimation, false);
    };
    function initSolitaire() {
      const css = document.createElement("style");
      const styles = `.card--front { background-image: url("${spriteImg}"); }`;
      css.appendChild(document.createTextNode(styles));
      document.head.appendChild(css);
      for (let i = 0; i < 4; i++) {
        for (let j = 1; j <= 13; j++) {
          const el = document.createElement("div");
          el.classList.add(
            "card",
            `card--${state.types[i]}-${j}`,
            "card--back"
          );
          state.cards.push({
            el: el,
            type: state.types[i],
            number: j,
            facingUp: false,
          });
        }
      }
      for (let i = 0; i < 4; i++) {
        const el = document.createElement("div");
        el.classList.add("aces", `aces--${i}`);
        state.finish.push({ el: el, cards: [] });
        finishContainerEl.appendChild(el);
      }
      for (let i = 0; i < 7; i++) {
        const el = document.createElement("div");
        el.classList.add("seven", `seven--${i}`);
        state.desk.push({ el: el, cards: [] });
        deskContainerEl.appendChild(el);
      }
      dealPileEl.onclick = restartDeal;
      resetEl.onclick = resetGame;
      window.onmousemove = handleMove;
      window.onmouseup = releaseMove;
      resetGame();
    }
    initSolitaire();
  };

  return (
    <div className="window window_solitaire font-sans-serif ridge-border ">
      <div className="window_solitaire__inner">
        <div className="window_solitaire__heading ">
          <div className="window-wrapper h-full">
            <div className=" flex items-center gap-1">
              <Image
                src={"/solitaireIcon.png"}
                width={100}
                height={100}
                alt="notepad"
                className="h-[18px] w-[18px]"
              />
              <div className="window-title">Solitaire</div>
              <div className="window-buttons">
                <div
                  className="window-button close cursor-pointer"
                  onClick={() => close()}
                />
                <div className="window-button help"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="window_solitaire__actions flex gap-4 text-xs font-sans-serif p-1">
        {!isGameStarted && (
          <button
            type="button"
            id="js-start"
            className="start-game"
            onClick={startGame}
          >
            <u>B</u>aşlat
          </button>
        )}
        <button
          type="button"
          id="js-reset"
          className={`new-game ${isGameStarted ? "" : "hidden"}`}
        >
          <u>Y</u>eni Oyun
        </button>
      </div>
      <div className="window_solitaire__content">
        <div className="window_solitaire__content-inner">
          <div
            className="solitaire flex flex-col gap-8 p-4 relative"
            id="js-solitaire"
          >
            <div id="js-finish" className="finish-deck ml-auto"></div>
            <div id="js-board" className="board-deck"></div>
            <div className="deck absolute">
              <div id="js-deck-pile" className="deck__pile"></div>
              <div id="js-deck-deal" className="deck__deal"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
