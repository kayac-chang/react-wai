import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { add, endOfWeek, format, startOfWeek, sub } from "date-fns";
import { describe, expect, it } from "vitest";
import { Calendar } from "../Calendar";
import { MonthCalendar } from "../MonthCalendar";

describe("<Calendar />", () => {
  describe("calendar should render correctly", () => {
    it("should render button for change previous/next month/year", () => {
      render(<Calendar />);
      expect(screen.getByRole("button", { name: /previous year/ }));
      expect(screen.getByRole("button", { name: /previous month/ }));
      expect(screen.getByRole("button", { name: /next year/ }));
      expect(screen.getByRole("button", { name: /next month/ }));
    });

    it("calendar heading displaying the month and year is marked up as a live region", () => {
      render(<Calendar value={new Date(0)} />);
      const element = screen.getByRole("heading");
      expect(element).toHaveTextContent("January 1970");
      expect(element).toHaveAttribute("aria-live", "polite");
    });
  });
});

describe("Integration: Calendar with MonthCalendar", () => {
  const setup = () => {
    userEvent.setup();
    render(
      <Calendar value={new Date(0)}>
        {(focus) => <MonthCalendar focus={focus} />}
      </Calendar>
    );
  };

  it("when click previous/next month, should change the month and year displayed in the calendar", async () => {
    setup();

    const nextMonth = screen.getByRole("button", { name: /next month/ });
    const prevMonth = screen.getByRole("button", { name: /previous month/ });
    const nextYear = screen.getByRole("button", { name: /next year/ });
    const prevYear = screen.getByRole("button", { name: /previous year/ });

    expect(screen.getAllByRole(/(grid)?cell/).at(4)).toHaveTextContent("01");
    expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("31");
    expect(screen.getByRole("heading")).toHaveTextContent("January 1970");

    await userEvent.click(nextMonth);
    expect(screen.getAllByRole(/(grid)?cell/).at(0)).toHaveTextContent("01");
    expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("28");
    expect(screen.getByRole("heading")).toHaveTextContent("February 1970");

    await userEvent.click(prevMonth);
    expect(screen.getAllByRole(/(grid)?cell/).at(4)).toHaveTextContent("01");
    expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("31");
    expect(screen.getByRole("heading")).toHaveTextContent("January 1970");

    await userEvent.click(nextYear);
    expect(screen.getAllByRole(/(grid)?cell/).at(5)).toHaveTextContent("01");
    expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("31");
    expect(screen.getByRole("heading")).toHaveTextContent("January 1971");

    await userEvent.click(prevYear);
    expect(screen.getAllByRole(/(grid)?cell/).at(4)).toHaveTextContent("01");
    expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("31");
    expect(screen.getByRole("heading")).toHaveTextContent("January 1970");
  });

  it("user can change month/year using keyboard", async () => {
    setup();

    await userEvent.keyboard("{PageDown}");
    expect(screen.getByRole("heading")).toHaveTextContent("February 1970");

    await userEvent.keyboard("{PageUp}");
    expect(screen.getByRole("heading")).toHaveTextContent("January 1970");

    await userEvent.keyboard("{Shift>}{PageDown}{/Shift}");
    expect(screen.getByRole("heading")).toHaveTextContent("January 1971");

    await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
    expect(screen.getByRole("heading")).toHaveTextContent("January 1970");
  });

  it(
    "Sets focus on the same day of the same week." +
      "If that day does not exist, then moves focus to the same day of the previous or next week.",
    async () => {
      setup();

      let index = screen
        .getAllByRole(/(grid)?cell/)
        .findIndex((el) => el === document.activeElement);
      expect(index % 7).toBe(4);

      await userEvent.keyboard("{PageDown}");
      index = screen
        .getAllByRole(/(grid)?cell/)
        .findIndex((el) => el === document.activeElement);
      expect(index % 7).toBe(0);

      await userEvent.keyboard("{PageUp}");
      index = screen
        .getAllByRole(/(grid)?cell/)
        .findIndex((el) => el === document.activeElement);
      expect(index % 7).toBe(4);

      await userEvent.keyboard("{Shift>}{PageDown}{/Shift}");
      index = screen
        .getAllByRole(/(grid)?cell/)
        .findIndex((el) => el === document.activeElement);
      expect(index % 7).toBe(5);

      await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
      index = screen
        .getAllByRole(/(grid)?cell/)
        .findIndex((el) => el === document.activeElement);
      expect(index % 7).toBe(4);
    }
  );

  describe("When the component contains focus and the user presses a navigation key", () => {
    it(`set tabindex="-1" on the element that has tabindex="0"`, async () => {
      setup();

      const element = screen.getByText("01");
      expect(element).toHaveAttribute("tabindex", "0");

      await userEvent.keyboard("[ArrowDown]");
      expect(element).toHaveAttribute("tabindex", "-1");

      await userEvent.keyboard("[ArrowUp]");
      expect(element).toHaveAttribute("tabindex", "0");

      await userEvent.keyboard("[ArrowLeft]");
      expect(element).toHaveAttribute("tabindex", "-1");

      await userEvent.keyboard("[ArrowRight]");
      expect(element).toHaveAttribute("tabindex", "0");
    });

    it(`set tabindex="0" on the element that will become focused`, async () => {
      setup();

      let current = new Date(0);
      const getByText = screen.getByText;
      expect(getByText(format(current, "dd")))
        //
        .toHaveAttribute("tabindex", "0");

      await userEvent.keyboard("[ArrowDown]");
      current = add(current, { weeks: 1 });
      expect(getByText(format(current, "dd")))
        //
        .toHaveAttribute("tabindex", "0");

      await userEvent.keyboard("[ArrowUp]");
      current = sub(current, { weeks: 1 });
      expect(getByText(format(current, "dd")))
        //
        .toHaveAttribute("tabindex", "0");

      await userEvent.keyboard("[ArrowLeft]");
      current = sub(current, { days: 1 });
      expect(getByText(format(current, "dd")))
        //
        .toHaveAttribute("tabindex", "0");

      await userEvent.keyboard("[ArrowRight]");
      current = add(current, { days: 1 });
      expect(getByText(format(current, "dd")))
        //
        .toHaveAttribute("tabindex", "0");

      await userEvent.keyboard("[Home]");
      current = startOfWeek(current);
      expect(getByText(format(current, "dd")))
        //
        .toHaveAttribute("tabindex", "0");

      await userEvent.keyboard("[End]");
      current = endOfWeek(current);
      expect(getByText(format(current, "dd")))
        //
        .toHaveAttribute("tabindex", "0");
    });

    it(`Set focus, element.focus(), on the element that has tabindex="0"`, async () => {
      setup();

      let current = new Date(0);
      const getByText = screen.getByText;
      expect(getByText(format(current, "dd"))).toHaveFocus();

      await userEvent.keyboard("[ArrowDown]");
      current = add(current, { weeks: 1 });
      expect(getByText(format(current, "dd"))).toHaveFocus();

      await userEvent.keyboard("[ArrowUp]");
      current = sub(current, { weeks: 1 });
      expect(getByText(format(current, "dd"))).toHaveFocus();

      await userEvent.keyboard("[ArrowLeft]");
      current = sub(current, { days: 1 });
      expect(getByText(format(current, "dd"))).toHaveFocus();

      await userEvent.keyboard("[ArrowRight]");
      current = add(current, { days: 1 });
      expect(getByText(format(current, "dd"))).toHaveFocus();

      await userEvent.keyboard("[Home]");
      current = startOfWeek(current);
      expect(getByText(format(current, "dd"))).toHaveFocus();

      await userEvent.keyboard("[End]");
      current = endOfWeek(current);
      expect(getByText(format(current, "dd"))).toHaveFocus();
    });
  });
});
