import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { query } from '/lib/views';
import { Contracts } from '/imports/api/contracts/Contracts';
import { createContract } from '/imports/startup/both/modules/Contract';

import '/imports/ui/templates/widgets/feed/feed.html';
import '/imports/ui/templates/widgets/feed/feedItem.js';
import '/imports/ui/templates/widgets/feed/feedEmpty.js';
import '/imports/ui/templates/widgets/feed/feedLoad.js';

/**
* @summary remove delegations without votes left
* @param {object} feed the query from db
*/
const _sanitize = (feed) => {
  return _.filter(feed, (value) => { return ((value.kind === 'DELEGATION' && value.wallet.available > 0) || (value.kind !== 'DELEGATION')); });
};

Template.feed.onCreated(function () {
  Template.instance().count = new ReactiveVar(0);
  Template.instance().feed = new ReactiveVar();
  Template.instance().refresh = new ReactiveVar(false);
  Template.currentData().singlePost = false;
});

Template.feed.onRendered(function () {
  const instance = this;
  instance.autorun(function (computation) {
    const subscription = instance.subscribe('feed', Template.currentData().options);
    const count = instance.subscribe('feedCount', Template.currentData().options);
    const parameters = query(Template.currentData().options);

    // verify if beginning
    const beginning = ((Template.currentData().options.skip === 0) && !instance.feed.get());
    if (beginning) { $('.right').scrollTop(0); }
    instance.refresh.set(beginning);
    instance.data.singlePost = (instance.data.options.view === 'post');

    // total items on the feed
    if (count.ready()) {
      instance.count.set(Counts.get('feedItems'));
    }

    // feed content
    if (subscription.ready()) {
      const feed = Contracts.find(parameters.find, parameters.options).fetch();
      if (!instance.feed.get() || instance.feed.get().length !== feed.length) {
        instance.feed.set(_sanitize(feed));
      }
      instance.refresh.set(false);
    }

    if (Meteor.user()) {
      const draft = instance.subscribe('contractDrafts', { view: 'contractByKeyword', keyword: `draft-${Meteor.userId()}` });
      if (draft.ready()) {
        const draftContract = Contracts.findOne({ keyword: `draft-${Meteor.userId()}` });
        if (draftContract) {
          Session.set('draftContract', draftContract);
        } else {
          Session.set('draftContract', createContract());
        }
      }
    }
  });
});

Template.feed.helpers({
  item() {
    return Template.instance().feed.get();
  },
  refresh() {
    return Template.instance().refresh.get();
  },
  beginning() {
    return (Template.currentData().options.skip === 0);
  },
  single() {
    return Template.currentData().singlePost;
  },
  emptyContent() {
    return Session.get('emptyContent');
  },
  count() {
    return Template.instance().count.get();
  },
  placeholderItem() {
    return [1, 2, 3, 4, 5];
  },
});
