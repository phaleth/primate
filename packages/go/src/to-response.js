import error from "@primate/core/handler/error";
import redirect from "@primate/core/handler/redirect";
import view from "@primate/core/handler/view";

const handlers = {
  view({ component, props = "{}", options = "{}" }) {
    return view(component, JSON.parse(props), JSON.parse(options));
  },
  redirect({ location, options = "{}" }) {
    return redirect(location, JSON.parse(options));
  },
};

const handle_function = response => {
  const { handler, ...args } = response;
  return handlers[handler]?.(args) ?? error();
};

const handle_other = response => JSON.parse(response);

export default response => typeof response === "function"
  ? handle_function(response())
  : handle_other(response);
