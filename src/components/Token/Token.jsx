import React from 'react';
import BigNumber from 'bignumber.js/bignumber';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { config } from 'config'
import web3 from 'web3';

import 'styles/Dapp.css';

const numeral = require('numeral');

const _check404 = (image_url) => {
  try {
    var http = new XMLHttpRequest();
    http.open('HEAD', image_url, false);
    http.send();
    return http.status !== 404;
  } catch (e) {
    console.clear();
  }
}

/**
* @summary renders a post in the timeline
*/
const Token = (props) => {
  const zeroes = (!props.decimals) ? 0 : Number(props.decimals);
  const balance = numeral(new BigNumber(props.quantity).dividedBy(Math.pow(10, zeroes)).toNumber()).format('0,0.[00]');

  let imageExists = false;
  let image;
  if (props.publicAddress) {
    image = `${config.web.icons.replace('{{publicAddress}}', web3.utils.toChecksumAddress(props.publicAddress))}`;
    imageExists = _check404(image);
  }

  return (
    <div className="token">
      <Link to={`/token/${props.symbol}`} className="token-ticker" onClick={(e) => { e.stopPropagation(); }}>
        {(props.publicAddress && imageExists) ?
          <img className="token-icon" src={image} alt="" />
          :
          null
        }
        {props.symbol}
      </Link>
      <div className="token-balance">
        <div className="token-score">
          {balance}
        </div>
      </div>
    </div>
  );
};

Token.propTypes = {
  quantity: PropTypes.string,
  publicAddress: PropTypes.string,
  symbol: PropTypes.string,
  decimals: PropTypes.string,
};

export default Token;
