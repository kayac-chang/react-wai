/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import { format } from "date-fns";
import { DatePicker } from "../DatePicker";

describe("<DatePicker />", () => {
  function setup(initialValue?: Date) {
    user.setup();
    return render(
      <DatePicker value={initialValue}>
        <DatePicker.Field format={(value) => format(value, "MM/dd/yyyy")} />
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
      </DatePicker>
    );
  }

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
  });
});
