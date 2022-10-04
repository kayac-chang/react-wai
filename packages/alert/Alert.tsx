import type { PCP } from "utils/types";

export function Alert(props: PCP<"div", {}>) {
  return <div {...props} role="alert" />;
}
