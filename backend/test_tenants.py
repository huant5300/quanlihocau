#!/usr/bin/env python
"""
Test script for Tenant APIs
"""
import requests
import json

BASE_URL = 'http://127.0.0.1:8000'

def test_tenant_apis():
    # Get JWT token
    token_response = requests.post(f'{BASE_URL}/api/token/', data={
        'username': 'admin',
        'password': 'admin'
    })

    if token_response.status_code != 200:
        print(f"❌ Failed to get token: {token_response.text}")
        return

    tokens = token_response.json()
    headers = {'Authorization': f'Bearer {tokens["access"]}'}

    print("✅ JWT Token obtained successfully")

    # Test tenant list
    list_response = requests.get(f'{BASE_URL}/api/v1/tenants/', headers=headers)
    if list_response.status_code == 200:
        tenants = list_response.json()
        print(f"✅ Tenant list API works: {len(tenants.get('results', tenants))} tenants found")
    else:
        print(f"❌ Tenant list failed: {list_response.text}")

    # Test tenant statistics
    stats_response = requests.get(f'{BASE_URL}/api/v1/tenants/statistics/', headers=headers)
    if stats_response.status_code == 200:
        stats = stats_response.json()
        print(f"✅ Tenant statistics API works: {stats}")
    else:
        print(f"❌ Tenant statistics failed: {stats_response.text}")

    # Test create tenant
    tenant_data = {
        'name': 'Test Fishing Pond',
        'phone': '1234567890',
        'address': '123 Test Street',
        'timezone': 'UTC',
        'currency': 'USD'
    }

    create_response = requests.post(f'{BASE_URL}/api/v1/tenants/', json=tenant_data, headers=headers)
    if create_response.status_code == 201:
        created_tenant = create_response.json()
        print(f"✅ Tenant creation works: {created_tenant['name']}")
        tenant_id = created_tenant['id']

        # Test retrieve tenant
        retrieve_response = requests.get(f'{BASE_URL}/api/v1/tenants/{tenant_id}/', headers=headers)
        if retrieve_response.status_code == 200:
            print("✅ Tenant retrieve API works")
        else:
            print(f"❌ Tenant retrieve failed: {retrieve_response.text}")

        # Test update tenant
        update_data = {'name': 'Updated Fishing Pond'}
        update_response = requests.patch(f'{BASE_URL}/api/v1/tenants/{tenant_id}/', json=update_data, headers=headers)
        if update_response.status_code == 200:
            print("✅ Tenant update API works")
        else:
            print(f"❌ Tenant update failed: {update_response.text}")

    else:
        print(f"❌ Tenant creation failed: {create_response.text}")

if __name__ == '__main__':
    test_tenant_apis()