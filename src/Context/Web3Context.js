import React from "react";
import {
  RPC,
  vrtAddress,
  vrtABI,
  daoABI,
  daoAddress,
} from "../Constants/config";
import Web3 from "web3";

const web3 = new Web3(new Web3.providers.HttpProvider(RPC));
const vrtContract = new web3.eth.Contract(vrtABI, vrtAddress);
const daoContract = new web3.eth.Contract(daoABI, daoAddress);

const initialState = {
  web3: web3,
  account: "",
  daoContract: daoContract,
  vrtContract: vrtContract,
};

const Web3Context = React.createContext({
  ...initialState,
});

export const Web3Provider = ({ children }) => {
  const [data, setData] = React.useState({ ...initialState });

  React.useEffect(() => {
    if (window.ethereum) {
      const { ethereum } = window;

      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setData((prev) => ({ ...prev, account: "" }));
        } else {
          setData((prev) => ({ ...prev, account: accounts[0] }));
        }
      };

      const handleChainChanged = (chainId) => {
        window.location.reload();
      };

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
          ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  const walletConnect = async () => {
    if (!window.ethereum) {
      alert("No Ethereum wallet detected. Please install MetaMask or another wallet.");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(1666600000) }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: web3.utils.toHex(1666600000),
                chainName: "Harmony Mainnet",
                rpcUrls: ["https://api.harmony.one"],
                nativeCurrency: {
                  name: "ONE",
                  symbol: "ONE",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://explorer.harmony.one/"],
              },
            ],
          });
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: web3.utils.toHex(1666600000) }],
          });
        } catch (addError) {
          console.error("Failed to add chain:", addError);
          return;
        }
      } else {
        console.error("Failed to switch chain:", switchError);
        return;
      }
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const clientWeb3 = new Web3(window.ethereum);
      const accounts = await clientWeb3.eth.getAccounts();
      setData((prev) => ({ ...prev, web3: clientWeb3, account: accounts[0] }));
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    }
  };

  return (
    <Web3Context.Provider value={{ ...data, walletConnect }}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;
