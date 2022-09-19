import {
  Children,
  cloneElement,
  ComponentProps,
  createContext,
  ElementType,
  isValidElement,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
} from "react";
import { tabbable } from "tabbable";
import type { PCP } from "utils/types";

type State = {
  labelledby: string;
  describedby: string;
};
const Context = createContext<State | null>(null);
function useDialogContext(message?: string) {
  const context = useContext(Context);
  if (!context) {
    throw new Error(message);
  }
  return context;
}

function Description<E extends ElementType>(props: PCP<E, {}>) {
  const context = useDialogContext(
    `<Dialog.Description> cannot be rendered outside <Dialog />`
  );
  const Comp = props.as ?? "div";
  return <Comp id={context.describedby} {...props} />;
}

function Title<E extends ElementType>(props: PCP<E, {}>) {
  const context = useDialogContext(
    `<Dialog.Title> cannot be rendered outside <Dialog />`
  );
  const Comp = props.as ?? "h2";
  return <Comp id={context.labelledby} {...props} />;
}

type BackdropProps = ComponentProps<"div">;
function Backdrop(props: BackdropProps) {
  if (props.children) {
    return <div {...props}>{props.children}</div>;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backdropFilter: "brightness(30%)",
      }}
      {...props}
    />
  );
}

function focus(node?: HTMLElement | null) {
  return node?.focus();
}

const IS_TEST_ENV = process.env.NODE_ENV !== "test";

type DialogProps = ComponentProps<"div"> & {
  onDismiss?: () => void;
  initialFocusRef?: RefObject<HTMLElement>;
  previousFocusRef?: RefObject<HTMLElement>;
};
export function Dialog(_props: DialogProps) {
  const { children, onDismiss, initialFocusRef, previousFocusRef, ...props } =
    _props;

  const onClose = useCallback(() => {
    onDismiss?.();
    focus(previousFocusRef?.current);
  }, [onDismiss, previousFocusRef?.current]);

  let backdrop: ReactNode | undefined = undefined;
  Children.forEach(children, (element) => {
    if (!isValidElement(element)) return;

    if (element.type === Backdrop) {
      const onClick = () => {
        element.props.onClick?.();
        onClose();
      };
      backdrop = cloneElement(element, { ...element.props, onClick });
    }
  });

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const tabbables = tabbable(element, {
      displayCheck: IS_TEST_ENV,
    }) as HTMLElement[];

    if (!element.contains(document.activeElement)) {
      focus(initialFocusRef?.current ?? tabbables.at(0));
    }

    function onKeyDown(event: KeyboardEvent) {
      if (!(document.activeElement instanceof HTMLElement)) return;
      if (!element?.contains(document.activeElement)) return;

      const index = tabbables.indexOf(document.activeElement);
      const { key, shiftKey } = event;

      if (shiftKey && key === "Tab") {
        event.preventDefault();
        const nextFocusIndex = (index - 1) % tabbables.length;
        return focus(tabbables.at(nextFocusIndex));
      }
      if (key === "Tab") {
        event.preventDefault();
        const nextFocusIndex = (index + 1) % tabbables.length;
        return focus(tabbables.at(nextFocusIndex));
      }
      if (key === "Escape") {
        event.preventDefault();
        return onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => void window.removeEventListener("keydown", onKeyDown);
  }, [ref.current, initialFocusRef?.current, onClose]);

  const id = useId();
  const context = {
    labelledby: id + "labelledby",
    describedby: id + "describedby",
  };

  return (
    <Context.Provider value={context}>
      {backdrop ?? <Backdrop onClick={onDismiss} />}
      <div
        {...props}
        aria-modal="true"
        role="dialog"
        aria-labelledby={props["aria-label"] ? undefined : context.labelledby}
        aria-describedby={context.describedby}
        ref={ref}
      >
        {Children.map(children, (element) => {
          if (isValidElement(element) && element.type === Backdrop) {
            return;
          }

          return element;
        })}
      </div>
    </Context.Provider>
  );
}

Dialog.Title = Title;
Dialog.Description = Description;
Dialog.Backdrop = Backdrop;
