package com.refractor_ai.code_review_engine.Service;

import org.springframework.stereotype.Service;

import javax.tools.*;
import java.net.URI;
import java.util.Arrays;

@Service
public class CompilerVerificationService {
    /**
     * Attempts to compile the provided Java code in-memory.
     * @param className The name of the class (e.g., "RefactoredCode")
     * @param sourceCode The actual code string returned by the AI
     * @return An empty string if successful, or a string containing the exact compiler errors if it fails.
     */
    public String compileCode(String className, String sourceCode) {
        // Get the system Java compiler (Requires running the app with a JDK, not a JRE)
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            return "Error: System Java Compiler not found. Ensure you are running with a JDK.";
        }

        // Set up a collector to catch the exact error messages (diagnostics)
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        StandardJavaFileManager fileManager = compiler.getStandardFileManager(diagnostics, null, null);

        // Wrap the AI's string output in our custom in-memory file object
        InMemoryJavaFileObject file = new InMemoryJavaFileObject(className, sourceCode);
        Iterable<? extends JavaFileObject> compilationUnits = Arrays.asList(file);

        // Run the compilation task in RAM
        JavaCompiler.CompilationTask task = compiler.getTask(
                null, fileManager, diagnostics, null, null, compilationUnits
        );

        boolean success = task.call();

        if (success) {
            return ""; // Compiles perfectly
        }

        // If it fails, extract the exact line numbers and error messages to feed back to the AI
        StringBuilder errorReport = new StringBuilder();
        for (Diagnostic<? extends JavaFileObject> diagnostic : diagnostics.getDiagnostics()) {
            errorReport.append("Line ").append(diagnostic.getLineNumber())
                    .append(": ").append(diagnostic.getMessage(null)).append("\n");
        }

        return errorReport.toString();
    }

    /**
     * A helper class that tricks the Java Compiler into reading a String from memory
     * instead of looking for a physical .java file on the hard drive.
     */
    private static class InMemoryJavaFileObject extends SimpleJavaFileObject {
        private final String code;

        protected InMemoryJavaFileObject(String className, String code) {
            // Creates a fake URI like "string:///RefactoredCode.java"
            super(URI.create("string:///" + className.replace('.', '/') + Kind.SOURCE.extension), Kind.SOURCE);
            this.code = code;
        }

        @Override
        public CharSequence getCharContent(boolean ignoreEncodingErrors) {
            return code;
        }
    }
}
