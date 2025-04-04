import FileRef from "@rcompat/fs/FileRef";
import client from "./client.js";

const root_filter = /^root:solid/u;

export default (app, extension) => ({
  name: "solid",
  setup(build) {
    build.onResolve({ filter: root_filter }, ({ path }) => {
      return { path, namespace: "solidroot" };
    });
    build.onLoad({ filter: root_filter }, ({ path }) => {
      const contents = app.build.load(path);
      return contents
        ? { contents, loader: "js", resolveDir: app.root.path }
        : null;
    });
    build.onLoad({ filter: new RegExp(`${extension}$`, "u") }, async args => {
      // Load the file from the file system
      const source = await FileRef.text(args.path);

      // Convert JSX syntax to JavaScript
      return { contents: (await client(source)).js };
    });
  },
});
