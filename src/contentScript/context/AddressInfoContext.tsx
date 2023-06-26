import React, {
  useMemo,
  useState,
  useEffect,
  useContext,
  createContext,
} from "react";
import Web3 from "web3";
import axios from "axios";
import { isAddress } from "web3-validator";
import { useNetworkState } from "react-use";
import { fixURL } from "../helpers/address";
import { avatars } from "../constants/avatar";
import { InfuraProvider } from "@ethersproject/providers";
import { INFURA_API_KEY, INFURA_API_KEY_SECRET } from "../constants/infura";
import chroma from "chroma-js";

const ensNameRegex = /[a-zA-Z0-9-]+\.eth\b/g;
const ethAddressRegex = /0x[a-fA-F0-9]{40}\b/g;
const ethAddressRegexText = /0x[a-fA-F0-9]{40}\b/g;
const validTags = [
  "div",
  "span",
  "p",
  "li",
  "em",
  "i",
  "b",
  "td",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "small",
  "button",
];

const Auth = btoa(INFURA_API_KEY + ":" + INFURA_API_KEY_SECRET);

const web3 = new Web3(`https://mainnet.infura.io/v3/${INFURA_API_KEY}`);

interface AddressInfoProviderProps {
  children: React.ReactElement | React.ReactElement[];
}

interface AddressInfo {
  ens: string;
  NFTs: any[];
  balance: string;
  isContract: boolean;
  transactionCount: string;
}

interface AddressInfoContextProps {
  ens: string;
  NFTs: any[];
  avatar: string;
  address: string;
  balance: string;
  usdBalance: number;
  isContract: boolean;
  previewImages: any[];
  previewNames: string[];
  transactionCount: string;
  showLargePreview: boolean;
  setIsHovering: React.Dispatch<React.SetStateAction<boolean>>;
  modalPosition: {
    top: number;
    left: number;
    bottom: number;
    useBottom: boolean;
  };
  status: {
    ens: string;
    balance: string;
    usdBalance: string;
    isContract: string;
    transactionCount: string;
  };
}

const AddressInfoContext = createContext<AddressInfoContextProps>(
  {} as AddressInfoContextProps
);

export const useAddressInfo = (): AddressInfoContextProps =>
  useContext(AddressInfoContext);

const AddressInfoProvider = ({ children }: AddressInfoProviderProps) => {
  const onlineState = useNetworkState();

  const [ens, setENS] = useState("");
  const [avatar, setAvatar] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [ethPrice, setEthPrice] = useState(0);
  const [NFTs, setNFTs] = useState<any[]>([]);
  const [usdBalance, setUSDBalance] = useState(0);
  const [isContract, setIsContract] = useState(false);
  const [transactionCount, setTransactionCount] = useState("");
  const [status, setStatus] = useState({
    ens: "loading",
    balance: "loading",
    usdBalance: "loading",
    isContract: "loading",
    transactionCount: "loading",
  });
  const [modalPosition, setModalPosition] = useState({
    top: 0,
    left: 0,
    bottom: 0,
    useBottom: false,
  });
  const [fetchedData, setFetchedData] = useState<Record<string, AddressInfo>>(
    {}
  );

  // Settings
  const [color, setColor] = useState("");
  const [shouldHighlight, setShouldHighlight] = useState(undefined);

  const [showHovercards, setShowHovercards] = useState(true);
  const [showLargePreview, setShowLargePreview] = useState(true);

  const fetchSettings = async () => {
    const { highlight, largePreview, showHovercards, highlightColor } =
      await chrome.storage.local.get([
        "highlight",
        "largePreview",
        "showHovercards",
        "highlightColor",
      ]);

    setColor(chroma.valid(highlightColor) ? highlightColor : "#FFC0CB");
    setShouldHighlight(highlight !== undefined ? highlight : true);

    if (largePreview !== undefined) setShowLargePreview(largePreview);
    if (showHovercards !== undefined) setShowHovercards(showHovercards);
  };

  const fetchEtherPrice = async () => {
    try {
      const response: any = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const ethPriceUSD = response?.data?.ethereum?.usd;
      setEthPrice(ethPriceUSD);
      setStatus(prevStatus => ({ ...prevStatus, usdBalance: "success" }));
    } catch (error) {
      setStatus(prevStatus => ({ ...prevStatus, usdBalance: "failed" }));
    }
  };

  useEffect(() => {
    if (!address) return;
    setFetchedData(prevData => ({
      ...prevData,
      [address]: {
        ens,
        NFTs,
        balance,
        isContract,
        transactionCount,
      },
    }));
  }, [NFTs, ens, balance, isContract, transactionCount, address]);

  const fetchAddressDetails = async (): Promise<void> => {
    // Validate address
    if (!isAddress(address)) return;
    // Check if user has disabled hovercards
    if (!showHovercards) return;
    // Check if user is offline
    if (!onlineState.online && !fetchedData[address]) return;

    try {
      const addrSub = address.substring(0, 4);
      const avatarIndex = parseInt(addrSub, 16) % avatars.length;
      setAvatar(avatars[avatarIndex]);

      const checkContract = async () => {
        try {
          if (fetchedData[address]?.isContract !== undefined) {
            setIsContract(fetchedData[address].isContract);
          } else {
            const code = await web3.eth.getCode(address);
            setIsContract(code !== "0x");
          }
          setStatus(prevStatus => ({ ...prevStatus, isContract: "success" }));
        } catch (error) {
          setStatus(prevStatus => ({ ...prevStatus, isContract: "failed" }));
        }
      };

      const fetchTransactionCount = async () => {
        try {
          if (fetchedData[address]?.transactionCount) {
            setTransactionCount(fetchedData[address].transactionCount);
          } else {
            const count = await web3.eth.getTransactionCount(address, "latest");
            setTransactionCount(Number(count) + "");
          }
          setStatus(prevStatus => ({
            ...prevStatus,
            transactionCount: "success",
          }));
        } catch (error) {
          setStatus(prevStatus => ({
            ...prevStatus,
            transactionCount: "failed",
          }));
        }
      };

      const fetchBalance = async () => {
        try {
          if (fetchedData[address]?.balance) {
            setBalance(fetchedData[address].balance);
          } else {
            const weiBalance = await web3.eth.getBalance(address);
            const etherBalance = web3.utils.fromWei(weiBalance, "ether");
            setBalance(Number(etherBalance) + "");
          }
          setStatus(prevStatus => ({ ...prevStatus, balance: "success" }));
        } catch (error) {
          setStatus(prevStatus => ({ ...prevStatus, balance: "failed" }));
        }
      };

      const checkENS = async () => {
        try {
          if (!!fetchedData[address]?.ens) {
            setENS(fetchedData[address].ens);
          } else {
            setStatus(prevStatus => ({ ...prevStatus, ens: "loading" }));
            const provider = new InfuraProvider("mainnet", INFURA_API_KEY);
            const name = await provider.lookupAddress(address);
            setENS(name || "");
          }
          setStatus(prevStatus => ({ ...prevStatus, ens: "success" }));
        } catch (error) {
          setStatus(prevStatus => ({ ...prevStatus, ens: "failed" }));
        }
      };

      const fetchNFTs = async () => {
        try {
          if (fetchedData[address]?.NFTs.length > 0) {
            setNFTs(fetchedData[address].NFTs);
          } else {
            const { data } = await axios.get(
              `https://nft.api.infura.io/networks/${"1"}/accounts/${address}/assets/nfts`,
              {
                headers: {
                  Authorization: `Basic ${Auth}`,
                },
              }
            );
            setNFTs(data?.assets);
          }
        } catch (e) {}
      };

      await Promise.all([
        checkContract(),
        fetchTransactionCount(),
        fetchBalance(),
        checkENS(),
        fetchNFTs(),
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (status.balance === "success" && ethPrice) {
      const usdBalance = Number(balance) * ethPrice;
      setUSDBalance(isNaN(usdBalance) ? 0 : usdBalance);
    }
  }, [status, balance, ethPrice]);

  useEffect(() => {
    fetchSettings();
    fetchEtherPrice();
  }, []);

  const previewImages = useMemo(() => {
    return NFTs.filter(nft => nft?.metadata?.image)
      .map(nft => {
        return {
          ...nft,
          image: fixURL(nft.metadata.image),
        };
      })
      .slice(0, 3);
  }, [NFTs]);

  const previewNames = useMemo(() => {
    return NFTs.filter(nft => nft?.metadata?.name)
      .map(nft => nft.metadata.name)
      .sort((a, b) => a.length - b.length)
      .slice(0, 2);
  }, [NFTs]);

  const resetData = () => {
    setAddress("");
    setStatus(prevStatus => ({
      ...prevStatus,
      ens: "loading",
      balance: "loading",
      isContract: "loading",
      transactionCount: "loading",
    }));
    setBalance("");
    setUSDBalance(0);
    setTransactionCount("");
    setENS("");
    setNFTs([]);
  };

  const [isHovering, setIsHovering] = useState(false);
  const [resetTimeout, setResetTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAddressDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    if (isHovering && address) {
      if (resetTimeout) clearTimeout(resetTimeout);
    } else {
      if (resetTimeout) clearTimeout(resetTimeout);
      setResetTimeout(setTimeout(resetData, 500));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovering]);

  useEffect(() => {
    if (!color || !shouldHighlight) return;

    const attachListeners = (
      element: HTMLElement & { href?: string },
      ethAddress?: string
    ) => {
      if (
        ethAddressRegex.test(ethAddress) ||
        ethAddressRegex.test(element?.href) ||
        ensNameRegex.test(element?.href)
      ) {
        // On Mouse Enter
        element.addEventListener("mouseenter", async event => {
          event.preventDefault();
          resetData();

          if (ensNameRegex.test(element?.href)) {
            const ensName = element?.href?.match(ensNameRegex)?.[0] ?? "";
            const addr = await web3.eth.ens.getAddress(ensName);
            ethAddress = addr;
          }

          const address = element?.href?.match(ethAddressRegex)?.[0] ?? "";
          if (!isAddress(address) && !isAddress(ethAddress)) return;
          setAddress(ethAddress || address);
          setIsHovering(true);

          if (shouldHighlight) element.style.color = color;

          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY + (rect.height + 8);
          const bottom = rect.top + window.scrollY - 8;
          const leftMargin =
            rect.left +
            window.scrollX +
            (rect.width > 305 ? (rect.width - 305) / 2 : 0);
          const left =
            window.innerWidth - leftMargin > 305
              ? rect.left + rect.width / 2 > window.innerWidth / 2
                ? leftMargin + rect.width - 305
                : leftMargin
              : window.innerWidth > 345
              ? rect.left + rect.width / 2 > window.innerWidth / 2 &&
                leftMargin + rect.width > 325
                ? leftMargin + rect.width - 305
                : window.innerWidth - 305 - 20
              : 0;

          setModalPosition(p => {
            return {
              ...p,
              top,
              left,
              bottom,
              useBottom: rect.top > window.innerHeight / 2,
            };
          });
        });

        // On Mouse Leave
        element.addEventListener("mouseleave", event => {
          const element = event.target as HTMLAnchorElement;
          element.style.color = "";
          setIsHovering(false);
        });
      }
    };

    const convertAddresses = (node: HTMLElement) => {
      Array.from(node.childNodes).forEach(childNode => {
        if (childNode.nodeType === 3) {
          // text node
          const childContent = childNode.textContent;
          if (
            childContent.match(ethAddressRegexText) ||
            childContent.match(ensNameRegex)
          ) {
            const isAlreadyWrapped =
              childNode.parentElement?.classList.contains(
                "web3-hovercards-address"
              ) ||
              childNode.parentElement?.classList.contains(
                "web3-hovercards-ens"
              );

            if (!isAlreadyWrapped) {
              const updatedContent = childContent
                .replace(
                  ethAddressRegex,
                  '<span class="web3-hovercards-address">$&</span>'
                )
                .replace(
                  ensNameRegex,
                  '<span class="web3-hovercards-ens">$&</span>'
                );

              const wrapper = document.createElement("div");
              wrapper.innerHTML = updatedContent;

              while (wrapper.firstChild) {
                node.insertBefore(wrapper.firstChild, childNode);
              }

              node.removeChild(childNode);
            }
          }
        }
      });

      const ethAddrSpans = node.getElementsByClassName(
        "web3-hovercards-address"
      );
      const ensSpans = node.getElementsByClassName("web3-hovercards-ens");

      Array.from(ethAddrSpans).forEach((span: HTMLElement) => {
        const address = span.textContent;
        attachListeners(span, address);
      });
      Array.from(ensSpans).forEach(async (span: HTMLElement) => {
        const ensName = span.textContent;
        const addr = await web3.eth.ens.getAddress(ensName);
        if (addr) {
          attachListeners(span, addr);
        }
      });
    };

    const setup = () => {
      const links = Array.from(document.getElementsByTagName("a"));
      links.forEach(link => attachListeners(link));

      validTags.forEach(tag => {
        const nodes = document.getElementsByTagName(tag);
        Array.from(nodes).forEach(convertAddresses);
      });
    };

    setup();

    const observeMutations = (mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          Array.from(mutation.addedNodes).forEach((addedNode: HTMLElement) => {
            if (
              addedNode.nodeType === 1 &&
              addedNode.tagName.toLowerCase() === "a" &&
              ethAddressRegex.test((addedNode as HTMLAnchorElement).href ?? "")
            ) {
              attachListeners(addedNode as HTMLAnchorElement);
            } else if (
              addedNode.nodeType === 1 &&
              validTags.includes(addedNode.tagName.toLowerCase())
            ) {
              convertAddresses(addedNode);
            }
          });
        }
      }
    };

    const observer = new MutationObserver(observeMutations);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [shouldHighlight, color]);

  return (
    <AddressInfoContext.Provider
      value={{
        ens,
        NFTs,
        avatar,
        status,
        address,
        balance,
        usdBalance,
        isContract,
        previewNames,
        previewImages,
        transactionCount,

        //Modal controls
        modalPosition,
        setIsHovering,

        // Setting state
        showLargePreview,
      }}
    >
      {children}
    </AddressInfoContext.Provider>
  );
};

export default AddressInfoProvider;
