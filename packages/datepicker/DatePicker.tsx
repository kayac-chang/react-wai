import { isSameDay } from "date-fns";
import {
  ComponentProps,
  createContext,
  Dispatch,
  forwardRef,
  Fragment,
  ReactNode,
  useContext,
  useId,
  useReducer,
} from "react";
import { PCP } from "utils/types";

type Action =
  | { type: "trigger calendar" }
  | { type: "select date"; value: Date };
type State = {
  open: boolean;
  value?: Date;
  input_describe: string;
};
const Context = createContext<[State, Dispatch<Action>] | null>(null);
function reducer(state: State, action: Action) {
  if (action.type === "trigger calendar") {
    return { ...state, open: !state.open };
  }
  if (action.type === "select date") {
    return { ...state, value: action.value };
  }
  return state;
}
function useDatePickerContext(error: string) {
  const context = useContext(Context);
  if (!context) {
    throw new Error(error);
  }
  return context;
}

export type ButtonProps = PCP<
  "button",
  {
    children?: ReactNode | ((state: State) => ReactNode);
    action: Action;
  }
>;
const Button = forwardRef<HTMLButtonElement, ButtonProps>((_props, ref) => {
  const [state, dispatch] = useDatePickerContext(
    `<DatePicker.Button /> cannot be rendered outside <DatePicker />`
  );

  const { action, children, ...props } = _props;

  const onClick = () => dispatch(action);

  let element: ReactNode | null = null;
  if (typeof children === "function") {
    element ??= children(state);
  } else {
    element ??= children;
  }

  if (action.type === "select date") {
    const isSelected = state.value && isSameDay(action.value, state.value);

    return (
      <button
        {...props}
        type="button"
        onClick={onClick}
        ref={ref}
        aria-selected={isSelected}
      >
        {element}
      </button>
    );
  }

  return (
    <button {...props} type="button" onClick={onClick} ref={ref}>
      {element}
    </button>
  );
});

type DescriptionProps = ComponentProps<"span">;
function Description(props: DescriptionProps) {
  const [{ input_describe }] = useDatePickerContext(
    `<DatePicker.Description /> cannot be rendered outside <DatePicker />`
  );

  return <span id={input_describe} {...props} />;
}

type FieldProps = ComponentProps<"input">;
function Field(props: FieldProps) {
  const [{ input_describe }] = useDatePickerContext(
    `<DatePicker.Field /> cannot be rendered outside <DatePicker />`
  );

  return <input type="text" aria-describedby={input_describe} {...props} />;
}

type DatePickerProps = PCP<
  "div",
  {
    value?: Date;
    children: (ReactNode | ((state: State) => ReactNode))[];
  }
>;
export function DatePicker(props: DatePickerProps) {
  const id = useId();
  const context = useReducer(reducer, {
    input_describe: id + "input_describe",
    open: false,
    value: props.value,
  });

  return (
    <Context.Provider value={context}>
      <div>
        {props.children?.map((element, index) => {
          if (typeof element === "function") {
            return <Fragment key={index}>{element(context[0])}</Fragment>;
          }

          return <Fragment key={index}>{element}</Fragment>;
        })}
      </div>
    </Context.Provider>
  );
}

DatePicker.Field = Field;
DatePicker.Description = Description;
DatePicker.Button = Button;
