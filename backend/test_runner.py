#!/usr/bin/env python3
"""
Test runner script for the FastAPI backend
Runs all tests and generates coverage reports
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{'='*50}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return False

def main():
    """Main test runner function"""
    print("FastAPI Backend Test Runner")
    print("="*50)
    
    # Add the backend directory to Python path
    current_dir = str(Path.cwd())
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)

    # Install test dependencies
    print("Installing test dependencies...")
    test_deps = [
        "pytest",
        "pytest-cov",
        "pytest-asyncio",
        "httpx"  # Required for FastAPI TestClient
    ]
    
    for dep in test_deps:
        if not run_command(f"pip install {dep}", f"Installing {dep}"):
            print(f"Failed to install {dep}")
            return False
    
    # Run tests with coverage
    test_commands = [
        {
            "command": "pytest backend/tests/ -v --tb=short",
            "description": "Running all tests with verbose output"
        },
        {
            "command": "pytest backend/tests/ --cov=app --cov-report=html --cov-report=term-missing",
            "description": "Running tests with coverage report"
        }
    ]
    
    all_passed = True
    for test_cmd in test_commands:
        if not run_command(test_cmd["command"], test_cmd["description"]):
            all_passed = False
    
    # Summary
    print(f"\n{'='*50}")
    print("Test Summary")
    print(f"{'='*50}")
    
    if all_passed:
        print("✅ All tests completed successfully!")
        print("\n📊 Coverage report generated in htmlcov/ directory")
        print("   Open htmlcov/index.html in your browser to view detailed coverage")
    else:
        print("❌ Some tests failed or encountered errors")
        print("   Check the output above for details")
    
    # List test files found
    test_files = list(Path("backend/tests").glob("test_*.py"))
    print(f"\n📁 Test files found ({len(test_files)}):")
    for test_file in sorted(test_files):
        print(f"   - {test_file}")
    
    return all_passed
    print(f"\n📁 Test files found ({len(test_files)}):")
    for test_file in sorted(test_files):
        print(f"   - {test_file}")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
