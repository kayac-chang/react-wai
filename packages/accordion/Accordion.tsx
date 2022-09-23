import { ReactNode, useContext, useId, useState } from "react";
import { createContext } from "react";
import type { PCP } from "utils/types";

interface State {
  open: boolean;
  toggle: () => void;
  id: {
    controls: string;
    labelledby: string;
  };
}
const Context = createContext<State | null>(null);

function useItemContext(error: string) {
  const context = useContext(Context);
  if (!context) {
    throw new Error(error);
  }
  return context;
}

type ItemProps = {
  children?: ReactNode;
};
function Item(props: ItemProps) {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen(!open);
  const _id = useId();
  const id = {
    controls: _id + "controls",
    labelledby: _id + "labelledby",
  };
  return (
    <Context.Provider value={{ open, toggle, id }}>
      {props.children}
    </Context.Provider>
  );
}

type HeaderProps = PCP<"h2", {}>;
function Header(props: HeaderProps) {
  const context = useItemContext(
    `<Accordion.Header /> cannot be rendered outside <Accordion />`
  );
  const Comp = props.as ?? "h2";
  return (
    <Comp>
      <button
        type="button"
        id={context.id.labelledby}
        aria-expanded={context.open}
        aria-controls={context.id.controls}
        onClick={context.toggle}
      >
        {props.children}
      </button>
    </Comp>
  );
}

type PanelProps = PCP<"div", {}>;
function Panel(props: PanelProps) {
  const context = useItemContext(
    `<Accordion.Panel /> cannot be rendered outside <Accordion />`
  );
  const role = context.open ? "region" : undefined;
  return (
    <div
      {...props}
      role={role}
      id={context.id.controls}
      aria-labelledby={context.id.labelledby}
    >
      {context.open && props.children}
    </div>
  );
}

type AccordionProps = {
  children?: ReactNode;
};
export function Accordion(props: AccordionProps) {
  return <>{props.children}</>;
}

Accordion.Item = Item;
Accordion.Header = Header;
Accordion.Panel = Panel;
