import {
  eachDayOfInterval,
  endOfMonth,
  getDay,
  isSameDay,
  startOfMonth,
  Day,
  format,
} from "date-fns";
import { concat, range, repeat, splitEvery } from "ramda";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  ReactNode,
  useContext,
} from "react";
import { Context as CalendarContext } from "./Calendar";

const getDatesInMonth = (focusOn: Date) =>
  eachDayOfInterval({
    start: startOfMonth(focusOn),
    end: endOfMonth(focusOn),
  });

const focus = (isFocus: boolean) =>
  isFocus
    ? {
        tabIndex: 0,
        ref: (el: HTMLElement | null) => el?.focus(),
      }
    : {
        tabIndex: -1,
      };

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

type ColumnHeaderProps = {
  children?: (day: Day) => ReactNode;
  className?: string;
};
function ColumnHeader(props: ColumnHeaderProps) {
  useMonthCalendarContext(
    `<ColumnHeader /> cannot be rendered outside <MonthCalendar />`
  );

  if (props.children) {
    return <>{(range(0, 7) as Day[]).map(props.children)}</>;
  }

  return (
    <>
      <th className={props.className} abbr="Sunday">
        Su
      </th>
      <th className={props.className} abbr="Monday">
        Mo
      </th>
      <th className={props.className} abbr="Tuesday">
        Tu
      </th>
      <th className={props.className} abbr="Wednesday">
        We
      </th>
      <th className={props.className} abbr="Thursday">
        Th
      </th>
      <th className={props.className} abbr="Friday">
        Fr
      </th>
      <th className={props.className} abbr="Saturday">
        Sa
      </th>
    </>
  );
}

type GridCellProps = {
  children?: (date: Date) => ReactNode;
  className?: string;
};
function GridCell(props: GridCellProps) {
  const context = useMonthCalendarContext(
    `<GridCell /> cannot be rendered outside <MonthCalendar />`
  );

  const { table, focus: focusOn } = context;

  return (
    <>
      {table.map((row, index) => (
        <tr key={index}>
          {row.map((day, index) => {
            const element = day && props.children?.(day);

            // if child is valid react element, pass focus to the child
            if (isValidElement<{}>(element)) {
              return (
                <td key={index} className={props.className}>
                  {cloneElement(element, {
                    ...element.props,
                    ...focus(Boolean(day && isSameDay(day, focusOn))),
                  })}
                </td>
              );
            }

            return (
              <td
                key={index}
                className={props.className}
                {...focus(Boolean(day && isSameDay(day, focusOn)))}
              >
                {element || (day && format(day, "dd"))}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

type MonthCalendarProps = {
  focus?: Date;
  children?: ReactNode;
  className?: string;
};
export const MonthCalendar = (props: MonthCalendarProps) => {
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

  const focus = props.focus ?? context?.focus ?? new Date();

  const days = concat(
    repeat(undefined, getDay(startOfMonth(focus))),
    getDatesInMonth(focus)
  );

  const table = splitEvery(7, days);

  return (
    <Context.Provider value={{ focus, table }}>
      <table role="grid" className={props.className}>
        <thead>
          <tr>{columnheader}</tr>
        </thead>
        <tbody>{gridcell}</tbody>
      </table>
    </Context.Provider>
  );
};

MonthCalendar.ColumnHeader = ColumnHeader;
MonthCalendar.GridCell = GridCell;
