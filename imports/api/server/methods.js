import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { Email } from 'meteor/email';
import { TAPi18n } from 'meteor/tap:i18n';

import { genesisTransaction } from '/imports/api/transactions/transaction';
import { Contracts } from '/imports/api/contracts/Contracts';
import { getTime } from '/imports/api/time';
import { logUser, log } from '/lib/const';
import { notifierHTML } from '/imports/api/notifier/notifierTemplate.js';

Meteor.methods({
  /**
  * @summary sends email verififcation
  * @return {Object} email content
  */
  sendVerificationLink() {
    const userId = Meteor.userId();
    log(`{ method: 'sendVerificationLink', user: ${logUser()} }`);
    if (userId) {
      return Accounts.sendVerificationEmail(userId);
    }
    return false;
  },

  /**
  * @summary sends email
  * @param {string} toId userId receiving message
  * @param {string} fromId userId sending message
  * @param {string} story title of emails
  * @param {object} transaction votes transacted
  * @return {Object} email content
  */
  sendNotification(toId, fromId, story, transaction) {
    // Make sure that all arguments are strings.
    check([toId, fromId, story], [String]);
    check(transaction, Object);

    log(`{ method: 'sendEmail', user: ${logUser()}, story: '${story}' }`);
    console.log(toId);
    console.log(fromId);
    console.log(transaction);
    let receiver;
    let subject;
    let text;
    let html;
    const contract = Contracts.findOne({ _id: transaction.contractId });

    switch (story) {
      case 'DELEGATION':
        subject = `${TAPi18n.__('email-received-delegation-by')}`;
        receiver = Meteor.users.findOne({ _id: toId });
        break;
      case 'REVOKE':
        subject = `${TAPi18n.__('email-revoked-votes-by')}`;
        break;
      case 'VOTE':
        subject = `${TAPi18n.__('email-voted-your-proposal-by')}`;
        subject = subject.replace('<title>', `'${contract.title.substring(0, 30)}...'`);
        receiver = Meteor.users.findOne({ _id: contract.signatures[0]._id });
        break;
      default:
        break;
    }
    const sender = Meteor.users.findOne({ _id: fromId });
    const to = receiver.emails[0].address;
    const from = `${Meteor.settings.public.Collective.name} <${Meteor.settings.public.Collective.emails[0].address}>`;

    subject = subject.replace('<user>', `@${sender.username}`);

    if (transaction.input.quantity === 1) {
      subject = subject.replace('<quantity>', `${transaction.input.quantity} ${TAPi18n.__('vote').toLowerCase()}`);
    } else {
      subject = subject.replace('<quantity>', `${transaction.input.quantity} ${TAPi18n.__('votes').toLowerCase()}`);
    }

    if (contract) {
      text = `Go here: ${contract.url}`;
    }

    html = notifierHTML;

    // Let other method calls from the same client start running, without
    // waiting for the email sending to complete.
    this.unblock();

    Email.send({ to, from, subject, text, html });
  },

  /**
  * @summary gives user subsidy with inital tokens
  */
  subsidizeUser() {
    log(`{ method: 'subsidizeUser', user: ${logUser()} }`);
    genesisTransaction(Meteor.user()._id);
  },


  /**
  * @summary given a keyword returns contract id
  * @param {keyword} keyword identify contract by given keyword
  */
  getContract(keyword) {
    check(keyword, String);

    log(`{ method: 'getContract', user: ${logUser()}, keyword: '${keyword}' }`);
    return Contracts.findOne({ keyword });
  },

  /**
  * @summary given a keyword returns contract id
  * @param {keyword} keyword identify contract by given keyword
  */
  getContractById(contractId) {
    check(contractId, String);

    log(`{ method: 'getContractById', user: ${logUser()}, _id: '${contractId}' }`);
    return Contracts.findOne({ _id: contractId });
  },

  /**
  * @summary given a username returns user Id
  * @param {string} keyword identify contract by given keyword
  */
  getUser(username) {
    check(username, String);

    log(`{ method: 'getUser', user: ${logUser()}, keyword: '${username}' }`);
    const user = Meteor.users.findOne({ username });
    return {
      _id: user._id,
      username: user.username,
      profile: user.profile,
    };
  },

  /**
  * @summary returns the quantity of replies in a contract
  * @param {string} contractId contract to search replies for
  */
  countReplies(contractId) {
    check(contractId, String);

    log(`{ method: 'countReplies', user: ${logUser()}, contractId: '${contractId}' }`);
    return Contracts.find({ replyId: contractId }).count();
  },

  /**
  * @summary reports server time from server to client
  * @return {Date} time
  */
  getServerTime() {
    // log(`{ method: 'getServerTime', user: ${logUser()} }`);
    return getTime();
  },

  /**
  * @summary counts the total items on a collection.
  * @return {Number} total count.
  */
  feedCount(query, options) {
    check(query, Object);
    check(options, Object);

    const count = Contracts.find(query, options).count();
    log(`{ method: 'feedCount', user: ${logUser()}, count: ${count} }`);
    return count;
  },

  /**
  * @summary counts the total users on the collective
  * @return {Number} total count.
  */
  userCount() {
    const count = Meteor.users.find().count();
    log(`{ method: 'userCount', user: ${logUser()}, count: ${count} }`);
    return count;
  },
});
