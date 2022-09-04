import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { concat, repeat, splitEvery } from "ramda";

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

type MonthCalendarProps = {
  focus?: Date;
};
export const MonthCalendar = (props: MonthCalendarProps) => {
  const focusOn = props.focus ?? new Date();

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
