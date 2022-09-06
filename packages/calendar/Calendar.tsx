import { add, endOfWeek, format, startOfWeek, sub } from "date-fns";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

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

interface State {
  focus: Date;
  dispatch: Dispatch<Action>;
}
export const Context = createContext<State | null>(null);

function useCalendarContext(error: string) {
  const context = useContext(Context);

  if (!context) {
    throw new Error(error);
  }

  return context;
}

type HeaderProps = {
  children?: ReactNode;
  className?: string;
};
function Header(props: HeaderProps) {
  useCalendarContext(
    `<Calendar.Header /> cannot be rendered outside <Calendar />`
  );
  return <header className={props.className}>{props.children}</header>;
}

type ButtonProps = {
  action: Action;
  children?: ReactNode;
  className?: string;
};
function Button(props: ButtonProps) {
  const context = useCalendarContext(
    `<Calendar.Button /> cannot be rendered outside <Calendar />`
  );

  const onClick = () => context.dispatch(props.action);

  return (
    <button
      type="button"
      aria-label={props.action}
      onClick={onClick}
      className={props.className}
    >
      {props.children}
    </button>
  );
}

type Level = 1 | 2 | 3 | 4 | 5 | 6;
type TitleProps = {
  as?: `h${Level}`;
  children?: ReactNode;
  className?: string;
};
function Title(props: TitleProps) {
  const context = useCalendarContext(
    `<Calendar.Title /> cannot be rendered outside <Calendar />`
  );

  const Comp = props.as ?? "h2";
  const children = props.children ?? format(context.focus, "MMMM yyyy");

  return (
    <Comp aria-live="polite" className={props.className}>
      {children}
    </Comp>
  );
}

type CalendarProps = {
  value?: Date;
  children?: ReactNode;
  as?: keyof HTMLElementTagNameMap;
  className?: string;
};
export function Calendar(props: CalendarProps) {
  const [focus, dispatch] = useReducer(reducer, props.value ?? new Date());

  useEffect(() => {
    const keydown = keymap(dispatch);

    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, [dispatch]);

  const Comp = props.as ?? "div";

  return (
    <Context.Provider value={{ focus, dispatch }}>
      <Comp className={props.className}>{props.children}</Comp>
    </Context.Provider>
  );
}

Calendar.Header = Header;
Calendar.Button = Button;
Calendar.Title = Title;
