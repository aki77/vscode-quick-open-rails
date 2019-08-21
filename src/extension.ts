import * as vscode from "vscode";
import Navigator from "./Navigator";

const isRailsWorkspace = async () => {
  const files = await vscode.workspace.findFiles("bin/rails");
  return files.length > 0;
};

export async function activate(context: vscode.ExtensionContext) {
  if (await !isRailsWorkspace()) {
    return;
  }

  const config = vscode.workspace.getConfiguration("quickOpenRails");
  const navigator = new Navigator(config);

  const command = vscode.commands.registerCommand(
    "quickOpenRails.open",
    async () => {
      navigator.show();
    }
  );
  context.subscriptions.push(command, navigator);
}

export function deactivate() {}
