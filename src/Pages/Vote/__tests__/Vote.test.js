import React from "react";
import { render, screen } from "@testing-library/react";
import Vote from "../index";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

const mockStore = configureStore([]);

describe("Vote component image fallback", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      userReducer: {
        account: "0x123",
        position: "MEMBER",
      },
    });
  });

  test("renders fallback image when element.source is missing or empty", () => {
    const elections = [
      { id: 1, name: "Election 1", source: "" },
      { id: 2, name: "Election 2" }, // no source
    ];

    const { container } = render(
      <Provider store={store}>
        <Vote elections={elections} />
      </Provider>
    );

    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      expect(img.src).toContain("/images/election.png");
    });
  });
});
