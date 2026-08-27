import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export namespace Route {
  export type LoaderArgs = LoaderFunctionArgs;
  export type ActionArgs = ActionFunctionArgs;
}
