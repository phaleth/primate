import HANDLER_PROPERTY from "#handler-property";
import error from "@primate/core/handler/error";
import redirect from "@primate/core/handler/redirect";
import view from "@primate/core/handler/view";
import type ResponseLike from "@primate/core/ResponseLike";
import type ResponseFunction from "@primate/core/ResponseFunction";
import type Dictionary from "@rcompat/record/Dictionary";

const handlers = { view, redirect, error };
type Handler = keyof typeof handlers;

type ViewParameters = Parameters<typeof view>;
type RedirectParameters = Parameters<typeof redirect>;
type ErrorParameters = Parameters<typeof error>;

const handle_handler = (handler: Handler, response: Dictionary) => {
  if (handler === "view") {
    const { name, props, options } = response as {
      name: ViewParameters[0],
      props: ViewParameters[1],
      options: ViewParameters[2],
    };
    return view(name, props, options);
  }
  if (handler === "redirect") {
    const { location, status } = response as {
      location: RedirectParameters[0],
      status: RedirectParameters[1],
    }
    return redirect(location, status);
  }

  const { body, options } = response as {
    body: ErrorParameters[0],
    options: ErrorParameters[1],
  }
  return error(body, options);
};

const is_handler = (handler: unknown): handler is Handler =>
    typeof handler === "string" && Object.keys(handlers).includes(handler);


export default (response: Dictionary): ResponseLike => {
  const handler = response[HANDLER_PROPERTY];

  return is_handler(handler)
    ? handle_handler(handler, response) as ResponseFunction
    : response
};
