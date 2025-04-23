const HttpProvider = jest.fn();

const Web3 = jest.fn().mockImplementation(() => ({
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

module.exports = Web3;
