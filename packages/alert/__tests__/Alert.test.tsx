/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "../Alert";

describe("<Alert />", () => {
  describe("role, property, state, and tabindex attributes", () => {
    it("identifies the element as the container where alert content will be added or updated", () => {
      render(<Alert>Hello</Alert>);
      expect(screen.queryByRole("alert")).toBeInTheDocument();
    });
  });
});
