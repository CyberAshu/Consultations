#!/usr/bin/env python3
"""
Debug script to check all available routes
"""

import sys
sys.path.append('.')

from app.main import app

def list_all_routes():
    """List all available routes in the FastAPI app"""
    print("Available Routes:")
    print("="*50)
    
    for route in app.routes:
        if hasattr(route, 'path'):
            methods = getattr(route, 'methods', ['GET'])
            print(f"{', '.join(methods):10} {route.path}")
    
    print("\n" + "="*50)
    print("Total routes:", len(app.routes))

if __name__ == "__main__":
    list_all_routes()
