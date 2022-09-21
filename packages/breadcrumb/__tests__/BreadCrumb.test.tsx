/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BreadCrumb } from "../BreadCrumb";

describe("<BreadCrumb />", () => {
  function setup() {
    render(
      <BreadCrumb separator="/">
        <BreadCrumb.Path href="../../">
          WAI-ARIA Authoring Practices
        </BreadCrumb.Path>
        <BreadCrumb.Path href="/WAI/ARIA/apg/patterns/">
          Design Patterns
        </BreadCrumb.Path>
        <BreadCrumb.Path href="/WAI/ARIA/apg/patterns/breadcrumb/">
          Breadcrumb Pattern
        </BreadCrumb.Path>
        <BreadCrumb.Path href="index.html" current>
          Breadcrumb Example
        </BreadCrumb.Path>
      </BreadCrumb>
    );
  }

  describe("accessibility features", () => {
    it("the set of links is structured using an ordered list", () => {
      render(<BreadCrumb />);
      expect(screen.getByRole("list").tagName).toMatch(/ol/i);
    });

    it(
      "a nav element labeled breadcrumb identifies the structure as a breadcrumb trail " +
        "and makes it a navigation landmark so that it is easy to locate.",
      () => {
        render(<BreadCrumb />);
        expect(screen.queryByRole("navigation")).toBeInTheDocument();
      }
    );

    describe("to prevent screen reader announcement of the visual separators between links", () => {
      it(
        "the separators are part of the visual presentation that signifies the breadcrumb trail, " +
          "which is already semantically represented by the nav element with its label of breadcrumb. " +
          "so, using a display technique that is not represented in the accessibility tree " +
          "used by screen readers prevents redundant and potentially distracting verbosity.",
        () => {
          setup();
          screen.getAllByText("/").forEach((item) => {
            expect(item).not.toHaveAccessibleName();
          });
        }
      );
    });
  });

  describe("role, property, state, and tabindex attributes", () => {
    describe('aria-label="Breadcrumb"', () => {
      it("provides a label that describes the type of navigation provided in the nav element", () => {
        setup();
        expect(screen.queryByRole("navigation")).toHaveAccessibleName(
          /BreadCrumb/i
        );
      });
    });

    describe('aria-current="page"', () => {
      it("applied to the last link in the set to indicate that it represents the current page", () => {
        setup();

        expect(screen.getAllByRole("link").at(-1)).toHaveAttribute(
          "aria-current",
          "page"
        );
      });
    });
  });
});
