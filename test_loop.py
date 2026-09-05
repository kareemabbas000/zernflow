from playwright.sync_api import sync_playwright
import time

def test_inbox_crash():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        # We need to capture console errors
        def handle_console(msg):
            if msg.type == "error":
                print(f"BROWSER ERROR: {msg.text}")
                
        page.on("console", handle_console)
        
        try:
            print("Navigating to dashboard...")
            page.goto('http://localhost:3009/dashboard/inbox', wait_until='networkidle')
            
            print("Waiting for page load...")
            time.sleep(5)
            
            print("Looking for a conversation to click...")
            # Click the first conversation
            conversations = page.locator('.conversation-list-item, [role="button"], a[href*="/dashboard/inbox"]').all()
            if conversations:
                print("Clicking conversation...")
                conversations[0].click()
                time.sleep(5)
            else:
                print("No conversations found, trying brute force click")
                page.mouse.click(100, 300)
                time.sleep(5)
                
        except Exception as e:
            print(f"Test exception: {e}")
            
        finally:
            browser.close()

test_inbox_crash()
