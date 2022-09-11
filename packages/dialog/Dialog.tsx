import {
  Children,
  cloneElement,
  ComponentProps,
  isValidElement,
  useId,
} from "react";

type DescriptionProps = ComponentProps<"div">;
function Description(props: DescriptionProps) {
  return <div {...props} />;
}

type TitleProps = ComponentProps<"h2">;
function Title(props: TitleProps) {
  return <h2 {...props} />;
}

type DialogProps = ComponentProps<"div">;
export function Dialog(props: DialogProps) {
  const id = useId();

  let labelledby: string | undefined = undefined;
  let describedby: string | undefined = undefined;
  Children.forEach(props.children, (element) => {
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

  return (
    <div
      {...props}
      aria-modal="true"
      role="dialog"
      aria-labelledby={labelledby}
      aria-describedby={describedby}
    >
      {Children.map(props.children, (element) => {
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
