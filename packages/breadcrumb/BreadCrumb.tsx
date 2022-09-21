import { Children, isValidElement, ReactNode, ElementType } from "react";
import type { PCP } from "utils/types";

type PathProps<T extends ElementType = "a"> = PCP<
  T,
  {
    current?: boolean;
  }
>;
function Path<T extends ElementType = "a">(_props: PathProps<T>) {
  const { as, current, ...props } = _props;
  const Comp = as ?? "a";
  return <Comp aria-current={current ? "page" : undefined} {...props} />;
}

type _BreadCrumbProps = {
  separator?: ReactNode;
};
type BreadCrumbProps = PCP<"nav", _BreadCrumbProps>;
export function BreadCrumb(_props: BreadCrumbProps) {
  const { children, separator: _separator, ...props } = _props;

  const maxLength = Children.count(children);
  const isLastElement = (index: number) => index === maxLength - 1;
  const separator = (index: number) => {
    if (_separator && !isLastElement(index)) {
      return <li aria-hidden>{_separator}</li>;
    }
    return null;
  };

  return (
    <nav aria-label="Breadcrumb" {...props}>
      <ol>
        {Children.map(children, (element, index) => {
          if (!isValidElement(element) || element.type !== Path) return null;

          return (
            <>
              <li>{element}</li>
              {separator(index)}
            </>
          );
        })}
      </ol>
    </nav>
  );
}

BreadCrumb.Path = Path;
