document.addEventListener("DOMContentLoaded", function () {
    const codeEditor = document.getElementById("code-editor");

    // Default text for the editor
    const defaultText = `# Write your Python code here\n\nprint("Hello, World!")\nname = input("Enter your name: ")\nprint(f"Hello, {name}!")`;

    // Load saved code from localStorage, if available
    const savedCode = localStorage.getItem("pythonCode");
    codeEditor.value = savedCode !== null ? savedCode : defaultText;

    function runCode() {
        const code = codeEditor.value;
        const outputElement = document.getElementById("output-window");

        // Clear previous output
        outputElement.textContent = "";

        try {
            // Save the current code to localStorage
            localStorage.setItem("pythonCode", code);

            // Remove Python single-line and multi-line comments
            let filteredCode = code.replace(/#.*$/gm, '').replace(/(['"]{3})([\s\S]*?)\1/gm, '');

            // Ensure Brython context is used
            brython(1);

            // Override input() for simulated interaction
            window.input = function (prompt) {
                return new Promise((resolve) => {
                    // Append the prompt to the output window
                    const promptText = document.createElement("span");
                    promptText.textContent = prompt;
                    outputElement.appendChild(promptText);

                    // Create an input field for user input
                    const inputField = document.createElement("input");
                    inputField.type = "text";
                    inputField.style.display = "inline-block";
                    inputField.style.marginLeft = "5px";
                    inputField.style.width = "200px";

                    // Append the input field to the output window
                    outputElement.appendChild(inputField);
                    inputField.focus();

                    // Handle the Enter key to capture user input
                    inputField.addEventListener("keydown", function (event) {
                        if (event.key === "Enter") {
                            const userInput = inputField.value;

                            // Display user input in the output window
                            const userText = document.createElement("span");
                            userText.textContent = ` ${userInput}\n`;
                            outputElement.appendChild(userText);

                            // Remove the input field
                            outputElement.removeChild(inputField);

                            resolve(userInput);
                        }
                    });
                });
            };

            // Redirect stdout and stderr
            window.$B.stdout.write = function (data) {
                outputElement.textContent += data;
            };

            window.$B.stderr.write = function (data) {
                outputElement.textContent += data;
            };

            // Convert Python code to JavaScript and execute it
            eval(__BRYTHON__.python_to_js(filteredCode));
        } catch (error) {
            outputElement.textContent = `Error: ${error.message}`;
        }
    }

    // Handle Enter key to preserve indentation in the editor
    codeEditor.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const cursorPos = codeEditor.selectionStart;
            const lines = codeEditor.value.substring(0, cursorPos).split("\n");
            const currentLine = lines[lines.length - 1];
            const indentation = currentLine.match(/^\s*/)[0];

            const beforeCursor = codeEditor.value.substring(0, cursorPos);
            const afterCursor = codeEditor.value.substring(cursorPos);

            codeEditor.value = `${beforeCursor}\n${indentation}${afterCursor}`;
            codeEditor.selectionStart = codeEditor.selectionEnd = cursorPos + 1 + indentation.length;
        }
    });

    // Bind runCode to the Run button
    document.querySelector("button").addEventListener("click", runCode);

    // Clear button to reset the code editor and localStorage
    const clearButton = document.getElementById("clear-button");
    clearButton.addEventListener("click", function () {
        codeEditor.value = defaultText;
        document.getElementById("output-window").textContent = "";
        localStorage.removeItem("pythonCode");
    });

    // Save button to download the Python code as main.py
    const saveButton = document.getElementById("save-button");
    saveButton.addEventListener("click", function () {
        const code = codeEditor.value;
        const blob = new Blob([code], { type: "text/x-python" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "main.py";
        link.click();
    });
});