# TRAINEX Training Module — cab operation exercises

Eight scenario JSON files teach cab controls, neutral, traction, coasting, service braking, stopping, door closure and emergency braking. Each includes a learning objective, operating conditions, expected observations, debrief questions and executable simulation steps.

`expect` is used by the existing training evaluator and must stay aligned to Simulation Engine state/command contracts. `learningObjective`, `operatingConditions`, `expectedObservations` and `debriefQuestions` are teaching content; they do not affect scenario scoring.

The browser scenario checklist remains manual review. It is **not** proof of automatically assessed competence. These exercises are illustrative and not operating authority for a real train.

```sh
npm run test --workspace=@trainex/training-module
```
