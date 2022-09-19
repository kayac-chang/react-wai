/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import { Dialog } from "dialog";
import { Calendar, MonthCalendar } from "calendar";
import { DatePicker } from "../DatePicker";
import { format } from "date-fns";
import { useState, useRef, RefObject } from "react";

describe("DatePicker and Calendar integration", () => {
  function TestCalendar(props: {
    value?: Date;
    onDismiss: () => void;
    previousFocusRef: RefObject<HTMLElement>;
  }) {
    const ref = useRef<HTMLTableCellElement>(null);
    const [focusWithinGrid, setFocusWithinGrid] = useState(false);

    return (
      <Calendar
        value={props.value}
        as={Dialog}
        initialFocusRef={ref}
        previousFocusRef={props.previousFocusRef}
        aria-label="Choose Date"
        onDismiss={props.onDismiss}
      >
        <Calendar.Header>
          <Calendar.Title />
          <Calendar.Button action="previous month" />
          <Calendar.Button action="next month" />
          <Calendar.Button action="previous year" />
          <Calendar.Button action="next year" />
        </Calendar.Header>

        <MonthCalendar.Grid
          onFocusCapture={(event) =>
            setFocusWithinGrid(
              event.currentTarget.contains(document.activeElement)
            )
          }
          onBlurCapture={() => setFocusWithinGrid(false)}
        >
          <MonthCalendar.ColumnHeader />

          <MonthCalendar.GridCell ref={ref}>
            {(date) => (
              <DatePicker.Button action={{ type: "select date", value: date }}>
                {format(date, "dd")}
              </DatePicker.Button>
            )}
          </MonthCalendar.GridCell>
        </MonthCalendar.Grid>

        <span aria-live="polite">
          {focusWithinGrid && "Cursor keys can navigate dates"}
        </span>
      </Calendar>
    );
  }

  function TestDatePicker(props: { value?: Date }) {
    const previousFocus = useRef<HTMLButtonElement>(null);
    return (
      <DatePicker value={props.value}>
        <DatePicker.Field format={(value) => format(value, "MM/dd/yyyy")} />
        <DatePicker.Button
          action={{ type: "trigger calendar" }}
          ref={previousFocus}
        >
          {({ value }) =>
            value
              ? `change date, ${format(value, "MM/dd/yyyy")}`
              : "choose date"
          }
        </DatePicker.Button>

        <DatePicker.Description>
          (date format: mm/dd/yyyy)
        </DatePicker.Description>

        {([{ open, value }, dispatch]) =>
          open && (
            <TestCalendar
              value={value}
              previousFocusRef={previousFocus}
              onDismiss={() => dispatch({ type: "close calendar" })}
            />
          )
        }
      </DatePicker>
    );
  }

  function setup(initialValue?: Date) {
    user.setup();
    return render(<TestDatePicker value={initialValue} />);
  }

  describe("roles/states/properties/tabindex", () => {
    describe("Textbox", () => {
      it("identifies the element that provides an accessible description for the textbox", () => {
        setup();
        expect(screen.queryByRole("textbox"))
          //
          .toHaveAccessibleDescription("(date format: mm/dd/yyyy)");
      });
    });

    describe("Choose Date Button", () => {
      it(`the initial value of accessible name is "choose date"`, () => {
        setup();
        expect(
          screen.getByRole("button", { name: /choose date/ })
        ).toBeInTheDocument();
      });

      it(`when user click button, should open dialog`, async () => {
        setup();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /choose date/ }));
        expect(screen.queryByRole("dialog")).toBeInTheDocument();
      });

      it(`when users select a date, the accessible name is changed to \
      "change date, date_string" where date_string is the selected date`, async () => {
        setup(new Date(0));
        const button = screen.getByRole("button");
        await user.click(button);
        await user.click(screen.getByRole("button", { name: "02" }));
        expect(button).toHaveAccessibleName("change date, 01/02/1970");
      });
    });

    describe("Date Picker Dialog", () => {
      it("identifies the element as a dialog", async () => {
        setup();
        await user.click(screen.getByRole("button", { name: /choose date/ }));
        expect(screen.queryByRole("dialog")).toBeInTheDocument();
      });

      it("indicates the dialog is modal", async () => {
        setup();
        await user.click(screen.getByRole("button", { name: /choose date/ }));
        expect(screen.queryByRole("dialog")).toHaveAttribute(
          "aria-modal",
          "true"
        );
      });

      it("defines the accessible name for the dialog", async () => {
        setup();
        await user.click(screen.getByRole("button", { name: /choose date/ }));
        expect(screen.getByRole("dialog")).toHaveAccessibleName();
      });

      it("when the month and/or year changes the content of the h2 element is updated", async () => {
        setup(new Date(0));
        await user.click(screen.getByRole("button"));

        const h2 = screen.queryByRole("heading", { level: 2 });
        expect(h2).toHaveTextContent("January 1970");

        await user.click(screen.getByRole("button", { name: "next month" }));
        expect(h2).toHaveTextContent("February 1970");

        await user.click(screen.getByRole("button", { name: "next year" }));
        expect(h2).toHaveTextContent("February 1971");

        await user.click(screen.getByRole("button", { name: "previous year" }));
        expect(h2).toHaveTextContent("February 1970");

        await user.click(
          screen.getByRole("button", { name: "previous month" })
        );
        expect(h2).toHaveTextContent("January 1970");
      });

      it("indicates the h2 should be automatically announced by screen readers", async () => {
        setup();
        await user.click(screen.getByRole("button"));
        expect(screen.getByRole("heading", { level: 2 }))
          //
          .toHaveAttribute("aria-live");
      });

      it(
        "indicates the element that displays information about keyboard commands " +
          "for navigating the grid should be automatically announced by screen readers",
        async () => {
          setup();
          await user.click(screen.getByRole("button"));
          expect(
            screen.queryByText("Cursor keys can navigate dates")
          ).toBeInTheDocument();
          expect(
            screen.queryByText("Cursor keys can navigate dates")
          ).toHaveAttribute("aria-live");
        }
      );

      it(
        "the script slightly delays display of the information, " +
          "so screen readers are more likely to read it after information related to change of focus",
        async () => {
          setup();
          await user.click(screen.getByRole("button"));

          expect(
            screen.queryByText("Cursor keys can navigate dates")
          ).toBeInTheDocument();

          await user.click(screen.getByRole("button", { name: "next month" }));
          expect(
            screen.queryByText("Cursor keys can navigate dates")
          ).not.toBeInTheDocument();

          await user.click(screen.getByText("01"));
          expect(
            screen.queryByText("Cursor keys can navigate dates")
          ).toBeInTheDocument();
        }
      );
    });

    describe("Date Picker Dialog: Date Grid", () => {
      it("identifies the table element as a grid widget", async () => {
        setup();
        await user.click(screen.getByRole("button", { name: /choose date/ }));
        expect(screen.queryByRole("grid")).toBeInTheDocument();
      });

      it("identifies the element that provides the accessible name for the grid", async () => {
        setup();
        await user.click(screen.getByRole("button", { name: /choose date/ }));
        expect(screen.queryByRole("grid")).toHaveAccessibleName();
      });

      it(
        "only set on the cell containing the currently selected date; " +
          "no other cells have aria-selected specified",
        async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          expect(screen.getByText("01"))
            //
            .toHaveAttribute("aria-selected", "true");
        }
      );
    });
  });

  describe("keyboard support", () => {
    describe("choose date button", () => {
      describe("space", () => {
        it("open the date picker dialog", async () => {
          setup(new Date(0));
          screen.getByRole("button").focus();
          await user.keyboard("{Space}");
          expect(screen.queryByRole("dialog")).toBeInTheDocument();
        });

        it("move focus to selected date, i.e., the date displayed in the date input text field", async () => {
          setup(new Date(0));
          screen.getByRole("button").focus();
          await user.keyboard("{Space}");
          expect(screen.queryByText("01")).toHaveFocus();
        });

        it("no date has been selected, places focus on the current date.", async () => {
          setup();
          screen.getByRole("button").focus();
          await user.keyboard("{Space}");
          expect(screen.queryByText(new Date().getDate())).toHaveFocus();
        });
      });

      describe("enter", () => {
        it("open the date picker dialog", async () => {
          setup(new Date(0));
          screen.getByRole("button").focus();
          await user.keyboard("{Enter}");
          expect(screen.queryByRole("dialog")).toBeInTheDocument();
        });

        it("move focus to selected date, i.e., the date displayed in the date input text field", async () => {
          setup(new Date(0));
          screen.getByRole("button").focus();
          await user.keyboard("{Enter}");
          expect(screen.queryByText("01")).toHaveFocus();
        });

        it("no date has been selected, places focus on the current date.", async () => {
          setup();
          screen.getByRole("button").focus();
          await user.keyboard("{Enter}");
          expect(screen.queryByText(new Date().getDate())).toHaveFocus();
        });
      });
    });

    describe("date picker dialog", () => {
      describe("esc", () => {
        it('closes the dialog and returns focus to the "choose date" button', async () => {
          setup();
          screen.getByRole("button", { name: "choose date" }).focus();
          await user.keyboard("{Enter}");
          expect(screen.queryByRole("dialog")).toBeInTheDocument();
          await user.keyboard("{Escape}");
          expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
          expect(
            screen.getByRole("button", { name: "choose date" })
          ).toHaveFocus();
        });
      });

      it("only one button in the calendar grid is in the tab sequence", async () => {
        setup(new Date(0));
        await user.click(screen.getByRole("button"));
        expect(
          Array.from(
            document.querySelectorAll("table button[tabindex]")
          ).filter((button) => Number(button.getAttribute("tabindex")) >= 0)
            .length
        ).toEqual(1);
      });

      describe("tab", () => {
        it("moves focus to next element in the dialog tab sequence", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          expect(screen.getByText("01")).toHaveFocus();
          await user.keyboard("{Tab}");
          expect(screen.getByLabelText("previous month")).toHaveFocus();
          await user.keyboard("{Tab}");
          expect(screen.getByLabelText("next month")).toHaveFocus();
        });

        it("if focus is on the last element, moves focus to the first element", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          expect(screen.getByText("01")).toHaveFocus();
          await user.keyboard("{Tab}");
          expect(screen.getByLabelText("previous month")).toHaveFocus();
          await user.keyboard("{Tab}");
          expect(screen.getByLabelText("next month")).toHaveFocus();
          await user.keyboard("{Tab}");
          expect(screen.getByLabelText("previous year")).toHaveFocus();
          await user.keyboard("{Tab}");
          expect(screen.getByLabelText("next year")).toHaveFocus();
          await user.keyboard("{Tab}");
          expect(screen.getByText("01")).toHaveFocus();
        });
      });

      describe("shift + tab", () => {
        it("moves focus to previous element in the dialog tab sequence.", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          expect(screen.getByText("01")).toHaveFocus();
          await user.keyboard("{Shift>}{Tab}{/Shift}");
          expect(screen.getByLabelText("next year")).toHaveFocus();
          await user.keyboard("{Shift>}{Tab}{/Shift}");
          expect(screen.getByLabelText("previous year")).toHaveFocus();
        });

        it("if focus is on the first element, moves focus to the last element", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          expect(screen.getByText("01")).toHaveFocus();
          await user.keyboard("{Shift>}{Tab}{/Shift}");
          expect(screen.getByLabelText("next year")).toHaveFocus();
          await user.keyboard("{Shift>}{Tab}{/Shift}");
          expect(screen.getByLabelText("previous year")).toHaveFocus();
          await user.keyboard("{Shift>}{Tab}{/Shift}");
          expect(screen.getByLabelText("next month")).toHaveFocus();
          await user.keyboard("{Shift>}{Tab}{/Shift}");
          expect(screen.getByLabelText("previous month")).toHaveFocus();
          await user.keyboard("{Shift>}{Tab}{/Shift}");
          expect(screen.getByText("01")).toHaveFocus();
        });
      });
    });

    describe("date picker dialog: month/year buttons", () => {
      describe("space, enter", () => {
        it("change the month and/or year displayed in the calendar grid", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));

          await user.keyboard("{Tab}");
          expect(screen.getByLabelText("previous month")).toHaveFocus();
          await user.keyboard("{Space}");
          expect(screen.getByRole("grid")).toHaveAccessibleName(
            "December 1969"
          );

          await user.keyboard("{Tab}");
          expect(screen.getByLabelText("next month")).toHaveFocus();
          await user.keyboard("{Space}");
          expect(screen.getByRole("grid")).toHaveAccessibleName("January 1970");

          await user.keyboard("{Tab}");
          expect(screen.getByLabelText("previous year")).toHaveFocus();
          await user.keyboard("{Space}");
          expect(screen.getByRole("grid")).toHaveAccessibleName("January 1969");

          await user.keyboard("{Tab}");
          expect(screen.getByLabelText("next year")).toHaveFocus();
          await user.keyboard("{Space}");
          expect(screen.getByRole("grid")).toHaveAccessibleName("January 1970");
        });
      });
    });

    describe("date picker dialog: date grid", () => {
      describe("space, enter", () => {
        it('select the date, close the dialog, and move focus to the "choose date" button', async () => {
          setup();
          await user.click(screen.getByRole("button"));
          await user.click(screen.getByText("15"));
          await user.keyboard("{Escape}");
          expect(screen.getByRole("button")).toHaveFocus();
        });

        it('update the value of the "date" input with the selected date', async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          await user.click(screen.getByText("01"));
          expect(screen.getByRole("textbox")).toHaveValue("01/01/1970");
          await user.click(screen.getByText("02"));
          expect(screen.getByRole("textbox")).toHaveValue("01/02/1970");
        });

        it('update the accessible name of the "choose date" button to include the selected date', async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          await user.click(screen.getByText("01"));
          expect(
            screen.queryByRole("button", { name: "change date, 01/01/1970" })
          ).toBeInTheDocument();
          await user.click(screen.getByText("02"));
          expect(
            screen.queryByRole("button", { name: "change date, 01/02/1970" })
          ).toBeInTheDocument();
        });
      });

      describe("up arrow", () => {
        it("moves focus to the same day of the previous week", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          expect(screen.queryByText("01")).toHaveFocus();
          await user.keyboard("{ArrowUp}");
          expect(screen.queryByText("25")).toHaveFocus();
        });
      });
      describe("down arrow", () => {
        it("moves focus to the same day of the next week", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          expect(screen.queryByText("01")).toHaveFocus();
          await user.keyboard("{ArrowDown}");
          expect(screen.queryByText("08")).toHaveFocus();
        });
      });
      describe("right arrow", () => {
        it("moves focus to the next day", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          expect(screen.queryByText("01")).toHaveFocus();
          await user.keyboard("{ArrowRight}");
          expect(screen.queryByText("02")).toHaveFocus();
        });
      });
      describe("left arrow", () => {
        it("moves focus to the previous day", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          expect(screen.queryByText("01")).toHaveFocus();
          await user.keyboard("{ArrowRight}");
          expect(screen.queryByText("02")).toHaveFocus();
        });
      });
      describe("home", () => {
        it("moves focus to the first day (e.g sunday) of the current week", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          expect(screen.queryByText("01")).toHaveFocus();
          await user.keyboard("{Home}");
          expect(screen.queryByText("28")).toHaveFocus();
        });
      });
      describe("end", () => {
        it("moves focus to the last day (e.g. saturday) of the current week", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          expect(screen.queryByText("01")).toHaveFocus();
          await user.keyboard("{End}");
          expect(screen.queryByText("03")).toHaveFocus();
        });
      });
      describe("page up", () => {
        it("changes the grid of dates to the previous month", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          await user.keyboard("{PageUp}");
          expect(screen.getByRole("grid")).toHaveAccessibleName(
            "December 1969"
          );
        });
        it(
          "sets focus on the same day of the same week. " +
            "if that day does not exist, then moves focus to the same day of the previous or next week",
          async () => {
            setup(new Date(0));
            await user.click(screen.getByRole("button"));
            expect(screen.queryByText("01")).toHaveFocus();
            await user.keyboard("{PageUp}");
            expect(screen.queryByText("01")).toHaveFocus();
          }
        );
      });
      describe("shift + page up", () => {
        it("changes the grid of dates to the previous year", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          await user.keyboard("{Shift>}{PageUp}{/Shift}");
          expect(screen.getByRole("grid")).toHaveAccessibleName("January 1969");
        });
        it(
          "sets focus on the same day of the same week. " +
            "if that day does not exist, then moves focus to the same day of the previous or next week",
          async () => {
            setup(new Date(0));
            await user.click(screen.getByRole("button"));
            expect(screen.queryByText("01")).toHaveFocus();
            await user.keyboard("{Shift>}{PageUp}{/Shift}");
            expect(screen.queryByText("01")).toHaveFocus();
          }
        );
      });
      describe("page down", () => {
        it("changes the grid of dates to the next month", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          await user.keyboard("{PageDown}");
          expect(screen.getByRole("grid")).toHaveAccessibleName(
            "February 1970"
          );
        });
        it(
          "sets focus on the same day of the same week. " +
            "if that day does not exist, then moves focus to the same day of the previous or next week.",
          async () => {
            setup(new Date(0));
            await user.click(screen.getByRole("button"));
            expect(screen.queryByText("01")).toHaveFocus();
            await user.keyboard("{PageDown}");
            expect(screen.queryByText("01")).toHaveFocus();
          }
        );
      });
      describe("shift + page down", () => {
        it("changes the grid of dates to the next year", async () => {
          setup(new Date(0));
          await user.click(screen.getByRole("button"));
          await user.keyboard("{Shift>}{PageDown}{/Shift}");
          expect(screen.getByRole("grid")).toHaveAccessibleName("January 1971");
        });
        it(
          "sets focus on the same day of the same week. " +
            "if that day does not exist, then moves focus to the same day of the previous or next week",
          async () => {
            setup(new Date(0));
            await user.click(screen.getByRole("button"));
            await user.keyboard("{Shift>}{PageDown}{/Shift}");
            expect(screen.queryByText("01")).toHaveFocus();
          }
        );
      });
    });
  });
});
