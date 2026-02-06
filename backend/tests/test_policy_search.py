def test_policy_search_returns_results(auth_client):
    response = auth_client.get(
        "/api/v1/policies/search?q=leave"
    )

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
