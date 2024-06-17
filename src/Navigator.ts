import {
  QuickPick,
  QuickPickItem,
  window,
  workspace,
  Uri,
  FileType,
  WorkspaceConfiguration,
  Disposable
} from "vscode";
import * as path from "path";

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

interface Category {
  label: string;
  pattern: string;
  reverse?: boolean;
  exclude?: string;
}

interface File {
  label: string;
  uri: Uri;
}

export default class Navigator implements Disposable {
  private quickPick: QuickPick<QuickPickItem>;

  constructor(private config: WorkspaceConfiguration) {
    this.quickPick = window.createQuickPick();
    this.quickPick.onDidAccept(this.accept);
    this.quickPick.totalSteps = 2;
  }

  public dispose() {
    this.quickPick.dispose();
  }

  public async show() {
    this.quickPick.busy = true;
    this.quickPick.value = "";
    this.quickPick.placeholder = "Select a Category";
    this.quickPick.step = 1;
    this.quickPick.show();
    this.quickPick.items = [...(await this.getCategories())].sort((a, b) => a.label.localeCompare(b.label));
    this.quickPick.busy = false;
  }

  private async getCategories() {
    const appCategories = this.config.autoDetectAppDirectories
      ? await this.getAppCategories()
      : [];
    return [...appCategories, ...(this.config.customCategories as Category[])];
  }

  private async getAppCategories(): Promise<Category[]> {
    const folders = workspace.workspaceFolders;
    if (!folders) {
      return [];
    }

    const promises = folders.map(folder => {
      const uri = Uri.file(path.join(folder.uri.fsPath, "app"));
      return workspace.fs.readDirectory(uri);
    });
    const files = await Promise.all(promises);
    return (files.flat() as [string, FileType][])
      .filter(
        ([name, fileType]) =>
          fileType === FileType.Directory &&
          !this.config.excludeAppDirectories.includes(name)
      )
      .map(([name]) => {
        return {
          label: capitalize(name),
          pattern: `app/${name}/**/*`
        };
      });
  }

  private async getFileItems(category: Category): Promise<File[]> {
    const { pattern, reverse, exclude } = category;

    const files = await workspace.findFiles(pattern, exclude).then(_files => {
      _files.sort();
      return reverse ? _files.reverse() : _files;
    });

    return files.map(file => {
      return {
        label: workspace
          .asRelativePath(file)
          .replace(pattern.split("**", 2)[0], ""),
        uri: file
      };
    });
  }

  private async showFiles(category: Category) {
    this.quickPick.busy = true;
    this.quickPick.value = "";
    this.quickPick.step = 2;
    this.quickPick.placeholder = "Select a File";
    this.quickPick.items = await this.getFileItems(category);
    this.quickPick.busy = false;
  }

  private async openFile(file: File) {
    this.quickPick.hide();
    await window.showTextDocument(file.uri);
  }

  private accept = () => {
    const selectedItem = this.quickPick.selectedItems[0];

    if (this.quickPick.step === 1) {
      this.showFiles(selectedItem as Category);
    } else {
      this.openFile(selectedItem as File);
    }
  };
}
