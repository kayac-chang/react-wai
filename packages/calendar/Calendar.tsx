import { add, endOfWeek, format, startOfWeek, sub } from "date-fns";
import { Dispatch, ReactNode, useEffect, useReducer } from "react";

type Control = "previous" | "next" | "start of" | "end of";
type Unit = "year" | "month" | "week" | "day";
type Action = `${Control} ${Unit}`;
function reducer(date: Date, action: Action) {
  if (action === "previous month") {
    return sub(date, { months: 1 });
  }
  if (action === "next month") {
    return add(date, { months: 1 });
  }
  if (action === "previous year") {
    return sub(date, { years: 1 });
  }
  if (action === "next year") {
    return add(date, { years: 1 });
  }
  if (action === "next week") {
    return add(date, { weeks: 1 });
  }
  if (action === "previous week") {
    return sub(date, { weeks: 1 });
  }
  if (action === "next day") {
    return add(date, { days: 1 });
  }
  if (action === "previous day") {
    return sub(date, { days: 1 });
  }
  if (action === "start of week") {
    return startOfWeek(date);
  }
  if (action === "end of week") {
    return endOfWeek(date);
  }
  return date;
}

const keymap =
  (dispatch: Dispatch<Action>) =>
  ({ shiftKey, key }: KeyboardEvent) => {
    if (shiftKey && key === "PageUp") {
      return dispatch("previous year");
    }
    if (shiftKey && key === "PageDown") {
      return dispatch("next year");
    }
    if (key === "PageUp") {
      return dispatch("previous month");
    }
    if (key === "PageDown") {
      return dispatch("next month");
    }
    if (key === "ArrowDown") {
      return dispatch("next week");
    }
    if (key === "ArrowUp") {
      return dispatch("previous week");
    }
    if (key === "ArrowLeft") {
      return dispatch("previous day");
    }
    if (key === "ArrowRight") {
      return dispatch("next day");
    }
    if (key === "Home") {
      return dispatch("start of week");
    }
    if (key === "End") {
      return dispatch("end of week");
    }
  };

type CalendarProps = {
  value?: Date;
  children?: (date: Date) => ReactNode;
};
export function Calendar(props: CalendarProps) {
  const [focus, dispatch] = useReducer(reducer, props.value ?? new Date());
  const previousMonth = () => dispatch("previous month");
  const nextMonth = () => dispatch("next month");
  const previousYear = () => dispatch("previous year");
  const nextYear = () => dispatch("next year");

  useEffect(() => {
    const keydown = keymap(dispatch);

    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, [dispatch]);

  return (
    <div>
      <header>
        <button type="button" aria-label="previous year" onClick={previousYear}>
          {"<<"}
        </button>

        <button
          type="button"
          aria-label="previous month"
          onClick={previousMonth}
        >
          {"<"}
        </button>

        <h2 aria-live="polite">{format(focus, "MMMM yyyy")}</h2>

        <button type="button" aria-label="next month" onClick={nextMonth}>
          {">"}
        </button>

        <button type="button" aria-label="next year" onClick={nextYear}>
          {">>"}
        </button>
      </header>

      {props.children?.(focus)}
    </div>
  );
}
