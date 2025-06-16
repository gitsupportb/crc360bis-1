#!/usr/bin/env python3
"""
Quick test script for the authentication API
"""

import requests
import json

def test_auth_api():
    base_url = "http://localhost:3002"

    print("Testing authentication API...")

    # Test the new test endpoint first
    try:
        test_response = requests.get(f"{base_url}/api/test-auth", timeout=10)
        print(f"GET /api/test-auth: {test_response.status_code}")
        if test_response.status_code == 200:
            print(f"Test endpoint response: {test_response.text}")
    except Exception as e:
        print(f"Test endpoint failed: {e}")

    # Test GET request on original endpoint
    try:
        get_response = requests.get(f"{base_url}/api/docsecure/auth/login", timeout=10)
        print(f"GET /api/docsecure/auth/login: {get_response.status_code}")
        if get_response.status_code == 200:
            print(f"Response: {get_response.text}")
    except Exception as e:
        print(f"GET request failed: {e}")
    
    # Test POST with valid credentials
    try:
        post_data = {
            "username": "admin",
            "password": "BCP2Sadmin"
        }

        print(f"Sending POST data: {post_data}")

        # Test the new test endpoint first
        test_post_response = requests.post(
            f"{base_url}/api/test-auth",
            json=post_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        print(f"POST /api/test-auth: {test_post_response.status_code}")
        if test_post_response.status_code == 200:
            print(f"Test endpoint login successful: {test_post_response.json()}")

        # Test original endpoint
        post_response = requests.post(
            f"{base_url}/api/docsecure/auth/login",
            json=post_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        print(f"POST /api/docsecure/auth/login: {post_response.status_code}")
        print(f"Response headers: {dict(post_response.headers)}")
        print(f"Response text: {post_response.text}")

        if post_response.status_code == 200:
            try:
                result = post_response.json()
                print(f"JSON result: {result}")
                if result.get('success'):
                    print("✅ Login successful!")
                else:
                    print(f"❌ Login failed: {result.get('error')}")
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
        elif post_response.status_code == 500:
            print("❌ Server error - check server logs")
        else:
            print(f"❌ Unexpected status code: {post_response.status_code}")

    except Exception as e:
        print(f"POST request failed: {e}")

    # Test with invalid credentials
    try:
        invalid_data = {
            "username": "wrong",
            "password": "wrong"
        }

        invalid_response = requests.post(
            f"{base_url}/api/docsecure/auth/login",
            json=invalid_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        print(f"Invalid credentials test: {invalid_response.status_code}")
        if invalid_response.status_code == 401:
            print("✅ Invalid credentials properly rejected")
        else:
            print(f"⚠️ Unexpected response for invalid credentials: {invalid_response.status_code}")

    except Exception as e:
        print(f"Invalid credentials test failed: {e}")

if __name__ == "__main__":
    test_auth_api()
