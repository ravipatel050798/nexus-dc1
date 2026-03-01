import requests
import json
import time

def simulate_jira_ticket(device_name, reason):
    """
    Simulates sending a payload to the Jira Service Management API.
    In a real scenario, this would use an API Token.
    """
    print(f"[JIRA SIMULATOR] Detected critical health drop for {device_name}")
    print(f"[JIRA SIMULATOR] Reason: {reason}")
    
    payload = {
        "fields": {
            "project": {"key": "WMS"},
            "summary": f"Hardware Alert: {device_name} - {reason}",
            "description": f"Automated alert from Nexus DC-1. Device {device_name} is showing predictive failure patterns. Required action: Battery replacement or WiFi site survey.",
            "issuetype": {"name": "Incident"},
            "customfield_10001": "Calgary DC"
        }
    }
    
    # Mocking the POST request
    print("[JIRA SIMULATOR] Sending POST request to https://wellca.atlassian.net/rest/api/2/issue...")
    time.sleep(1)
    print(f"[JIRA SIMULATOR] SUCCESS: Ticket WMS-{int(time.time() % 1000)} created for {device_name}.")

if __name__ == "__main__":
    # Simulate an alert
    simulate_jira_ticket("RF-SCAN-012", "Battery Health < 20% (Predictive Failure)")
