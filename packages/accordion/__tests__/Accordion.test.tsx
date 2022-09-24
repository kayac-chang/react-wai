/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import { Accordion } from "../Accordion";

describe("<Accordion />", () => {
  describe("roles, states, and properties", () => {
    it("the title of each accordion header is contained in an element with role button", () => {
      render(
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>Personal Information</Accordion.Header>
          </Accordion.Item>
        </Accordion>
      );

      expect(
        screen.queryByRole("button", { name: "Personal Information" })
      ).toBeInTheDocument();
    });

    describe(
      "each accordion header button is wrapped in an element with role heading" +
        "that has a value set for aria-level" +
        "that is appropriate for the information architecture of the page",
      () => {
        it(
          "if the native host language has an element with an implicit heading and aria-level, " +
            "such as an html heading tag, a native host language element may be used",
          () => {
            render(
              <Accordion>
                <Accordion.Item>
                  <Accordion.Header as="h2">
                    Personal Information
                  </Accordion.Header>
                </Accordion.Item>
              </Accordion>
            );

            expect(
              screen.queryByRole("heading", {
                level: 2,
                name: "Personal Information",
              })
            ).toBeInTheDocument();
          }
        );

        it(
          "the button element is the only element inside the heading element. " +
            "that is, if there are other visually persistent elements, " +
            "they are not included inside the heading element",
          () => {
            render(
              <Accordion>
                <Accordion.Item>
                  <Accordion.Header>Personal Information</Accordion.Header>
                </Accordion.Item>
              </Accordion>
            );

            expect(
              screen.queryByRole("heading", {
                level: 2,
                name: "Personal Information",
              })?.children
            ).toHaveLength(1);

            expect(
              screen.queryByRole("heading", {
                level: 2,
                name: "Personal Information",
              })?.children[0].tagName
            ).toMatch(/button/i);
          }
        );
      }
    );

    it(
      "if the accordion panel associated with an accordion header is visible, " +
        "the header button element has aria-expanded set to true. " +
        "if the panel is not visible, aria-expanded is set to false",
      async () => {
        user.setup();
        render(
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>Personal Information</Accordion.Header>
              <Accordion.Panel>test content</Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item>
              <Accordion.Header>Billing Address</Accordion.Header>
              <Accordion.Panel>test content 2</Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );

        expect(
          screen.queryByRole("button", { name: "Personal Information" })
        ).toHaveAttribute("aria-expanded", "true");

        expect(screen.queryByText("test content")).toBeInTheDocument();

        await user.click(
          screen.getByRole("button", { name: "Billing Address" })
        );

        expect(screen.queryByText("test content")).not.toBeInTheDocument();
      }
    );

    it(
      "the accordion header button element has aria-controls " +
        "set to the id of the element containing the accordion panel content",
      () => {
        render(
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>Personal Information</Accordion.Header>
              <Accordion.Panel data-testid="panel">
                test content
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );
        expect(
          screen.getByRole("button", { name: "Personal Information" })
        ).toHaveAttribute("aria-controls", screen.getByTestId("panel").id);
      }
    );

    describe("region", () => {
      it("creates a landmark region that contains the currently expanded accordion panel", () => {
        render(
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>Personal Information</Accordion.Header>
              <Accordion.Panel>test content</Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );

        expect(screen.getByRole("region")).toBeInTheDocument();
      });

      describe('aria-labelledby="IDREF"', () => {
        it("region elements are required to have an accessible name to be identified as a landmark", () => {
          render(
            <Accordion>
              <Accordion.Item>
                <Accordion.Header>Personal Information</Accordion.Header>
                <Accordion.Panel>test content</Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          );

          expect(screen.getByRole("region")).toHaveAccessibleName(
            "Personal Information"
          );
        });

        it("references the accordion header button that expands and collapses the region", () => {
          render(
            <Accordion>
              <Accordion.Item>
                <Accordion.Header>Personal Information</Accordion.Header>
                <Accordion.Panel>test content</Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          );

          expect(screen.getByRole("region")).toHaveAttribute(
            "aria-labelledby",
            screen.getByRole("button", { name: "Personal Information" }).id
          );
        });
      });
    });
  });

  describe("keyboard support", () => {
    describe("when focus is on the accordion header of a collapsed section, expands the section", () => {
      it("enter", async () => {
        user.setup();
        render(
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>Personal Information</Accordion.Header>
              <Accordion.Panel>test content</Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item>
              <Accordion.Header>Billing Address</Accordion.Header>
              <Accordion.Panel>test content 2</Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );

        expect(screen.queryByText("test content 2")).not.toBeInTheDocument();
        screen.getByRole("button", { name: "Billing Address" }).focus();
        await user.keyboard("{enter}");
        expect(screen.queryByText("test content 2")).toBeInTheDocument();
      });

      it("space", async () => {
        user.setup();
        render(
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>Personal Information</Accordion.Header>
              <Accordion.Panel>test content</Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item>
              <Accordion.Header>Billing Address</Accordion.Header>
              <Accordion.Panel>test content 2</Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );

        expect(screen.queryByText("test content 2")).not.toBeInTheDocument();
        screen.getByRole("button", { name: "Billing Address" }).focus();
        await user.keyboard(" ");
        expect(screen.queryByText("test content 2")).toBeInTheDocument();
      });
    });

    it(
      "if the implementation allows only one panel to be expanded, " +
        "and if another panel is expanded, collapses that panel.",
      async () => {
        user.setup();
        render(
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>Personal Information</Accordion.Header>
              <Accordion.Panel>test content 1</Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item>
              <Accordion.Header>Billing Address</Accordion.Header>
              <Accordion.Panel>test content 2</Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item>
              <Accordion.Header>Shipping Address</Accordion.Header>
              <Accordion.Panel>test content 3</Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );

        expect(screen.queryByText("test content 1")).toBeInTheDocument();
        expect(screen.queryByText("test content 2")).not.toBeInTheDocument();
        expect(screen.queryByText("test content 3")).not.toBeInTheDocument();

        await user.click(
          screen.getByRole("button", { name: "Billing Address" })
        );
        expect(screen.queryByText("test content 1")).not.toBeInTheDocument();
        expect(screen.queryByText("test content 2")).toBeInTheDocument();
        expect(screen.queryByText("test content 3")).not.toBeInTheDocument();

        await user.click(
          screen.getByRole("button", { name: "Shipping Address" })
        );
        expect(screen.queryByText("test content 1")).not.toBeInTheDocument();
        expect(screen.queryByText("test content 2")).not.toBeInTheDocument();
        expect(screen.queryByText("test content 3")).toBeInTheDocument();
      }
    );

    it.todo(
      "Some implementations require one panel to be expanded at all times and allow only one panel to be expanded; so, they do not support a collapse function."
    );

    describe("tab", () => {
      it.todo("moves focus to the next focusable element");

      it.todo(
        "all focusable elements in the accordion are included in the page tab sequence"
      );
    });

    describe("shift + tab", () => {
      it.todo("moves focus to the next focusable element");

      it.todo(
        "all focusable elements in the accordion are included in the page tab sequence"
      );
    });
  });
});
