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
import { fixURL } from "../helpers/address";
import { avatars } from "../constants/avatar";
import { InfuraProvider } from "@ethersproject/providers";
import { INFURA_API_KEY, INFURA_API_KEY_SECRET } from "../constants/infura";

const ethAddressRegex = /(0x[a-fA-F0-9]{40})/;

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
  const [address, setAddress] = useState("");

  const [ens, setENS] = useState("");
  const [avatar, setAvatar] = useState("");
  const [balance, setBalance] = useState("");
  const [ethPrice, setEthPrice] = useState(0);
  const [NFTs, setNFTs] = useState<any[]>([]);
  const [color, setColor] = useState("#FFC0CB");
  const [usdBalance, setUSDBalance] = useState(0);
  const [isContract, setIsContract] = useState(false);
  const [transactionCount, setTransactionCount] = useState("");
  const [showLargePreview, setShowLargePreview] = useState(true);
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
          if (fetchedData[address]?.ens !== undefined) {
            setENS(fetchedData[address].ens);
          } else {
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
    const attachEventListeners = () => {
      const links = Array.from(document.getElementsByTagName("a"));

      links.forEach(link => {
        if (ethAddressRegex.test(link.href)) {
          // On Mouse Over
          link.addEventListener("mouseenter", event => {
            event.preventDefault();
            resetData();

            const address = link.href?.match(ethAddressRegex)?.[0] ?? "";
            if (!isAddress(address)) return;
            setAddress(address);
            setIsHovering(true);

            link.style.color = color;

            const rect = link.getBoundingClientRect();
            const top = rect.top + window.scrollY + (rect.height + 8);
            const bottom = rect.top + window.scrollY - 8;
            // X Offset Position
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

          // On Mouse Out
          link.addEventListener("mouseleave", event => {
            const link = event.target as HTMLAnchorElement;
            link.style.color = "";

            setIsHovering(false);
          });
        }
      });
    };

    attachEventListeners();

    const observer = new MutationObserver(attachEventListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

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