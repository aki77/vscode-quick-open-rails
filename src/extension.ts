import * as vscode from "vscode";
import * as path from "path";
import * as sortOn from "sort-on";

const flatten = require("lodash.flatten");

type Category = {
  label: string;
  pattern: string;
  reverse?: boolean;
  exclude?: string;
};

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const getAppCategories = async (
  exclude: string[] = []
): Promise<Category[]> => {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) {
    return [];
  }

  const promises = folders.map(folder => {
    const uri = vscode.Uri.file(path.join(folder.uri.fsPath, "app"));
    return vscode.workspace.fs.readDirectory(uri);
  });
  const files = await Promise.all(promises);
  return (flatten(files) as [string, vscode.FileType][])
    .filter(
      ([name, fileType]) =>
        fileType === vscode.FileType.Directory && !exclude.includes(name)
    )
    .map(([name]) => {
      return {
        label: capitalize(name),
        pattern: `app/${name}/**/*`
      };
    });
};

const quickOpen = async () => {
  const config = vscode.workspace.getConfiguration("quickOpenRails");

  const appCategories = config.autoDetectAppDirectories
    ? await getAppCategories(config.excludeAppDirectories)
    : [];
  const categories = [
    ...appCategories,
    ...(config.customCategories as Category[])
  ];
  const category = await vscode.window.showQuickPick(
    sortOn(categories, "label"),
    {
      placeHolder: "Select a Category"
    }
  );
  if (!category) {
    return;
  }

  const { pattern, reverse, exclude } = category;
  const files = await vscode.workspace
    .findFiles(pattern, exclude)
    .then(_files => {
      _files.sort();
      return reverse ? _files.reverse() : _files;
    });
  const items = files.map(file => {
    return {
      label: vscode.workspace
        .asRelativePath(file)
        .replace(pattern.split("**", 2)[0], ""),
      uri: file
    };
  });

  const item = await vscode.window.showQuickPick(items, {
    placeHolder: "Select a File"
  });
  if (!item) {
    return;
  }

  await vscode.window.showTextDocument(item.uri);
};

const isRailsWorkspace = async () => {
  const files = await vscode.workspace.findFiles("bin/rails");
  return files.length > 0;
};

export async function activate(context: vscode.ExtensionContext) {
  if (await !isRailsWorkspace()) {
    return;
  }

  const disposable = vscode.commands.registerCommand(
    "quickOpenRails.open",
    quickOpen
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
