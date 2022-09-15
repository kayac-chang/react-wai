/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MonthCalendar } from "../MonthCalendar";
import { add, eachDayOfInterval, endOfMonth, format } from "date-fns";

describe("<MonthCalendar />", () => {
  describe("weekday header", () => {
    it.each([
      ["Su", "Sunday"],
      ["Mo", "Monday"],
      ["Tu", "Tuesday"],
      ["We", "Wednesday"],
      ["Th", "Thursday"],
      ["Fr", "Friday"],
      ["Sa", "Saturday"],
    ])("the day %s in the column headers", (name, abbr) => {
      render(
        <MonthCalendar.Table>
          <MonthCalendar.ColumnHeader />
        </MonthCalendar.Table>
      );

      const el = screen.getByRole("columnheader", { name });
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute("abbr", abbr);
    });
  });

  describe("Date Grid", () => {
    it("identifies the table element as a grid widget", () => {
      render(<MonthCalendar.Table />);

      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    describe("if focus on january 1970", () => {
      it("should render days in month correctly", () => {
        render(
          <MonthCalendar.Table focus={new Date(0)}>
            <MonthCalendar.GridCell />
          </MonthCalendar.Table>
        );

        eachDayOfInterval({
          start: new Date(0),
          end: endOfMonth(new Date(0)),
        }).forEach((day) =>
          expect(
            screen.queryByText(RegExp(format(day, "dd")))
          ).toBeInTheDocument()
        );
      });

      it("first day should thursday", () => {
        render(
          <MonthCalendar.Table focus={new Date(0)}>
            <MonthCalendar.GridCell />
          </MonthCalendar.Table>
        );

        expect(screen.getAllByRole(/(grid)?cell/).at(4))
          //
          .toHaveTextContent("01");
      });

      it("change focus to february 1970, first day should be sunday", () => {
        const first = new Date(0);
        const { rerender } = render(
          <MonthCalendar.Table focus={first}>
            <MonthCalendar.GridCell />
          </MonthCalendar.Table>
        );
        expect(screen.getAllByRole(/(grid)?cell/).at(4))
          //
          .toHaveTextContent("01");

        const second = add(new Date(0), { months: 1 });
        rerender(
          <MonthCalendar.Table focus={second}>
            <MonthCalendar.GridCell />
          </MonthCalendar.Table>
        );
        expect(screen.getAllByRole(/(grid)?cell/).at(0))
          //
          .toHaveTextContent("01");
      });
    });

    describe("makes the cell focusable, and implement roving tabindex", () => {
      it(`set tabindex="0" on the element that will initially be included in the tab sequence`, () => {
        render(
          <MonthCalendar.Table focus={new Date(0)}>
            <MonthCalendar.GridCell />
          </MonthCalendar.Table>
        );

        expect(
          screen
            .queryAllByRole(/(grid)?cell/)
            .filter((element) => element.getAttribute("tabindex") === "0")
        ).toHaveLength(1);
      });

      it(`set tabindex="-1" on all other focusable elements it contains`, () => {
        render(
          <MonthCalendar.Table focus={new Date(0)}>
            <MonthCalendar.GridCell />
          </MonthCalendar.Table>
        );

        expect(
          screen
            .queryAllByRole(/(grid)?cell/)
            .filter((element) => element.getAttribute("tabindex") === "-1")
        ).toHaveLength(34);
      });
    });
  });
});
