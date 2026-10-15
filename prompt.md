# Prompts Log

This document records the user prompts provided during the development of the **SG BusLive** application.

---

### Prompt 1: Initial Application Build (Frontend)
```text
build a Singapore based bus arrival application that tracks real time bus location and provides accurate wait time predictions for all LTA bus stops.

build just the front end for now, i will include the backend connection later.
```

---

### Prompt 2: First Git Push
```text
git push https://<GITHUB_TOKEN>@github.com/veldalim/bus-arrival-LTA.git
```

---

### Prompt 3: Serverless LTA DataMall Connection
```text
add a serverless connection that pulls live data from LTA Datamall using the following endpoints:

- store this in /api folder (project root level) not the src folder
- include /health.ts and /busarrival.ts within that subfolder
- do not hardcode any key, i will include them later

GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139
# AccountKey: <LTA_ACCOUNT_KEY>
# accept: application/json
```

---

### Prompt 4: Second Git Push
```text
git push https://<GITHUB_TOKEN>@github.com/veldalim/bus-arrival-LTA.git
```

---

### Prompt 5: Collate Prompts
```text
collate the prompts written thus far and store in file name prompt.md
```
