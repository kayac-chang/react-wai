/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import { Dialog } from "dialog";
import { Calendar, MonthCalendar } from "calendar";
import { DatePicker } from "../DatePicker";
import { format } from "date-fns";
import { useState, useRef } from "react";

describe("<DatePicker />", () => {
  function Comp(props: { value?: Date }) {
    const ref = useRef<HTMLElement>(null);
    const [focusWithinGrid, setFocusWithinGrid] = useState(false);

    return (
      <Calendar
        value={props.value}
        as={Dialog}
        initialFocusRef={ref}
        aria-label="Choose Date"
      >
        <Calendar.Header>
          <Calendar.Title />
          <Calendar.Button action="previous month" />
          <Calendar.Button action="next month" />
          <Calendar.Button action="previous year" />
          <Calendar.Button action="next year" />
        </Calendar.Header>

        <MonthCalendar.Table
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
        </MonthCalendar.Table>

        <span aria-live="polite">
          {focusWithinGrid && "Cursor keys can navigate dates"}
        </span>
      </Calendar>
    );
  }

  function setup(initialValue?: Date) {
    user.setup();
    return render(
      <DatePicker value={initialValue}>
        <DatePicker.Field />
        <DatePicker.Button action={{ type: "trigger calendar" }}>
          {({ value }) =>
            value
              ? `change date, ${format(value, "MM/dd/yyyy")}`
              : "choose date"
          }
        </DatePicker.Button>

        <DatePicker.Description>
          (date format: mm/dd/yyyy)
        </DatePicker.Description>

        {({ open, value }) => open && <Comp value={value} />}
      </DatePicker>
    );
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

      it("indicates the element that displays information about keyboard commands \
        for navigating the grid should be automatically announced by screen readers", async () => {
        setup();
        await user.click(screen.getByRole("button"));
        expect(
          screen.queryByText("Cursor keys can navigate dates")
        ).toBeInTheDocument();
        expect(
          screen.queryByText("Cursor keys can navigate dates")
        ).toHaveAttribute("aria-live");
      });

      it("the script slightly delays display of the information, \
        so screen readers are more likely to read it after information related to change of focus", async () => {
        setup();
        await user.click(screen.getByRole("button"));

        expect(
          screen.queryByText("Cursor keys can navigate dates")
        ).toBeInTheDocument();

        await user.keyboard("{Tab}");
        expect(
          screen.queryByText("Cursor keys can navigate dates")
        ).not.toBeInTheDocument();

        await user.keyboard("{Shift>}{Tab}{/Shift}");
        expect(
          screen.queryByText("Cursor keys can navigate dates")
        ).toBeInTheDocument();
      });
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
});
