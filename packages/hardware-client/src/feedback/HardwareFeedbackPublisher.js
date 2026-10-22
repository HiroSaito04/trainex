import {makeHardwareFeedback} from '@trainex/contracts';
export class HardwareFeedbackPublisher {
  constructor({send}){this.send=send}
  publish(state,sessionId){if(!sessionId)return false;this.send({...makeHardwareFeedback(state.display??state),sessionId});return true}
}
