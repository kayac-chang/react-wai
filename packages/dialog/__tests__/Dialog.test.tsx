/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "../Dialog";

describe("<Dialog />", () => {
  describe("roles/states/properties", () => {
    it("the element that serves as the dialog container has a role of dialog.", () => {
      render(<Dialog data-testid="a" aria-label="a" />);
      expect(screen.getByTestId("a")).toHaveAttribute("role", "dialog");
    });

    it("all elements required to operate the dialog are descendants of the element that has role dialog.", () => {
      render(
        <Dialog data-testid="a" aria-label="a">
          <Dialog data-testid="b" aria-label="b" />
        </Dialog>
      );
      expect(screen.getByTestId("a")).toHaveAttribute("role", "dialog");
      expect(screen.getByTestId("b")).toHaveAttribute("role", "dialog");
    });

    it("the dialog container element has aria-modal set to true.", () => {
      render(<Dialog data-testid="a" aria-label="a" />);
      expect(screen.getByTestId("a")).toHaveAttribute("aria-modal", "true");
    });

    describe("the dialog has either:", () => {
      it("a value set for the aria-labelledby property that refers to a visible dialog title.", () => {
        //
        render(
          <Dialog>
            <Dialog.Title>This is Title</Dialog.Title>
          </Dialog>
        );
        expect(screen.getByRole("dialog")).toHaveAttribute(
          "aria-labelledby",
          screen.getByText("This is Title").id
        );

        expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-label");
      });

      it("a label specified by aria-label.", () => {
        render(<Dialog aria-label="This is Title" />);

        expect(screen.getByRole("dialog")).toHaveAttribute(
          "aria-label",
          "This is Title"
        );
        expect(screen.getByRole("dialog")).not.toHaveAttribute(
          "aria-labelledby"
        );
      });

      it("dialog should has either", () => {
        expect(() => render(<Dialog />)).toThrow(
          "dialog should has either: \n" +
            "- a value set for the aria-labelledby property that refers to a visible dialog title.\n" +
            "- a label specified by aria-label."
        );
      });
    });

    it("optionally, the aria-describedby property is set on the element with the dialog role \
      to indicate which element or elements in the dialog contain content \
      that describes the primary purpose or message of the dialog.", () => {
      render(
        <Dialog aria-label="title">
          <Dialog.Description data-testid="desc">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum at
            obcaecati, aliquid modi deserunt reprehenderit maiores nulla soluta
            itaque veritatis perspiciatis praesentium repellendus animi beatae
            expedita temporibus. Eaque, quae facilis?
          </Dialog.Description>
        </Dialog>
      );

      expect(screen.getByRole("dialog")).toHaveAttribute(
        "aria-describedby",
        screen.getByTestId("desc").id
      );
    });
  });

  describe("keyboard interaction", () => {
    describe("tab", () => {
      it.todo("moves focus to the next tabbable element inside the dialog.");

      it.todo(
        "if focus is on the last tabbable element inside the dialog, \
        moves focus to the first tabbable element inside the dialog."
      );
    });

    describe("shift + tab", () => {
      it.todo(
        "moves focus to the previous tabbable element inside the dialog."
      );

      it.todo(
        "if focus is on the first tabbable element inside the dialog, \
        moves focus to the last tabbable element inside the dialog."
      );
    });

    describe("escape", () => {
      it.todo("closes the dialog.");
    });
  });
});
