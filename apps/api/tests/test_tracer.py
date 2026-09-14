import pytest
from core.tracer import SafeTracer, UnsupportedSyntaxError, TracerError

def test_tracer_assignments():
    tracer = SafeTracer()
    source = "x = 5\ny = x + 2"
    events = tracer.parse_and_trace(source)
    
    assert len(events) == 2
    
    # First step
    assert events[0].type == "assignment"
    assert events[0].changes[0].name == "x"
    assert events[0].changes[0].after == 5
    
    # Second step
    assert events[1].changes[0].name == "y"
    assert events[1].changes[0].after == 7

def test_tracer_unsupported_syntax():
    tracer = SafeTracer()
    source = "import os"
    with pytest.raises(UnsupportedSyntaxError):
        tracer.parse_and_trace(source)

def test_tracer_syntax_error():
    tracer = SafeTracer()
    source = "x = 5 + "
    with pytest.raises(TracerError):
        tracer.parse_and_trace(source)
