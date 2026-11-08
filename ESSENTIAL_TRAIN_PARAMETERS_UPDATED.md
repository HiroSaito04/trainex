# Essential Train Parameters and Simulator Requirements

TRAINEX — coding baseline, November 2026.

## 1. Performance

| Parameter | Value | Implementation |
|---|---:|---|
| Maximum operating speed | 120 km/h | Enforce simulated speed cap |
| Maximum acceleration (0–30 km/h) | +0.916667 m/s² | P4 nominal target |
| Maximum service deceleration | −1.166667 m/s² | B7 nominal target |
| Emergency deceleration | −1.305556 m/s² | EB nominal target |
| Maximum jerk | 1.1 m/s³ | Acceleration/service braking; emergency excluded |
| Full service brake application | 1.5 s | Performance requirement |
| Emergency application | ≤1.5 s | Performance requirement |
| Full service release | 2.0 s | Performance requirement |
| Emergency release | 3.0 s | Release interval modeled; separate release action |

The source does **not** establish a traction-force curve above 30 km/h. The prototype's continued acceleration above 30 km/h is provisional, not certified train performance. The current code approximates service brake response with the jerk-limited approach; it does not independently simulate pneumatic cylinder pressure curves.

## 2. Master handle

| Position | Target acceleration (m/s²) |
|---|---:|
| P1 | +0.229167 |
| P2 | +0.458333 |
| P3 | +0.687500 |
| P4 | +0.916667 |
| N | 0.000000 |
| B1 | −0.166667 |
| B2 | −0.333333 |
| B3 | −0.500000 |
| B4 | −0.666667 |
| B5 | −0.833333 |
| B6 | −1.000000 |
| B7 | −1.166667 |
| EB | −1.305556 |

## 3. Required functional behaviors

| Feature | TRAINEX behavior |
|---|---|
| Door enabler | Select LEFT or RIGHT before opening. Stops, neutral and side selection are required. |
| Left/right door controls | Independently open and close selected sides; block traction until both sides confirmed closed. |
| TMS / TCMS door graphics | Above train drawing = LEFT; below drawing = RIGHT; white=closed, yellow=open/moving, red=fault. |
| All Doors Closed | Indicates both left and right door groups are closed. |
| All Doors Open | Indicates both sides fully open. |
| Emergency braking | Selected by EB master detent or security brake cap. |
| Emergency brake **release** | Not a reset button: request after standstill with master N, and simulate 3-second release time. |
| Vigilance | **Removed** from the active TRAINEX simulation in this revision. Existing label remains only in uploaded SVG artwork. |
| Interactive TMS | Show speed, master handle, doors, emergency state and currently valid indicators. |
| Hardware page | Start/resume/reset/end shared session; side-select door enabler and pair ESP32 via authenticated relay. |

## 4. References

[1] NSCR CP NS-02 Rolling Stock Technical Requirements, p.185 and relevant sections: https://ps-philgeps.gov.ph/home/images/BAC/ForeignAssitedProjects/2020/PB20-023-4/2.%20CP%20NS-02%20BD%20Volume%202%20Part%202%20SOW%20ERG%20ERT_Ver.%206.pdf

[2] NSCR cab layout reference: https://www.facebook.com/100044391550884/posts/1685240459632323/

[3] TCMS display reference: https://docs.google.com/document/d/1nSkSMU2nCi3O_SS8vCCCDtI6KcsIhf2Wh3oJL8ZOae4/edit

Reference URLs reproduced from prior specification materials and not independently reverified here.
