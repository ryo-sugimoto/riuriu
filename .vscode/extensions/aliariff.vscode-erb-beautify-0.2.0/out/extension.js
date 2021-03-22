"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const cp = require("child_process");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    vscode.languages.registerDocumentFormattingEditProvider("erb", {
        provideDocumentFormattingEdits(document) {
            const ext = process.platform === "win32" ? ".bat" : "";
            const beautifier = cp.spawn(`htmlbeautifier${ext}`, ["-v"]);
            beautifier.on("error", err => {
                if (err.message.includes("ENOENT")) {
                    vscode.window.showErrorMessage(`couldn't find htmlbeautifier for formatting (ENOENT)`);
                }
                else {
                    vscode.window.showErrorMessage(`couldn't run htmlbeautifier '${err.message}'`);
                }
            });
            beautifier.stderr.on("data", data => {
                console.log(`htmlbeautifier stderr ${data}`);
            });
            beautifier.stdout.on("data", data => {
                console.log(`htmlbeautifier stdout ${data}`);
            });
            beautifier.on("exit", code => {
                console.log(`htmlbeautifier is ready to go!`);
                const options = cli_options();
                const beautify = cp.spawn(`htmlbeautifier${ext}`, [
                    ...options,
                    document.uri.fsPath
                ]);
                beautify.on("exit", code => {
                    if (code === 1 && options.indexOf("--stop-on-errors") > -1) {
                        cp.spawn("rm", [`${document.uri.fsPath}.tmp`]);
                    }
                });
            });
            return [];
        }
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
function cli_options() {
    const config = vscode.workspace.getConfiguration("vscode-erb-beautify");
    let acc = [];
    return Object.keys(config).reduce(function (acc, key) {
        switch (key) {
            case "indentBy":
                acc.push("--indent-by", config[key]);
                break;
            case "keepBlankLines":
                acc.push("--keep-blank-lines", config[key]);
                break;
            case "stopOnErrors":
                if (config["stopOnErrors"] === true) {
                    acc.push("--stop-on-errors");
                }
                break;
            case "tab":
                if (config["tab"] === true) {
                    acc.push("--tab");
                }
                break;
            case "tabStops":
                acc.push("--tab-stops", config[key]);
                break;
        }
        return acc;
    }, acc);
}
//# sourceMappingURL=extension.js.map