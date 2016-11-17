import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './contract.html';
import '../title/title.js';
import '../agreement/agreement.js';
import '../semantics/semantics.js';
import '../signatures/signatures.js';
import '../vote/vote.js';
import '../ballot/ballot.js';
import '../action/action.js';
import '../results/results.js';
import '../agora/agora.js';

Template.contract.helpers({
  editorMode() {
    if (Session.get('contract')) {
      return (Session.get('contract').stage === STAGE_DRAFT);
    }
    return undefined;
  },
  isDelegation() {
    if (Session.get('contract')) {
      return (Session.get('contract').kind === KIND_DELEGATION);
    }
    return undefined;
  },
  pollClosed() {
    if (Session.get('contract')) {
      return (Session.get('contract').stage === STAGE_FINISH);
    }
    return undefined;
  },
  ballotToggle: function () {
    if (Session.get('contract')) {
      if (Session.get('contract').ballotEnabled === false) {
        return 'paper-empty';
      }
    }
  }
})
