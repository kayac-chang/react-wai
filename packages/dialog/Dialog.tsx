import {
  Children,
  cloneElement,
  ComponentProps,
  isValidElement,
  useEffect,
  useId,
  useRef,
} from "react";
import { tabbable } from "tabbable";

type DescriptionProps = ComponentProps<"div">;
function Description(props: DescriptionProps) {
  return <div {...props} />;
}

type TitleProps = ComponentProps<"h2">;
function Title(props: TitleProps) {
  return <h2 {...props} />;
}

async function focus(node?: HTMLElement | null, defer?: boolean) {
  if (defer) {
    return Promise.resolve().then(() => node?.focus());
  }

  return node?.focus();
}

type DialogProps = ComponentProps<"div"> & {
  onDismiss?: (event: KeyboardEvent) => void;
};
export function Dialog(_props: DialogProps) {
  const { children, onDismiss, ...props } = _props;

  const id = useId();

  let labelledby: string | undefined = undefined;
  let describedby: string | undefined = undefined;
  Children.forEach(children, (element) => {
    if (!isValidElement(element)) return;

    if (element.type === Title) {
      labelledby = id + "label";
    }
    if (element.type === Description) {
      describedby = id + "description";
    }
  });

  if (!labelledby && !props["aria-label"]) {
    throw new Error(
      "dialog should has either: \n" +
        "- a value set for the aria-labelledby property that refers to a visible dialog title.\n" +
        "- a label specified by aria-label."
    );
  }

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const tabbables = tabbable(element, {
      displayCheck: process.env.NODE_ENV !== "test",
    }) as HTMLElement[];

    focus(tabbables.at(0));

    function onKeyDown(event: KeyboardEvent) {
      if (!(document.activeElement instanceof HTMLElement)) return;

      const index = tabbables.indexOf(document.activeElement);
      const { key, shiftKey } = event;

      if (shiftKey && key === "Tab") {
        return focus(tabbables.at((index - 1) % tabbables.length), true);
      }
      if (key === "Tab") {
        return focus(tabbables.at((index + 1) % tabbables.length), true);
      }

      if (key === "Esc") {
        return onDismiss?.(event);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => void window.removeEventListener("keydown", onKeyDown);
  }, [ref.current, onDismiss]);

  return (
    <div
      {...props}
      aria-modal="true"
      role="dialog"
      aria-labelledby={labelledby}
      aria-describedby={describedby}
      ref={ref}
    >
      {Children.map(children, (element) => {
        if (isValidElement(element)) {
          let id = undefined;

          if (element.type === Title) {
            id = labelledby;
          }
          if (element.type === Description) {
            id = describedby;
          }

          return cloneElement(element, { ...element.props, id });
        }

        return element;
      })}
    </div>
  );
}

Dialog.Title = Title;
Dialog.Description = Description;
