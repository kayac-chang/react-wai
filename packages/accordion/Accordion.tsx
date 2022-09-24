import {
  Children,
  cloneElement,
  Context,
  createContext,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { PCP } from "utils/types";
import { useContextWithError } from "utils/hooks";

interface ItemState {
  open: boolean;
  toggle: () => void;
  id: {
    controls: string;
    labelledby: string;
  };
}
const ItemContext = createContext<ItemState | null>(null);
function useItemContext(error: string) {
  return useContextWithError(ItemContext, error);
}

interface SingleState {
  expand?: string;
  setExpand: (expand?: string) => void;
}
const Context = createContext<SingleState | null>(null);

function useContext(error: string) {
  return useContextWithError(Context, error);
}

type ItemProps = {
  id?: string;
  children?: ReactNode;
  open?: boolean;
};
function Item(props: ItemProps) {
  const context = useContext(
    `<Accordion.Item /> cannot be rendered outside <Accordion />`
  );
  const id = {
    controls: props.id + "controls",
    labelledby: props.id + "labelledby",
  };
  const open = context.expand === props.id;
  const toggle = () => context.setExpand(props.id);
  return (
    <ItemContext.Provider value={{ open, toggle, id }}>
      {props.children}
    </ItemContext.Provider>
  );
}

type HeaderProps = PCP<"h2", {}>;
function Header(props: HeaderProps) {
  const context = useItemContext(
    `<Accordion.Header /> cannot be rendered outside <Accordion />`
  );
  const Comp = props.as ?? "h2";

  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (document.activeElement !== ref.current) return;

      if (event.code === "Space") {
        event.preventDefault();
        context.toggle();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [context.toggle]);

  return (
    <Comp>
      <button
        ref={ref}
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

type SingleProps = {
  children?: ReactNode;
};
function Single(props: SingleProps) {
  const id = useId();

  const ids: string[] = [];
  Children.forEach(props.children, (element, index) => {
    if (isValidElement(element) && element.type === Item) {
      ids.push(element.props.id ?? id + index);
    }
  });

  const [expand, _setExpand] = useState<string | undefined>(ids[0]);

  const setExpand = (id?: string) => {
    if (expand !== id) _setExpand(id);
  };

  return (
    <Context.Provider value={{ expand, setExpand }}>
      {Children.map(props.children, (element) => {
        if (isValidElement(element) && element.type === Item) {
          return cloneElement(element, { id: ids.shift(), ...element.props });
        }

        return element;
      })}
    </Context.Provider>
  );
}

type AccordionProps = {
  type?: "single";
  children?: ReactNode;
};
export function Accordion(props: AccordionProps) {
  return <Single>{props.children}</Single>;
}

Accordion.Item = Item;
Accordion.Header = Header;
Accordion.Panel = Panel;
