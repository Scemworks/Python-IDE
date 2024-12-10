document.addEventListener("DOMContentLoaded", function () {
    const codeEditor = document.getElementById("code-editor");

    // Default text for the editor
    const defaultText = `# Write your basic Python code here\n\nprint("Hello, World")

    // Load saved code from localStorage, if available
    const savedCode = localStorage.getItem("pythonCode");
    if (savedCode !== null) {
        codeEditor.value = savedCode;
    } else {
        codeEditor.value = defaultText;
    }

    function runCode() {
        const code = codeEditor.value;
        const outputElement = document.getElementById("output-window");

        // Clear previous output
        outputElement.textContent = "";

        try {
            // Save current code to localStorage
            localStorage.setItem("pythonCode", code);

            // Ensure Brython context is used
            brython(1);

            // Capture stdout and stderr to display output
            window.$B.stdout.write = function (data) {
                outputElement.textContent += data;
            };

            window.$B.stderr.write = function (data) {
                outputElement.textContent += data;
            };

            // Run the code using Brython
            eval(__BRYTHON__.python_to_js(code));
        } catch (error) {
            outputElement.textContent = `Error: ${error.message}`;
        }
    }

    // Handle Enter key to preserve indentation
    codeEditor.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent default Enter behavior

            const textarea = e.target;
            const cursorPos = textarea.selectionStart;
            const code = textarea.value;

            const lines = code.substring(0, cursorPos).split("\n");
            const currentLine = lines[lines.length - 1] || ""; // Access the current line safely
            const indentation = currentLine.match(/^\s*/)[0]; // Match leading spaces or tabs

            const beforeCursor = code.substring(0, cursorPos);
            const afterCursor = code.substring(cursorPos);

            // Insert new line with the same indentation
            textarea.value = `${beforeCursor}\n${indentation}${afterCursor}`;

            // Move cursor position after the inserted line
            textarea.selectionStart = textarea.selectionEnd = cursorPos + 1 + indentation.length;
        }
    });

    // Bind runCode to button click
    document.querySelector('button').addEventListener('click', runCode);

    // Bind clearButton to reset code editor to default text, clear localStorage
    const clearButton = document.getElementById("clear-button");
    clearButton.addEventListener("click", function () {
        // Clear code editor content
        codeEditor.value = defaultText;

        // Clear output window
        document.getElementById("output-window").textContent = "";

        // Clear localStorage to remove saved code
        localStorage.removeItem("pythonCode");
    });

    // Save the code as main.py on Save button click
    const saveButton = document.getElementById("save-button");
    saveButton.addEventListener("click", function () {
        const code = codeEditor.value;

        // Create a Blob with the Python code and specify the MIME type as 'text/x-python'
        const blob = new Blob([code], { type: 'text/x-python' });

        // Create a link to trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'main.py'; // Save as main.py
        link.click(); // Trigger the download
    });
});