import "vitest-axe/extend-expect";
import "vitest-dom/extend-expect";
import * as axeMatchers from "vitest-axe/matchers";
import * as domMatchers from "vitest-dom/matchers";
import { expect } from "vitest";

// @ts-ignore: @see https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#configuring-your-testing-environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

expect.extend(axeMatchers);
expect.extend(domMatchers);
