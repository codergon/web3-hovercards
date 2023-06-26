import "./styles/main.scss";
import { useEffect, useMemo, useState } from "react";
import Icons from "./components/Icons";
import useModal from "./hooks/useModal";
import { HexColorPicker } from "react-colorful";
import { CheckCircle, Copy, Eyedropper } from "phosphor-react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useRecoilState } from "recoil";
import {
  highlightAtom,
  highlightColorAtom,
  largePreviewAtom,
  showHovercardsAtom,
} from "./store/appState";
import ntc from "./lib/ntc";
import chroma from "chroma-js";
import { isColorDark } from "./helpers/color";

const Popup = () => {
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [color, setColor] = useState("#FFC0CB");
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [highlight, setHighlight] = useRecoilState(highlightAtom);
  const [largePreview, setLargePreview] = useRecoilState(largePreviewAtom);
  const [showHovercards, setShowHovercards] =
    useRecoilState(showHovercardsAtom);
  const [highlightColor, setHighlightColor] =
    useRecoilState(highlightColorAtom);

  const toggleCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleSwitch = (key: string) => {
    if (key === "highlight") setHighlight(p => !p);
    if (key === "largePreview") setLargePreview(p => !p);
    if (key === "showHovercards") setShowHovercards(p => !p);
  };

  useEffect(() => {
    if (loaded) return;
    setColor(highlightColor);
    setLoaded(true);
  }, [highlightColor]);

  const saveColor = () => {
    setHighlightColor(color);
    closeModal();
  };

  const colorName = useMemo(() => {
    const name = chroma.valid(color)
      ? ntc.name(chroma(color).hex())
      : "Unknown";
    return name;
  }, [color]);

  return (
    <div className="container">
      <div className="container-header">
        <div className="container-header-content">
          <div className="container-header__text">
            <h1>Web3 Hovercards</h1>
            <p>
              Get insights into Ethereum addresses and ENS names, including ETH
              and USD balance, associated NFTs, transaction count, and more
            </p>
          </div>
        </div>

        <div className="container-header-cards">
          <div className="card">
            <Icons.EthLogo size={22} />
          </div>
          <div className="card">
            <Icons.Dollar3d size={22} />
          </div>
          <div className="card">
            <Icons.Arrow3d size={20} />
          </div>
        </div>
      </div>

      <div className="container-body">
        <div className="container-body__header">
          <h2>Customize Your Preferences</h2>
        </div>

        <ul className="container-body__options">
          {[
            {
              main: "Display Hovercards",
              sub: "Show modal with address details",
              key: "showHovercards",
            },
            {
              main: "Large preview images",
              sub: "Use large images to preview NFTs",
              key: "largePreview",
            },
            {
              main: "Highlight addresses",
              sub: "Change address color on hover",
              key: "highlight",
            },
          ].map((item, index) => {
            return (
              <li key={index}>
                <div className="desc">
                  <p className="main">{item.main}</p>
                  <p className="sub">{item.sub}</p>
                </div>

                <div className="action-btns">
                  {item.key === "highlight" && (
                    <button
                      className="picker"
                      style={{
                        backgroundColor: highlightColor,
                      }}
                      onClick={() => openModal()}
                    >
                      <Eyedropper
                        size={12}
                        weight="regular"
                        color={isColorDark(highlightColor) ? "#FFF" : "#000"}
                      />
                    </button>
                  )}
                  <button
                    className="base-switch"
                    data-move={
                      (item.key === "highlight" && highlight) ||
                      (item.key === "largePreview" && largePreview) ||
                      (item.key === "showHovercards" && showHovercards)
                    }
                    onClick={() => toggleSwitch(item.key)}
                  >
                    <div className="base-switch-toggle" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="container-body__footer">
          <div className="socials">
            {[
              {
                name: "GitHub",
                href: "https://github.com/codergon/web3-hovercards",
              },
              {
                name: "Twitter",
                href: "https://twitter.com/thealpha_knight",
              },
            ].map((item, index) => {
              return (
                <a
                  key={index}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <p>{item.name}</p>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {isOpen && (
        <>
          <div className="app-modal-overlay" onClick={closeModal}></div>
          <div className="app-modal">
            <div className="color-picker">
              <HexColorPicker color={color} onChange={setColor} />

              <div className="color-picker__details">
                <div className="color-picker__details-preview">
                  <div className="color-picker__details-preview--block">
                    <div
                      className="color-picker__details-preview--block__box"
                      style={{
                        backgroundColor: color,
                      }}
                    />
                    <div className="color-picker__details-preview--block__info">
                      <h2>{colorName}</h2>
                      <p>{color}</p>
                    </div>
                  </div>

                  <CopyToClipboard text={color} onCopy={toggleCopied}>
                    <div className="color-picker__details-preview--copy-btn">
                      {copied ? (
                        <CheckCircle
                          size={16.5}
                          weight="fill"
                          color="#3ea845"
                        />
                      ) : (
                        <Copy size={15.4} weight="bold" />
                      )}
                    </div>
                  </CopyToClipboard>
                </div>

                <button
                  onClick={saveColor}
                  className="color-picker__details--submit-btn"
                >
                  Save color
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Popup;
