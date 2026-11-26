package com.refractor_ai.code_review_engine.Service;

import com.github.javaparser.ParseProblemException;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.expr.BinaryExpr;
import com.github.javaparser.ast.expr.ConditionalExpr;
import com.github.javaparser.ast.stmt.*;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;

@Service
public class JavaParserService {

    public boolean isValidSyntax(String code) {
        try {
            StaticJavaParser.parse(code);
            return true;
        } catch (ParseProblemException e) {
            return false;
        }
    }

    public int calculateCyclomaticComplexity(String code) {
        try {
            // Convert string into AST
            CompilationUnit cu = StaticJavaParser.parse(code);

            // AtomicInteger allows modifying the value inside the anonymous inner class
            AtomicInteger complexity = new AtomicInteger(1);

            // Use the visitor pattern to traverse the tree and count decision points
            cu.accept(new VoidVisitorAdapter<Void>() {
                @Override
                public void visit(IfStmt n, Void arg) {
                    complexity.incrementAndGet();
                    super.visit(n, arg);
                }

                @Override
                public void visit(ForStmt n, Void arg) {
                    complexity.incrementAndGet();
                    super.visit(n, arg);
                }

                @Override
                public void visit(ForEachStmt n, Void arg) {
                    complexity.incrementAndGet();
                    super.visit(n, arg);
                }

                @Override
                public void visit(WhileStmt n, Void arg) {
                    complexity.incrementAndGet();
                    super.visit(n, arg);
                }

                @Override
                public void visit(DoStmt n, Void arg) {
                    complexity.incrementAndGet();
                    super.visit(n, arg);
                }

                @Override
                public void visit(CatchClause n, Void arg) {
                    complexity.incrementAndGet();
                    super.visit(n, arg);
                }

                @Override
                public void visit(ConditionalExpr n, Void arg) { // Catches ternary operators (e.g., a ? b : c)
                    complexity.incrementAndGet();
                    super.visit(n, arg);
                }

                @Override
                public void visit(BinaryExpr n, Void arg) { // Catches && and || operators
                    if (n.getOperator() == BinaryExpr.Operator.AND || n.getOperator() == BinaryExpr.Operator.OR) {
                        complexity.incrementAndGet();
                    }
                    super.visit(n, arg);
                }

                @Override
                public void visit(SwitchEntry n, Void arg) {
                    if (n.getLabels().isNonEmpty()) { // Each case statement adds 1, ignoring 'default'
                        complexity.incrementAndGet();
                    }
                    super.visit(n, arg);
                }
            }, null);

            return complexity.get();
        } catch (ParseProblemException e) {
            return -1;
        }
    }

    public String extractPublicClassName(String code) {
        try {
            CompilationUnit cu = StaticJavaParser.parse(code);
            return cu.findFirst(ClassOrInterfaceDeclaration.class, ClassOrInterfaceDeclaration::isPublic)
                    .map(ClassOrInterfaceDeclaration::getNameAsString)
                    .orElse("RefactoredCode");
        } catch (ParseProblemException e) {
            return "RefactoredCode";
        }
    }
}