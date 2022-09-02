/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import Calendar from "../Calendar";

describe("<Calendar />", () => {
  it("rendering", async () => {
    render(<Calendar />);
  });
});
