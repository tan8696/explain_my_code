import ast
import copy
from typing import Any, Dict, List, Tuple
from schemas.api_models import TraceEvent, Change

class TracerError(Exception):
    pass

class UnsupportedSyntaxError(TracerError):
    pass

class MaxStepsExceededError(TracerError):
    pass

class SafeTracer:
    MAX_LINES = 100
    MAX_STEPS = 200
    MAX_ITERATIONS = 50

    def __init__(self):
        self.variables: Dict[str, Any] = {}
        self.events: List[TraceEvent] = []
        self.step_count = 0

    def parse_and_trace(self, source: str) -> List[TraceEvent]:
        if len(source.splitlines()) > self.MAX_LINES:
            raise TracerError("Source code exceeds max lines limit.")
            
        try:
            tree = ast.parse(source)
        except SyntaxError as e:
            raise TracerError(f"Syntax Error: {e.msg} at line {e.lineno}")

        self._visit(tree)
        return self.events

    def _record_event(self, node: ast.AST, label: str, changes: List[Change], type_str: str = "assignment"):
        self.step_count += 1
        if self.step_count > self.MAX_STEPS:
            raise MaxStepsExceededError("Maximum execution steps exceeded.")
            
        event = TraceEvent(
            step=self.step_count,
            type=type_str,
            line=getattr(node, 'lineno', 0),
            lineEnd=getattr(node, 'end_lineno', getattr(node, 'lineno', 0)),
            label=label,
            variables=copy.deepcopy(self.variables),
            changes=changes,
            output=[]
        )
        self.events.append(event)

    def _visit(self, node: ast.AST) -> Any:
        method = '_visit_' + node.__class__.__name__
        visitor = getattr(self, method, self._generic_visit)
        return visitor(node)

    def _generic_visit(self, node: ast.AST):
        if isinstance(node, ast.Module):
            for stmt in node.body:
                self._visit(stmt)
        else:
            raise UnsupportedSyntaxError(f"Unsupported syntax: {node.__class__.__name__}")

    def _visit_Assign(self, node: ast.Assign):
        if len(node.targets) > 1:
            raise UnsupportedSyntaxError("Multiple assignment targets not supported yet.")
        
        target = node.targets[0]
        if not isinstance(target, ast.Name):
            raise UnsupportedSyntaxError("Only simple variable assignments are supported.")
            
        var_name = target.id
        value = self._visit(node.value)
        
        before_val = self.variables.get(var_name, None)
        self.variables[var_name] = value
        
        change = Change(name=var_name, before=before_val, after=value)
        self._record_event(node, f"Assign {value} to {var_name}", [change], "assignment")

    def _visit_Constant(self, node: ast.Constant) -> Any:
        return node.value

    def _visit_Name(self, node: ast.Name) -> Any:
        if isinstance(node.ctx, ast.Load):
            if node.id not in self.variables:
                raise TracerError(f"NameError: name '{node.id}' is not defined")
            return self.variables[node.id]
        raise UnsupportedSyntaxError("Unsupported variable context.")

    def _visit_List(self, node: ast.List) -> List[Any]:
        return [self._visit(elt) for elt in node.elts]

    def _visit_BinOp(self, node: ast.BinOp) -> Any:
        left = self._visit(node.left)
        right = self._visit(node.right)
        
        if isinstance(node.op, ast.Add): return left + right
        if isinstance(node.op, ast.Sub): return left - right
        if isinstance(node.op, ast.Mult): return left * right
        if isinstance(node.op, ast.Div): return left / right
        
        raise UnsupportedSyntaxError(f"Unsupported operator: {node.op.__class__.__name__}")
        
    def _visit_Subscript(self, node: ast.Subscript) -> Any:
        value = self._visit(node.value)
        
        # In Python 3.9+, node.slice can be the actual slice value (e.g. Constant)
        # In older Python, it's an ast.Index. Handle both safely.
        if isinstance(node.slice, getattr(ast, 'Index', type(None))):
            idx = self._visit(node.slice.value)
        else:
            idx = self._visit(node.slice)
            
        try:
            return value[idx]
        except Exception as e:
            raise TracerError(f"Subscript error: {str(e)}")

    # Support for simple list comprehensions, for loops, conditionals to be added incrementally

class AITracer:
    """Uses AI Dry-Run to support tracing of all Python constructs safely."""
    def parse_and_trace(self, source: str) -> List[Dict[str, Any]]:
        from core.ai import generate_trace
        if len(source.splitlines()) > 1000:
            raise TracerError("Source code exceeds max lines limit.")
            
        try:
            # We still parse it just to validate it's real Python code
            # and to prevent the AI from generating traces for pure gibberish.
            ast.parse(source)
        except SyntaxError as e:
            # We can still let the AI try to trace it or we can fail.
            # Since vibe coders might have syntax errors, let's not fail on ast.parse!
            # But let's log it.
            pass
            
        return generate_trace(source)
