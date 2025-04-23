jest.mock("../../Constants/config", () => ({
  RPC: "http://localhost:8545",
  vrtAddress: "0x0000000000000000000000000000000000000000",
  vrtABI: [],
  daoABI: [],
  daoAddress: "0x0000000000000000000000000000000000000000",
}));

jest.mock("web3", () => {
  const HttpProvider = jest.fn();

  return jest.fn().mockImplementation(() => ({
    eth: {
      Contract: jest.fn().mockImplementation(() => ({})),
      getAccounts: jest.fn(),
    },
    providers: {
      HttpProvider: HttpProvider,
    },
    utils: {
      toHex: jest.fn((val) => val),
    },
  }));
});

import React from "react";
import { render, screen, act } from "@testing-library/react";
import Web3Context, { Web3Provider } from "../Web3Context";

describe("Web3Context walletConnect", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows alert if no ethereum wallet is installed", async () => {
    window.ethereum = undefined;
    window.alert = jest.fn();

    let contextValue;
    render(
      <Web3Provider>
        <Web3Context.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </Web3Context.Consumer>
      </Web3Provider>
    );

    await act(async () => {
      await contextValue.walletConnect();
    });

    expect(window.alert).toHaveBeenCalledWith(
      "No Ethereum wallet detected. Please install MetaMask or another wallet."
    );
  });

  test("connects wallet if ethereum is available", async () => {
    const mockRequest = jest.fn().mockResolvedValue(["0x123"]);
    window.ethereum = {
      request: mockRequest,
      on: jest.fn(),
      removeListener: jest.fn(),
    };

    let contextValue;
    render(
      <Web3Provider>
        <Web3Context.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </Web3Context.Consumer>
      </Web3Provider>
    );

    await act(async () => {
      await contextValue.walletConnect();
    });

    expect(mockRequest).toHaveBeenCalledWith({ method: "eth_requestAccounts" });
    expect(contextValue.account).toBe("0x123");
  });
});
