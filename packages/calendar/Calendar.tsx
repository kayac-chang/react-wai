import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  startOfMonth,
  startOfWeek,
  sub,
} from "date-fns";
import { concat, repeat, splitEvery } from "ramda";
import { useEffect, useReducer, useState } from "react";

function useKeyPress() {
  const [isPress, setPress] = useState<string | undefined>(undefined);

  useEffect(() => {
    const keydown = ({ key }: KeyboardEvent) => setPress(key);
    const keyup = ({ key }: KeyboardEvent) =>
      isPress === key && setPress(undefined);

    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);

    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    };
  }, [isPress, setPress]);

  return isPress;
}

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

function Reducer(focusOn: Date, key: string) {
  if (key === "ArrowDown") {
    return add(focusOn, { weeks: 1 });
  }

  if (key === "ArrowUp") {
    return sub(focusOn, { weeks: 1 });
  }

  if (key === "ArrowLeft") {
    return sub(focusOn, { days: 1 });
  }

  if (key === "ArrowRight") {
    return add(focusOn, { days: 1 });
  }

  if (key === "Home") {
    return startOfWeek(focusOn);
  }

  if (key === "End") {
    return endOfWeek(focusOn);
  }

  return focusOn;
}

type MonthCalendarProps = {
  focusOn?: Date;
};
export const MonthCalendar = (props: MonthCalendarProps) => {
  const [focusOn, dispatch] = useReducer(Reducer, props.focusOn ?? new Date());

  const keypress = useKeyPress();
  useEffect(() => {
    if (keypress) dispatch(keypress);
  }, [keypress]);

  const days = concat(
    repeat(undefined, getDay(startOfMonth(focusOn))),
    getDatesInMonth(focusOn)
  );

  const table = splitEvery(7, days);

  return (
    <table role="grid">
      <thead>
        <tr>
          <th abbr="Sunday">Su</th>
          <th abbr="Monday">Mo</th>
          <th abbr="Tuesday">Tu</th>
          <th abbr="Wednesday">We</th>
          <th abbr="Thursday">Th</th>
          <th abbr="Friday">Fr</th>
          <th abbr="Saturday">Sa</th>
        </tr>
      </thead>
      <tbody>
        {table.map((row, index) => (
          <tr key={index}>
            {row.map((day, index) => (
              <td
                key={index}
                {...focus(Boolean(day && isSameDay(day, focusOn)))}
              >
                {day ? format(day, "dd") : null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
