import millify from "millify";
import Avatar from "./components/Avatar";
import Frame from "react-frame-component";
import useMeasure from "react-use-measure";
import { useEffect, useState } from "react";
import { CheckCircle, CopySimple } from "phosphor-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useAddressInfo } from "./context/AddressInfoContext";

function App(): JSX.Element {
  const {
    ens,
    NFTs,
    status,
    address,
    balance,
    isContract,
    usdBalance,
    previewNames,
    setIsHovering,
    previewImages,
    modalPosition,
    transactionCount,
    showLargePreview,
  } = useAddressInfo();

  const [copied, setCopied] = useState(false);
  const toggleCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const [containerRef, bounds] = useMeasure();
  const [frameHeight, setFrameHeight] = useState(0);

  useEffect(() => {
    setFrameHeight(bounds.height);
    const container = document.getElementById("web3-hovercard-modal");
    if (!container) return;
    // Container position has been set to absolute already
    container.style.width = bounds.width + "px";
    container.style.height = bounds.height + "px";
    container.style.left = modalPosition.left + "px";
    container.style.top = !modalPosition.useBottom
      ? modalPosition.top + "px"
      : modalPosition.bottom + "px";
    container.style.transform = `translate(0%, ${
      modalPosition.useBottom ? -100 : 0
    }%)`;
  }, [bounds.width, bounds.height, modalPosition]);

  return (
    <Frame
      id="web3-hovercard-frame"
      width={"305px"}
      height={frameHeight + "px"}
      style={{
        margin: 0,
        padding: 0,
        border: "none",
        colorScheme: "none",
        borderRadius: "12px",
        position: "absolute",
        boxShadow:
          frameHeight > 0
            ? "rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px"
            : "none",
      }}
      head={[
        <meta key={"web3-hovercard-charSet"} charSet="utf-8" />,
        <link
          rel="stylesheet"
          key={"web3-hovercard-css"}
          href={chrome.runtime.getURL("styles/web3-hovercard.css")}
        />,
      ]}
    >
      <>
        {status.balance === "success" &&
        status.isContract === "success" &&
        status.transactionCount === "success" ? (
          <div
            ref={containerRef}
            className="web3-hovercard"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="web3-hovercard__header">
              <Avatar />
              <div className="web3-hovercard__header-text">
                <CopyToClipboard text={address} onCopy={toggleCopied}>
                  <div className="web3-hovercard__header-text--row address">
                    <p className="main address">
                      {address.substring(0, 8)}...
                      {address.substring(address.length - 8, address.length)}
                    </p>
                    {copied ? (
                      <CheckCircle size={13} weight="fill" color="#3ea845" />
                    ) : (
                      <CopySimple size={13} weight="bold" />
                    )}
                  </div>
                </CopyToClipboard>

                <div className="web3-hovercard__header-text--row margin">
                  <p className="main ens">
                    {status.ens === "loading" ? (
                      <span className="normal">Resolving ENS...</span>
                    ) : status.ens === "failed" ||
                      (status.ens === "success" && !ens) ? (
                      <span className="normal">No ENS name found</span>
                    ) : (
                      <>
                        <span className="sub">ENS</span> • {ens}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="web3-hovercard__details">
              <div className="web3-hovercard__details-stats">
                <div className="web3-hovercard__details-stats--item">
                  <p className="main">
                    {balance
                      ? millify(Number(balance), {
                          precision: 4,
                          lowercase: true,
                        })
                      : 0}
                    {" ETH"}
                  </p>
                  <p className="sub">
                    {"$"}
                    {millify(usdBalance, {
                      precision: 2,
                      lowercase: true,
                    })}
                    {" USD"}
                  </p>
                </div>
                <div className="web3-hovercard__details-stats--item">
                  <p className="main">
                    {transactionCount
                      ? millify(Number(transactionCount), {
                          precision: 2,
                          lowercase: true,
                        })
                      : 0}
                  </p>
                  <p className="sub">Transactions</p>
                </div>
                <div className="web3-hovercard__details-stats--item">
                  <p className="main">{isContract ? "Contract" : "EOA"}</p>
                  <p className="sub">Type</p>
                </div>
              </div>

              {NFTs.length > 0 && (
                <div className="web3-hovercard__details-nfts">
                  {showLargePreview && previewImages.length > 0 && (
                    <div className="web3-hovercard__details-nfts__preview">
                      {previewImages?.map((nft, index) => {
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              window.open(
                                "https://opensea.io/assets/ethereum/" +
                                  nft?.contract +
                                  "/" +
                                  nft?.tokenId,
                                "_blank"
                              );
                            }}
                          >
                            <div className="overlay" />
                            <img
                              src={nft?.image}
                              alt="NFT thumbnail"
                              onError={e => {
                                // hide image if it fails to load
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="web3-hovercard__details-nfts__info">
                    {!showLargePreview && previewImages?.length > 0 && (
                      <div className="web3-hovercard__details-nfts__info-preview">
                        {previewImages?.map((nft, index) => {
                          return (
                            <img
                              key={index}
                              src={nft?.image}
                              alt="NFT thumbnail"
                              onError={e => {
                                // hide image if it fails to load
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                    <p className="web3-hovercard__details-nfts__info-text">
                      {previewNames?.length > 0 ? (
                        <>
                          {`${previewNames[0]}, ${
                            previewNames[0]?.length < 27 ? previewNames[1] : ""
                          }`}
                          {NFTs.length > previewNames.length &&
                            ` and ${
                              NFTs.length -
                              (previewNames[0]?.length < 27 ? 2 : 1)
                            } other NFT${
                              NFTs.length -
                                (previewNames[0]?.length < 27 ? 2 : 1) >
                              1
                                ? "s"
                                : ""
                            }`}
                        </>
                      ) : (
                        <>
                          This address has a total of {NFTs.length} NFT
                          {NFTs.length > 1 ? "s" : ""}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <></>
        )}
      </>
    </Frame>
  );
}

export default App;
