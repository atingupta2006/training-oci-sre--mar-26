1) Change to function directory
   cd health-check-fn

2) Inspect or create local .env

3) Build the function image
   fn build

4) Deploy to your Functions Application
   # replace <app-name> with your Functions Application name
   fn deploy --app <app-name>

5) Configure runtime variables
   fn config function <app-name> health-check HEALTH_URLS "http://<lb-ip>:3000/api/health"
   fn config function <app-name> health-check REQUEST_TIMEOUT "5"
   fn config function <app-name> health-check RETRIES "1"
   fn config function <app-name> health-check BACKOFF_SECONDS "1.0"
   fn config function <app-name> health-check LATENCY_THRESHOLD_MS "1000"
   fn config function <app-name> health-check ORDERS_FAILED_THRESHOLD "0"

6) Invoke the deployed function
   # replace <app-name>
   fn invoke <app-name> health-check

7) Inspect recent calls
   fn list calls <app-name> health-check
   fn get call <call-id>

8) Debug locally (quick Python test)
   python3 -c "from func import handler; import json; resp=handler(None,None); print(json.loads(resp.data))"
