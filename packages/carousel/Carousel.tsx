import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  ReactNode,
  useEffect,
  useId,
  useReducer,
  useRef,
} from "react";
import type { PCP } from "utils/types";
import { useContextWithError } from "utils/hooks";

interface State {
  items_id: string;
  index: number;
  next: () => void;
  prev: () => void;
  pause: () => void;
  start: () => void;
  auto_rotation: boolean;
}
const Context = createContext<State | null>(null);
function useCarouselContext(error: string) {
  return useContextWithError(Context, error);
}

type ItemProps = PCP<"div", {}>;
function Item(props: ItemProps) {
  return <div role="group" aria-roledescription="slide" {...props} />;
}

function mod(max: number, value: number) {
  return ((value % max) + max) % max;
}

function circular(min: number, max: number, value: number) {
  return mod(max - min + 1, value - min) + min;
}

type ItemsProps = PCP<"div", {}>;
function Items(props: ItemsProps) {
  const context = useCarouselContext(
    `<Carousel.Items /> cannot be rendered outside <Carousel />`
  );

  const items: ReturnType<typeof Item>[] = [];
  Children.forEach(props.children, (element) => {
    if (isValidElement(element) && element.type === Item) {
      items.push(element);
    }
  });

  const defaultItemLabel = (index: number) => `${index + 1} of ${items.length}`;
  const aria_live = context.auto_rotation ? "off" : "polite";
  return (
    <div aria-live={aria_live} id={context.items_id}>
      {items.map((item, index) =>
        cloneElement(item, {
          key: defaultItemLabel(index),
          "aria-label": defaultItemLabel(index),
          hidden:
            circular(0, items.length - 1, context.index) !== index
              ? true
              : undefined,
          ...item.props,
        })
      )}
    </div>
  );
}

type ButtonAction = "next" | "prev" | "toggle";
type ButtonProps = PCP<
  "button",
  {
    action?: ButtonAction;
    children: ((auto_rotation: boolean) => ReactNode) | ReactNode;
  }
>;
function Button(props: ButtonProps) {
  const context = useCarouselContext(
    `<Carousel.Button /> cannot be rendered outside <Carousel />`
  );
  const onClick = () => {
    if (props.action === "next") return context.next();
    if (props.action === "prev") return context.prev();
    if (props.action === "toggle")
      return context.auto_rotation ? context.pause() : context.start();
  };

  const children = (() => {
    if (typeof props.children === "function") {
      return props.children(context.auto_rotation);
    }
    return props.children;
  })();

  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (ref.current !== document.activeElement) return;

      if (event.key === "Space") {
        onClick();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [onClick]);

  return (
    <button
      ref={ref}
      type="button"
      aria-controls={context.items_id}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

function counterReducer(counter: number, action: "asc" | "desc") {
  if (action === "asc") return counter + 1;
  if (action === "desc") return counter - 1;
  return counter;
}

enum CarouselState {
  None = 0b0000,
  Hover = 0b0001,
  Focus = 0b0010,
  Pause = 0b0100,
}

function stateReducer(
  state: CarouselState,
  action: "enter" | "leave" | "focus" | "blur" | "pause" | "start"
) {
  if (action === "enter") return state | CarouselState.Hover;
  if (action === "leave") return state ^ CarouselState.Hover;
  if (action === "focus") return state | CarouselState.Focus;
  if (action === "blur") return state ^ CarouselState.Focus;
  if (action === "pause") return state | CarouselState.Pause;
  if (action === "start") return state ^ CarouselState.Pause;
  return state;
}

const contain = (x: number, y: number) => (x & y) === x;

type CarouselProps = PCP<
  "section",
  {
    interval?: number;
  }
>;
export function Carousel(props: CarouselProps) {
  const id = useId();
  const [index, counterDispatch] = useReducer(counterReducer, 0);
  const next = () => counterDispatch("asc");
  const prev = () => counterDispatch("desc");

  const [state, stateDispatch] = useReducer(stateReducer, CarouselState.None);
  const enter = () => stateDispatch("enter");
  const leave = () => stateDispatch("leave");
  const focus = () => stateDispatch("focus");
  const blur = () => stateDispatch("blur");
  const pause = () => stateDispatch("pause");
  const start = () => stateDispatch("start");

  const auto_rotation = (() => {
    if (contain(CarouselState.Pause, state)) return false;

    return state === CarouselState.None && Boolean(props.interval);
  })();

  const context = {
    items_id: id + "items",
    index,
    next,
    prev,
    pause,
    start,
    auto_rotation,
  };

  useEffect(() => {
    if (!auto_rotation) return;
    const id = setInterval(next, props.interval);
    return () => clearInterval(id);
  }, [auto_rotation, props.interval, next]);

  return (
    <Context.Provider value={context}>
      <section
        aria-roledescription="carousel"
        onPointerEnter={enter}
        onPointerLeave={leave}
        onFocusCapture={focus}
        onBlurCapture={blur}
        {...props}
      />
    </Context.Provider>
  );
}

Carousel.Item = Item;
Carousel.Items = Items;
Carousel.Button = Button;
