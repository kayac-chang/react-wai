/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import user from "@testing-library/user-event";
import { Carousel } from "../Carousel";

describe("<Carousel />", () => {
  function setup(interval?: number) {
    user.setup();
    render(
      <Carousel aria-label="Highlighted television shows" interval={interval}>
        <Carousel.Button action="toggle">
          {(auto_rotation) =>
            auto_rotation ? "pause auto-rotation" : "start auto-rotation"
          }
        </Carousel.Button>
        <Carousel.Button action="next">next slide</Carousel.Button>
        <Carousel.Button action="prev">previous slide</Carousel.Button>
        <Carousel.Items>
          <Carousel.Item>
            Dynamic Europe: Amsterdam, Prague, Berlin
          </Carousel.Item>
          <Carousel.Item>Travel to Southwest England and Paris</Carousel.Item>
          <Carousel.Item>
            Great Children's Programming on Public TV
          </Carousel.Item>
          <Carousel.Item>Foyle’s War Revisited</Carousel.Item>
          <Carousel.Item>Great Britain Vote: 7 pm Sat.</Carousel.Item>
          <Carousel.Item>
            Mid-American Gardener: Thursdays at 7 pm
          </Carousel.Item>
        </Carousel.Items>
      </Carousel>
    );
  }

  describe("role, property, state, and tabindex attributes", () => {
    describe("section", () => {
      it("defines the carousel and its controls as a landmark region", () => {
        render(<Carousel aria-label="test" />);
        expect(screen.queryByRole("region")).toBeInTheDocument();
      });

      it("provides a label that describes the content in the carousel region", () => {
        render(<Carousel aria-label="test" />);
        expect(screen.queryByRole("region")).toHaveAccessibleName();
      });

      it('informs assistive technologies to identify the element as a "carousel" rather than a "region"', () => {
        render(<Carousel aria-label="test" />);
        expect(screen.queryByRole("region")).toHaveAttribute(
          "aria-roledescription",
          "carousel"
        );
      });
    });

    describe("item", () => {
      it("enables assistive technology users to perceive the boundaries of a slide.", () => {
        setup();
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        ).toHaveAttribute("role", "group");
        expect(
          screen.getByText("Travel to Southwest England and Paris")
        ).toHaveAttribute("role", "group");
        expect(
          screen.getByText("Great Children's Programming on Public TV")
        ).toHaveAttribute("role", "group");
        expect(screen.getByText("Foyle’s War Revisited")).toHaveAttribute(
          "role",
          "group"
        );
        expect(
          screen.getByText("Great Britain Vote: 7 pm Sat.")
        ).toHaveAttribute("role", "group");
        expect(
          screen.getByText("Mid-American Gardener: Thursdays at 7 pm")
        ).toHaveAttribute("role", "group");
      });

      it('informs assistive technologies to identify the element as a "slide" rather than a "group"', () => {
        setup();
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        ).toHaveAttribute("aria-roledescription", "slide");
        expect(
          screen.getByText("Travel to Southwest England and Paris")
        ).toHaveAttribute("aria-roledescription", "slide");
        expect(
          screen.getByText("Great Children's Programming on Public TV")
        ).toHaveAttribute("aria-roledescription", "slide");
        expect(screen.getByText("Foyle’s War Revisited")).toHaveAttribute(
          "aria-roledescription",
          "slide"
        );
        expect(
          screen.getByText("Great Britain Vote: 7 pm Sat.")
        ).toHaveAttribute("aria-roledescription", "slide");
        expect(
          screen.getByText("Mid-American Gardener: Thursdays at 7 pm")
        ).toHaveAttribute("aria-roledescription", "slide");
      });

      it(
        "provides each slide with a distinct label " +
          "that helps the user understand which of the 6 slides is displayed.",
        async () => {
          setup();
          expect(
            screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
          ).toHaveAccessibleName("1 of 6");
          await user.click(screen.getByRole("button", { name: "next slide" }));
          expect(
            screen.getByText("Travel to Southwest England and Paris")
          ).toHaveAccessibleName("2 of 6");
          await user.click(screen.getByRole("button", { name: "next slide" }));
          expect(
            screen.getByText("Great Children's Programming on Public TV")
          ).toHaveAccessibleName("3 of 6");
          await user.click(screen.getByRole("button", { name: "next slide" }));
          expect(
            screen.getByText("Foyle’s War Revisited")
          ).toHaveAccessibleName("4 of 6");
          await user.click(screen.getByRole("button", { name: "next slide" }));
          expect(
            screen.getByText("Great Britain Vote: 7 pm Sat.")
          ).toHaveAccessibleName("5 of 6");
          await user.click(screen.getByRole("button", { name: "next slide" }));
          expect(
            screen.getByText("Mid-American Gardener: Thursdays at 7 pm")
          ).toHaveAccessibleName("6 of 6");
        }
      );
    });

    describe("items", () => {
      describe("aria-live", () => {
        it("applied to a div element that contains all the slides", () => {
          setup();
          expect(
            screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
              .parentElement
          ).toHaveAttribute("aria-live");
        });
      });
    });

    describe("button", () => {
      it("defines the accessible name for the pause auto-rotation button", () => {
        setup();
        expect(
          screen.queryByRole("button", { name: "start auto-rotation" })
        ).toBeInTheDocument();
      });

      it("and the next and previous slide buttons", () => {
        setup();
        expect(
          screen.queryByRole("button", { name: "next slide" })
        ).toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "previous slide" })
        ).toBeInTheDocument();
      });

      it("identifies the content on the page that the button controls", () => {
        setup();
        const id = screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
          .parentElement?.id;
        expect(id).not.toBeFalsy();
        expect(
          screen.queryByRole("button", { name: "next slide" })
        ).toHaveAttribute("aria-controls", id);
        expect(
          screen.queryByRole("button", { name: "previous slide" })
        ).toHaveAttribute("aria-controls", id);
      });
    });
  });

  describe("control slides", () => {
    describe("users can use the previous and next buttons to manually navigate through the slides", () => {
      it("next slide", async () => {
        setup();
        expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
        await user.click(screen.getByRole("button", { name: "next slide" }));
        expect(screen.getByRole("group")).toHaveAccessibleName("2 of 6");
        await user.click(screen.getByRole("button", { name: "next slide" }));
        expect(screen.getByRole("group")).toHaveAccessibleName("3 of 6");
        await user.click(screen.getByRole("button", { name: "next slide" }));
        expect(screen.getByRole("group")).toHaveAccessibleName("4 of 6");
        await user.click(screen.getByRole("button", { name: "next slide" }));
        expect(screen.getByRole("group")).toHaveAccessibleName("5 of 6");
        await user.click(screen.getByRole("button", { name: "next slide" }));
        expect(screen.getByRole("group")).toHaveAccessibleName("6 of 6");
        await user.click(screen.getByRole("button", { name: "next slide" }));
        expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
      });

      it("previous slide", async () => {
        setup();
        expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
        await user.click(
          screen.getByRole("button", { name: "previous slide" })
        );
        expect(screen.getByRole("group")).toHaveAccessibleName("6 of 6");
        await user.click(
          screen.getByRole("button", { name: "previous slide" })
        );
        expect(screen.getByRole("group")).toHaveAccessibleName("5 of 6");
        await user.click(
          screen.getByRole("button", { name: "previous slide" })
        );
        expect(screen.getByRole("group")).toHaveAccessibleName("4 of 6");
        await user.click(
          screen.getByRole("button", { name: "previous slide" })
        );
        expect(screen.getByRole("group")).toHaveAccessibleName("3 of 6");
        await user.click(
          screen.getByRole("button", { name: "previous slide" })
        );
        expect(screen.getByRole("group")).toHaveAccessibleName("2 of 6");
        await user.click(
          screen.getByRole("button", { name: "previous slide" })
        );
        expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
      });
    });
  });

  describe("automatic rotation", () => {
    describe("interval", () => {
      it("the amount of time to delay between automatically cycling an item", async () => {
        setup(100);

        await waitFor(() => {
          expect(
            screen.getByRole("group", { name: "1 of 6" })
          ).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(
            screen.getByRole("group", { name: "2 of 6" })
          ).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(
            screen.getByRole("group", { name: "3 of 6" })
          ).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(
            screen.getByRole("group", { name: "4 of 6" })
          ).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(
            screen.getByRole("group", { name: "5 of 6" })
          ).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(
            screen.getByRole("group", { name: "6 of 6" })
          ).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(
            screen.getByRole("group", { name: "1 of 6" })
          ).toBeInTheDocument();
        });
      });
    });

    describe("aria-live set to", () => {
      it("off: if the carousel is automatically rotating", () => {
        setup(100);
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "off");
      });
      it("polite: if the carousel is NOT automatically rotating", () => {
        setup();
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "polite");
      });
    });

    describe("hover pause rotation", () => {
      it("hovering the mouse over any carousel content pauses automatic rotation", async () => {
        setup(100);
        expect(
          screen.queryByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        ).toBeInTheDocument();
        await user.hover(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        );
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "polite");
      });
      it("automatic rotation resumes when the mouse moves away from the carousel", async () => {
        setup(100);
        expect(
          screen.queryByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        ).toBeInTheDocument();
        await user.hover(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        );
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "polite");
        await user.unhover(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        );
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "off");
      });
      it("unless another condition, such as keyboard focus, that prevents rotation has been triggered", async () => {
        setup(100);
        expect(
          screen.queryByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        ).toBeInTheDocument();
        await user.hover(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        );
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "polite");
        await user.keyboard("{Tab}");
        await user.unhover(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        );
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "polite");
      });
    });

    describe("focus pause rotation", () => {
      it(
        "moving keyboard focus to any of the carousel content, " +
          "including the next and previous slide elements, pauses automatic rotation",
        async () => {
          setup(100);
          expect(
            screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
              .parentElement
          ).toHaveAttribute("aria-live", "off");
          await user.keyboard("{Tab}");
          expect(
            screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
              .parentElement
          ).toHaveAttribute("aria-live", "polite");
        }
      );
      it("automatic rotation resumes when keyboard focus moves out of the carousel content", async () => {
        setup(100);
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "off");
        await user.keyboard("{Tab}");
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "polite");
        await user.keyboard("{Shift>}{Tab}{/Shift}");
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "off");
      });
      it("unless another condition, such as mouse hover, that prevents rotation has been triggered", async () => {
        setup(100);
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "off");
        await user.keyboard("{Tab}");
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "polite");
        await user.hover(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        );
        await user.keyboard("{Shift>}{Tab}{/Shift}");
        expect(
          screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
            .parentElement
        ).toHaveAttribute("aria-live", "polite");
      });
    });

    describe("button for stop and start automatic rotation", () => {
      it(
        "the carousel also contains a rotation control button " +
          "that can stop and start automatic rotation",
        async () => {
          setup(100);
          expect(
            screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
              .parentElement
          ).toHaveAttribute("aria-live", "off");
          await user.click(screen.getByText("pause auto-rotation"));
          expect(
            screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
              .parentElement
          ).toHaveAttribute("aria-live", "polite");
          await user.click(screen.getByText("start auto-rotation"));
          await user.keyboard("{Shift>}{Tab}{/Shift}");
          await user.unhover(screen.getByText("start auto-rotation"));
          expect(
            screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
              .parentElement
          ).toHaveAttribute("aria-live", "off");
        }
      );
    });
  });

  describe("keyboard support", () => {
    describe("tab", () => {
      it("moves focus through interactive elements in the carousel", async () => {
        setup(100);
        await user.keyboard("{Tab}");
        expect(screen.getByText("start auto-rotation")).toHaveFocus();
        await user.keyboard("{Tab}");
        expect(screen.getByText("next slide")).toHaveFocus();
        await user.keyboard("{Tab}");
        expect(screen.getByText("previous slide")).toHaveFocus();
      });
    });
    describe("enter", () => {
      it("display next slide in the carousel", async () => {
        setup();
        await user.keyboard("{Tab}");
        await user.keyboard("{Tab}");
        expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("group")).toHaveAccessibleName("2 of 6");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("group")).toHaveAccessibleName("3 of 6");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("group")).toHaveAccessibleName("4 of 6");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("group")).toHaveAccessibleName("5 of 6");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("group")).toHaveAccessibleName("6 of 6");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
      });
      it("display previous slide in the carousel", async () => {
        setup();
        await user.keyboard("{Tab}");
        await user.keyboard("{Tab}");
        await user.keyboard("{Tab}");
        expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("group")).toHaveAccessibleName("6 of 6");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("group")).toHaveAccessibleName("5 of 6");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("group")).toHaveAccessibleName("4 of 6");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("group")).toHaveAccessibleName("3 of 6");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("group")).toHaveAccessibleName("2 of 6");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
      });
    });
    describe("space", () => {
      it("display next slide in the carousel", async () => {
        setup();
        await user.keyboard("{Tab}");
        await user.keyboard("{Tab}");
        expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
        await user.keyboard("{Space}");
        expect(screen.getByRole("group")).toHaveAccessibleName("2 of 6");
        await user.keyboard("{Space}");
        expect(screen.getByRole("group")).toHaveAccessibleName("3 of 6");
        await user.keyboard("{Space}");
        expect(screen.getByRole("group")).toHaveAccessibleName("4 of 6");
        await user.keyboard("{Space}");
        expect(screen.getByRole("group")).toHaveAccessibleName("5 of 6");
        await user.keyboard("{Space}");
        expect(screen.getByRole("group")).toHaveAccessibleName("6 of 6");
        await user.keyboard("{Space}");
        expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
      });
      it("display previous slide in the carousel", async () => {
        setup();
        await user.keyboard("{Tab}");
        await user.keyboard("{Tab}");
        await user.keyboard("{Tab}");
        expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
        await user.keyboard("{Space}");
        expect(screen.getByRole("group")).toHaveAccessibleName("6 of 6");
        await user.keyboard("{Space}");
        expect(screen.getByRole("group")).toHaveAccessibleName("5 of 6");
        await user.keyboard("{Space}");
        expect(screen.getByRole("group")).toHaveAccessibleName("4 of 6");
        await user.keyboard("{Space}");
        expect(screen.getByRole("group")).toHaveAccessibleName("3 of 6");
        await user.keyboard("{Space}");
        expect(screen.getByRole("group")).toHaveAccessibleName("2 of 6");
        await user.keyboard("{Space}");
        expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
      });
    });
  });
});
