import {
  eachDayOfInterval,
  endOfMonth,
  getDay,
  startOfMonth,
  format,
  startOfWeek,
  add,
  isSameDay,
} from "date-fns";
import { concat, range, repeat, splitEvery } from "ramda";
import {
  Children,
  cloneElement,
  ComponentProps,
  createContext,
  forwardRef,
  isValidElement,
  RefObject,
  useContext,
} from "react";
import { Context as CalendarContext } from "./Calendar";
import type { ReactNode } from "react";
import type { EP } from "utils/types";

const getDatesInMonth = (focus: Date) =>
  eachDayOfInterval({
    start: startOfMonth(focus),
    end: endOfMonth(focus),
  });

interface State {
  focus: Date;
  table: (Date | undefined)[][];
}
const Context = createContext<State | null>(null);
function useMonthCalendarContext(error: string) {
  const context = useContext(Context);
  if (!context) {
    throw new Error(error);
  }
  return context;
}

type _ColumnHeaderProps = {
  abbr?: (day: Date) => string;
  children?: (day: Date) => ReactNode;
};
type ColumnHeaderProps = EP<"th", _ColumnHeaderProps>;
function ColumnHeader(props: ColumnHeaderProps) {
  useMonthCalendarContext(
    `<ColumnHeader /> cannot be rendered outside <MonthCalendar />`
  );

  return (
    <>
      {range(0, 7)
        .map((days) => add(startOfWeek(new Date()), { days }))
        .map((day) => (
          <th
            {...props}
            role="columnheader"
            abbr={props.abbr?.(day) ?? format(day, "EEEE")}
            children={props.children?.(day) ?? format(day, "EEEEEE")}
            key={day.toString()}
          />
        ))}
    </>
  );
}

export type GridCellProps = EP<
  "td",
  {
    children?: (date: Date) => ReactNode;
  }
>;
const GridCell = forwardRef<HTMLElement, GridCellProps>((_props, _ref) => {
  const context = useMonthCalendarContext(
    `<GridCell /> cannot be rendered outside <MonthCalendar />`
  );
  const { children, ...props } = _props;

  return (
    <>
      {context.table.map((row, index) => (
        <tr key={index}>
          {row.map((day, index) => {
            if (!day) {
              return <td key={index} {...props} tabIndex={-1} />;
            }

            const element = children?.(day);
            const tabIndex = isSameDay(day, context.focus) ? 0 : -1;
            const ref = isSameDay(day, context.focus) ? _ref : undefined;

            if (isValidElement(element)) {
              return (
                <td key={index} {...props}>
                  {cloneElement(element, { ...element.props, tabIndex, ref })}
                </td>
              );
            }

            return (
              <td
                key={index}
                {...props}
                tabIndex={tabIndex}
                ref={ref as RefObject<HTMLTableCellElement>}
              >
                {format(day, "dd")}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
});

export type GridProps = ComponentProps<"table"> & {
  focus?: Date;
};
const Grid = forwardRef<HTMLTableElement, GridProps>((props, ref) => {
  let columnheader: ReturnType<typeof ColumnHeader> | null = null;
  let gridcell: ReturnType<typeof GridCell> | null = null;

  Children.forEach(props.children, (element) => {
    if (!isValidElement(element)) return;

    if (!columnheader && element.type === ColumnHeader) {
      columnheader = element;
    }
    if (!gridcell && element.type === GridCell) {
      gridcell = element;
    }
  });

  const context = useContext(CalendarContext);

  let { focus, ...rest } = props;
  focus = focus ?? context?.focus ?? new Date();

  const days = concat(
    repeat(undefined, getDay(startOfMonth(focus))),
    getDatesInMonth(focus)
  );

  const table = splitEvery(7, days);

  return (
    <Context.Provider value={{ focus, table }}>
      <table
        {...rest}
        role="grid"
        ref={ref}
        aria-labelledby={context?.grid_label}
      >
        <thead role="rowgroup">
          <tr role="row">{columnheader}</tr>
        </thead>
        <tbody>{gridcell}</tbody>
      </table>
    </Context.Provider>
  );
});

export const MonthCalendar = {
  Grid,
  ColumnHeader,
  GridCell,
};
