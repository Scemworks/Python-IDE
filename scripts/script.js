document.addEventListener("DOMContentLoaded", function () {
    const codeEditor = document.getElementById("code-editor");

    // Load code from localStorage
    const savedCode = localStorage.getItem("pythonCode");
    if (savedCode !== null) {
        codeEditor.value = savedCode;
    } else {
        codeEditor.value = "# Write your Python code here\n\nprint(\"Hello, World!\")";
    }

    function runCode() {
        const code = codeEditor.value;
        const outputElement = document.getElementById("output-window");
        outputElement.textContent = ""; // Clear previous output

        try {
            // Save code to localStorage
            localStorage.setItem("pythonCode", code);

            // Remove Python single-line comments
            let filteredCode = code.replace(/#.*$/gm, '');
            // Remove Python multi-line comments
            filteredCode = filteredCode.replace(/(['"]{3})([\s\S]*?)\1/gm, '');

            // Ensure Brython context is used
            brython(1);

            // Capture stdout
            window.$B.stdout.write = function(data) {
                outputElement.textContent += data;
            };

            // Capture stderr
            window.$B.stderr.write = function(data) {
                outputElement.textContent += data;
            };

            // Run the filtered code
            eval(__BRYTHON__.python_to_js(filteredCode));
        } catch (error) {
            outputElement.textContent = `Error: ${error.message}`;
        }
    }

    codeEditor.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent default "Enter" behavior

            const textarea = e.target;
            const cursorPos = textarea.selectionStart;
            const code = textarea.value;

            const lines = code.substring(0, cursorPos).split("\n");
            const currentLine = lines[lines.length - 1] || ""; // Safely access the current line
            const indentation = currentLine.match(/^\s*/)[0]; // Match leading spaces or tabs

            const beforeCursor = code.substring(0, cursorPos);
            const afterCursor = code.substring(cursorPos);
            textarea.value = `${beforeCursor}\n${indentation}${afterCursor}`;

            textarea.selectionStart = textarea.selectionEnd = cursorPos + 1 + indentation.length;
        }
    });

    document.querySelector('button').addEventListener('click', runCode);
});