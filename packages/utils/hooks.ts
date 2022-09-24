import type { Context } from "react";
import { useContext } from "react";

export function useContextWithError<T>(context: Context<T>, error: string) {
  const _context = useContext(context);
  if (!_context) {
    throw new Error(error);
  }
  return _context;
}
