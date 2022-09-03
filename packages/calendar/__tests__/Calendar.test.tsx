/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MonthCalendar } from "../Calendar";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfWeek,
  sub,
} from "date-fns";

describe("<MonthCalendar />", () => {
  describe("WeekDay Header", () => {
    it.each([
      ["Su", "Sunday"],
      ["Mo", "Monday"],
      ["Tu", "Tuesday"],
      ["We", "Wednesday"],
      ["Th", "Thursday"],
      ["Fr", "Friday"],
      ["Sa", "Saturday"],
    ])("the day %s in the column headers", (name, abbr) => {
      const el = render(<MonthCalendar />).getByRole("columnheader", { name });
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute("abbr", abbr);
    });
  });

  describe("Date Grid", () => {
    //
    it("Identifies the table element as a grid widget.", () =>
      expect(render(<MonthCalendar />).getByRole("grid")).toBeInTheDocument());

    describe("If focusOn is January 1970", () => {
      it("Should render days in month correctly", () =>
        eachDayOfInterval({
          start: new Date(0),
          end: endOfMonth(new Date(0)),
        }).forEach((day) =>
          expect(
            render(<MonthCalendar focusOn={new Date(0)} />).container
          ).toHaveTextContent(RegExp(format(day, "dd")))
        ));

      it("the first day should Thursday", () =>
        expect(
          render(<MonthCalendar focusOn={new Date(0)} />)
            .getAllByRole(/(grid)?cell/)
            .at(4)
        ).toHaveTextContent(RegExp(format(new Date(0), "dd"))));
    });

    describe("Makes the cell focusable, and implement Roving tabindex", () => {
      //
      describe("When the component container is loaded or created", () => {
        it("If focusOn is January 1970, should be focus on January 1970", () => {
          render(<MonthCalendar focusOn={new Date(0)} />);

          expect(document.activeElement).toHaveTextContent(
            RegExp(format(new Date(0), "dd"))
          );
        });

        it("Default focus on today", () => {
          render(<MonthCalendar />);

          expect(document.activeElement).toHaveTextContent(
            RegExp(format(new Date(), "dd"))
          );
        });

        it(`Set tabindex="0" on the element that will initially be included in the tab sequence`, () => {
          render(<MonthCalendar />);

          expect(document.activeElement).toHaveAttribute("tabindex", "0");
        });

        it(`Set tabindex="-1" on all other focusable elements it contains.`, () => {
          Array.from(
            render(<MonthCalendar />).container.querySelectorAll(`[tabindex]`)
          )
            .filter((el) => el !== document.activeElement)
            .forEach((el) => expect(el).toHaveAttribute("tabindex", "-1"));
        });
      });

      describe("When the component contains focus and the user presses a navigation key", () => {
        it(`set tabindex="-1" on the element that has tabindex="0"`, async () => {
          const user = userEvent.setup();

          const element = render(
            <MonthCalendar focusOn={new Date(0)} />
          ).getByText(format(new Date(0), "dd"));

          expect(element).toHaveAttribute("tabindex", "0");

          await user.keyboard("[ArrowDown]");
          expect(element).toHaveAttribute("tabindex", "-1");

          await user.keyboard("[ArrowUp]");
          expect(element).toHaveAttribute("tabindex", "0");

          await user.keyboard("[ArrowLeft]");
          expect(element).toHaveAttribute("tabindex", "-1");

          await user.keyboard("[ArrowRight]");
          expect(element).toHaveAttribute("tabindex", "0");
        });

        it(`set tabindex="0" on the element that will become focused`, async () => {
          const user = userEvent.setup();

          let current = new Date(0);
          const { getByText } = render(<MonthCalendar focusOn={current} />);
          expect(getByText(format(current, "dd")))
            //
            .toHaveAttribute("tabindex", "0");

          await user.keyboard("[ArrowDown]");
          current = add(current, { weeks: 1 });
          expect(getByText(format(current, "dd")))
            //
            .toHaveAttribute("tabindex", "0");

          await user.keyboard("[ArrowUp]");
          current = sub(current, { weeks: 1 });
          expect(getByText(format(current, "dd")))
            //
            .toHaveAttribute("tabindex", "0");

          await user.keyboard("[ArrowLeft]");
          current = sub(current, { days: 1 });
          expect(getByText(format(current, "dd")))
            //
            .toHaveAttribute("tabindex", "0");

          await user.keyboard("[ArrowRight]");
          current = add(current, { days: 1 });
          expect(getByText(format(current, "dd")))
            //
            .toHaveAttribute("tabindex", "0");

          await user.keyboard("[Home]");
          current = startOfWeek(current);
          expect(getByText(format(current, "dd")))
            //
            .toHaveAttribute("tabindex", "0");

          await user.keyboard("[End]");
          current = endOfWeek(current);
          expect(getByText(format(current, "dd")))
            //
            .toHaveAttribute("tabindex", "0");
        });

        it(`Set focus, element.focus(), on the element that has tabindex="0"`, async () => {
          const user = userEvent.setup();

          let current = new Date(0);
          const { getByText } = render(<MonthCalendar focusOn={current} />);
          expect(getByText(format(current, "dd"))).toHaveFocus();

          await user.keyboard("[ArrowDown]");
          current = add(current, { weeks: 1 });
          expect(getByText(format(current, "dd"))).toHaveFocus();

          await user.keyboard("[ArrowUp]");
          current = sub(current, { weeks: 1 });
          expect(getByText(format(current, "dd"))).toHaveFocus();

          await user.keyboard("[ArrowLeft]");
          current = sub(current, { days: 1 });
          expect(getByText(format(current, "dd"))).toHaveFocus();

          await user.keyboard("[ArrowRight]");
          current = add(current, { days: 1 });
          expect(getByText(format(current, "dd"))).toHaveFocus();

          await user.keyboard("[Home]");
          current = startOfWeek(current);
          expect(getByText(format(current, "dd"))).toHaveFocus();

          await user.keyboard("[End]");
          current = endOfWeek(current);
          expect(getByText(format(current, "dd"))).toHaveFocus();
        });
      });
    });
  });
});
